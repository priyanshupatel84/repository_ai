import { type NextRequest, NextResponse } from "next/server"
import { getServerSession, type Session } from "next-auth"
import db from "@/lib/db"
import { indexGithubRepo } from "@/lib/github-loader"
import { pollCommits } from "@/lib/github"
import { authOptions } from "@/lib/auth"
import { createProjectSchema } from "@/lib/validation"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req, 10) // 10 requests per minute
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toISOString(),
          },
        },
      )
    }

    const session = (await getServerSession(authOptions)) as Session | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to continue." }, { status: 401 })
    }

    const body = await req.json()
    
    const validationResult = createProjectSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid input data",
          details: validationResult.error.errors,
        },
        { status: 400 },
      )
    }

    const { projectName, repoUrl, githubToken, branchName } = validationResult.data

    // Check if project with same name already exists for this user
    const existingProject = await db.project.findFirst({
      where: {
        projectName,
        userToProjects: {
          some: {
            userId: session.user.id,
          },
        },
        deletedAt: null,
      },
    })

    if (existingProject) {
      return NextResponse.json(
        { error: "A project with this name already exists. Please choose a different name." },
        { status: 409 },
      )
    }

    console.log("Creating project:", { projectName, repoUrl, branchName })

    // Create project with loading status
    const project = await db.project.create({
      data: {
        githubUrl: repoUrl.replace(/\/$/, ""), // Remove trailing slash
        projectName: projectName.trim(),
        branchName: branchName?.trim() || null,
        status: "loading",
        userToProjects: {
          create: {
            userId: session.user.id,
          },
        },
      },
    })

    // Process repository synchronously and return 200 only when done
    try {
      await processRepositoryAsync(project.id, repoUrl, githubToken, branchName)
      // Optionally, you can update the project status to 'ready' here if needed
      await db.project.update({ where: { id: project.id }, data: { status: "ready" } })

      return NextResponse.json(
        {
          project: {
            id: project.id,
            projectName: project.projectName,
            status: "ready", // or project.status if you update it
            githubUrl: project.githubUrl,
          },
          message: "Project created and fully processed.",
        },
        { status: 200 },
      )
    } catch (processingError) {
      // Optionally update project status to 'error'
      await db.project.update({ where: { id: project.id }, data: { status: "error" } })
      return NextResponse.json(
        {
          error: "Project created but processing failed.",
          details: processingError instanceof Error ? processingError.message : processingError,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in createProject API:", error)

    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "GitHub API rate limit hit. Please provide a GitHub token or try again later." },
          { status: 429 },
        )
      }

      if (error.message.includes("Not Found") || error.message.includes("404")) {
        return NextResponse.json(
          {
            error: "Repository not found. Please check the URL and ensure the repository is public or you have access.",
          },
          { status: 404 },
        )
      }

      if (error.message.includes("Forbidden") || error.message.includes("403")) {
        return NextResponse.json(
          { error: "Access denied. The repository may be private or require authentication." },
          { status: 403 },
        )
      }
    }

    return NextResponse.json(
      { error: "An unexpected error occurred while creating the project. Please try again." },
      { status: 500 },
    )
  }
}

// Process repository asynchronously
async function processRepositoryAsync(projectId: string, githubUrl: string, githubToken?: string, branchName?: string) {
  try {
    // Process repository and commits
    await indexGithubRepo(projectId, githubUrl, githubToken, branchName)
    await pollCommits(projectId, 1, githubToken)

    // Update project status to ready
    await db.project.update({
      where: { id: projectId },
      data: { status: "ready" },
    })
    console.log(`Project ${projectId} processed successfully`)

  } catch (error) {
    console.error(`Error processing project ${projectId}:`, error)

    // Update project status to error
    await db.project
      .update({
        where: { id: projectId },
        data: { status: "error" },
      })
      .catch(console.error)
  }
}
