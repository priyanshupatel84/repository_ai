// import { type NextRequest, NextResponse } from "next/server";
// import { getServerSession, type Session } from "next-auth";
// import db from "@/lib/db";
// import { indexGithubRepo, loadGithubRepo } from "@/lib/github-loader";
// import { pollCommits } from "@/lib/github";
// import { authOptions } from "@/lib/auth";
// import { createProjectSchema } from "@/lib/validation";
// import { rateLimit } from "@/lib/rate-limit";

// export async function POST(req: NextRequest) {
//   try {
//     // Rate limiting
//     const rateLimitResult = await rateLimit(req, 10); // 10 requests per minute
//     if (!rateLimitResult.success) {
//       return NextResponse.json(
//         { error: "Too many requests. Please try again later." },
//         {
//           status: 429,
//           headers: {
//             "X-RateLimit-Limit": rateLimitResult.limit.toString(),
//             "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
//             "X-RateLimit-Reset": rateLimitResult.reset.toISOString(),
//           },
//         }
//       );
//     }

//     const session = (await getServerSession(authOptions)) as Session | null;

//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { error: "Unauthorized. Please sign in to continue." },
//         { status: 401 }
//       );
//     }

//     const body = await req.json();
//     const validationResult = createProjectSchema.safeParse(body);

//     if (!validationResult.success) {
//       return NextResponse.json(
//         {
//           error: "Invalid input data",
//           details: validationResult.error.errors,
//         },
//         { status: 400 }
//       );
//     }

//     const { projectName, repoUrl, githubToken, branchName } =
//       validationResult.data;

//     const cleanedGithubToken = githubToken?.trim();
//     const sessionToken = session?.user?.githubAccessToken?.trim();
//     const envToken = process.env.GITHUB_TOKEN?.trim();

//     // Determine final GitHub token to use
//     const finalGithubToken = cleanedGithubToken || sessionToken || envToken;

//     console.log("Token sources:", {
//       providedToken: !!cleanedGithubToken,
//       sessionToken: !!sessionToken,
//       envToken: !!envToken,
//       finalToken: !!finalGithubToken,
//     });

//     // Check if project with same name already exists for this user
//     const existingProject = await db.project.findFirst({
//       where: {
//         projectName,
//         userToProjects: {
//           some: {
//             userId: session.user.id,
//           },
//         },
//         deletedAt: null,
//       },
//     });

//     if (existingProject) {
//       return NextResponse.json(
//         {
//           error:
//             "A project with this name already exists. Please choose a different name.",
//         },
//         { status: 409 }
//       );
//     }

//     console.log("Creating project:", {
//       projectName,
//       repoUrl,
//       branchName,
//       finalGithubToken,
//     });

//     // Try to load the repo and check for large repo BEFORE creating the project in DB
//     try {
//       // This will throw if repo is too large or any error occurs
//       await loadGithubRepo(repoUrl, finalGithubToken, branchName);
      
//     } catch (repoError) {
//       // If error is about large repo, return 413 (Payload Too Large)
//       const errorMessage = repoError instanceof Error ? repoError.message : String(repoError);
//       if (errorMessage.includes("Repository is too large")) {
//         return NextResponse.json(
//           { error: errorMessage },
//           { status: 413 }
//         );
//       }
//       // Other errors
//       return NextResponse.json(
//         { error: errorMessage },
//         { status: 400 }
//       );
//     }

//     // Only create project if repo is not too large
//     const project = await db.project.create({
//       data: {
//         githubUrl: repoUrl.replace(/\/$/, ""), // Remove trailing slash
//         projectName: projectName.trim(),
//         branchName: branchName?.trim(),
//         status: "loading",
//         userToProjects: {
//           create: {
//             userId: session.user.id,
//           },
//         },
//       },
//     });

//     // Process repository synchronously and return 200 only when done
//     try {
//       await processRepositoryAsync(
//         project.id,
//         repoUrl,
//         branchName,
//         finalGithubToken
//       );
      
//       await db.project.update({
//         where: { id: project.id },
//         data: { status: "ready" },
//       });

//       return NextResponse.json(
//         {
//           project: {
//             id: project.id,
//             projectName: project.projectName,
//             status: "ready", // or project.status if you update it
//             githubUrl: project.githubUrl,
//           },
//           message: "Project created and fully processed.",
//         },
//         { status: 200 }
//       );
//     } catch (processingError) {
//       // Optionally update project status to 'error'
//       await db.project.update({
//         where: { id: project.id },
//         data: { status: "error" },
//       });
//       return NextResponse.json(
//         {
//           error: "Project created but processing failed.",
//           details:
//             processingError instanceof Error
//               ? processingError.message
//               : processingError,
//         },
//         { status: 500 }
//       );
//     }
//   } catch (error) {
//     console.error("Error in createProject API:", error);

//     if (error instanceof Error) {
//       // Handle specific error types
//       if (error.message.includes("rate limit")) {
//         return NextResponse.json(
//           {
//             error:
//               "GitHub API rate limit hit. Please provide a GitHub token or try again later.",
//           },
//           { status: 429 }
//         );
//       }

//       if (
//         error.message.includes("Not Found") ||
//         error.message.includes("404")
//       ) {
//         return NextResponse.json(
//           {
//             error:
//               "Repository not found. Please check the URL and ensure the repository is public or you have access.",
//           },
//           { status: 404 }
//         );
//       }

//       if (
//         error.message.includes("Forbidden") ||
//         error.message.includes("403")
//       ) {
//         return NextResponse.json(
//           {
//             error:
//               "Access denied. The repository may be private or require authentication.",
//           },
//           { status: 403 }
//         );
//       }
//     }

//     return NextResponse.json(
//       {
//         error:
//           "An unexpected error occurred while creating the project. Please try again.",
//       },
//       { status: 500 }
//     );
//   }
// }

// // Process repository asynchronously
// async function processRepositoryAsync(
//   projectId: string,
//   githubUrl: string,
//   branchName: string,
//   finalGithubToken?: string
// ) {
//   try {
//     // Process repository and commits
//     await indexGithubRepo(projectId, githubUrl, branchName, finalGithubToken);
//     await pollCommits(projectId, 1, finalGithubToken);

//     // Update project status to ready
//     await db.project.update({
//       where: { id: projectId },
//       data: { status: "ready" },
//     });
//     console.log(`Project ${projectId} processed successfully`);
//   } catch (error) {
//     console.error(`Error processing project ${projectId}:`, error);

//     // Update project status to error
//     await db.project
//       .update({
//         where: { id: projectId },
//         data: { status: "error" },
//       })
//       .catch(console.error);
//   }
// }



import { type NextRequest, NextResponse } from "next/server";
import { getServerSession, type Session } from "next-auth";
import db from "@/lib/db";
import { indexGithubRepo } from "@/lib/github-loader";
import { pollCommits } from "@/lib/github";
import { authOptions } from "@/lib/auth";
import { createProjectSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { Octokit } from "octokit";

// Helper function to parse GitHub URL
const parseGitHubUrl = (url: string) => {
  try {
    const cleanedUrl = url.replace(/\.git$/, "").replace(/\/$/, "")

    let match
    if (cleanedUrl.includes("github.com/")) {
      match = cleanedUrl.match(/github\.com[/:]([^/]+)\/([^/#?]+)/)
    } else {
      throw new Error("Invalid GitHub URL format")
    }

    if (!match) throw new Error("Invalid GitHub URL format")

    const owner = match[1]
    const repo = match[2].split("/tree/")[0] // Remove tree/branch part if present

    if (!owner || !repo || owner.length === 0 || repo.length === 0) {
      throw new Error("Invalid repository owner or name")
    }

    return { owner, repo }
  } catch (error) {
    console.error("Error parsing GitHub URL:", error)
    throw new Error("Invalid GitHub URL format. Please use: https://github.com/username/repository")
  }
}

// Function to validate repository and check file count
async function validateRepository(repoUrl: string, githubToken?: string, branchName?: string) {
  const { owner, repo } = parseGitHubUrl(repoUrl);
  const client = new Octokit({ auth: githubToken });

  // Verify repository exists and get default branch if needed
  try {
    const { data } = await client.rest.repos.get({ owner, repo });

    // If no branch specified, use default branch
    if (!branchName) {
      branchName = data.default_branch;
      console.log("Using default branch:", branchName);
    }
  } catch (repoError: unknown) {
    if (
      typeof repoError === "object" &&
      repoError !== null &&
      "status" in repoError
    ) {
      const status = (repoError as { status?: number }).status;
      const message = (repoError as { message?: string }).message;
      if (status === 404) {
        throw new Error(
          "Repository not found. Please check the URL and ensure the repository exists and is accessible."
        );
      } else if (status === 403) {
        throw new Error("Access denied. The repository may be private or require authentication.");
      } else {
        throw new Error(`Failed to access repository: ${message}`);
      }
    } else {
      throw new Error("Failed to access repository: Unknown error");
    }
  }

  // Verify branch exists
  if (branchName) {
    try {
      await client.rest.repos.getBranch({ owner, repo, branch: branchName });
    } catch (branchError: unknown) {
      if (
        typeof branchError === "object" &&
        branchError !== null &&
        "status" in branchError
      ) {
        const status = (branchError as { status?: number }).status;
        if (status === 404) {
          throw new Error(`Branch '${branchName}' not found. Available branches can be checked on the repository page.`);
        }
        console.warn("Branch verification failed, proceeding anyway");
      }
    }
  }

  // Count files in the repository
  let fileCount = 0;
  try {
    const { data: branchData } = await client.rest.repos.getBranch({ owner, repo, branch: branchName });
    const commitSha = branchData.commit.sha;
    
    const { data: treeData } = await client.rest.git.getTree({
      owner,
      repo,
      tree_sha: commitSha,
      recursive: "true",
    });
    
    fileCount = (treeData.tree || []).filter((item) => item.type === "blob").length;
    
    // Updated file limit to 60
    if (fileCount > 60) {
      throw new Error(`Repository is too large (${fileCount} files found, maximum 60 allowed). Please select a smaller repository.`);
    }
  } catch (countError) {
    if (countError instanceof Error && countError.message.includes("Repository is too large")) {
      throw countError; // Re-throw the file count error
    }
    console.error("Error counting files in repo:", countError);
    throw new Error("Failed to count files in the repository. Please try again or select a different repository.");
  }

  return { owner, repo, branchName, fileCount };
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req, 10); // 10 requests per minute
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
        }
      );
    }

    const session = (await getServerSession(authOptions)) as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to continue." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validationResult = createProjectSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid input data",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { projectName, repoUrl, githubToken, branchName } =
      validationResult.data;

    const cleanedGithubToken = githubToken?.trim();
    const sessionToken = session?.user?.githubAccessToken?.trim();
    const envToken = process.env.GITHUB_TOKEN?.trim();

    // Determine final GitHub token to use
    const finalGithubToken = cleanedGithubToken || sessionToken || envToken;

    console.log("Validating repository before creating project:", {
      projectName,
      repoUrl,
      branchName,
    });

    // CRITICAL: Validate repository and check file count BEFORE any database operations
    let validationResult_repo;
    try {
      validationResult_repo = await validateRepository(repoUrl, finalGithubToken, branchName);
      console.log(`✅ Repository validation passed: ${validationResult_repo.fileCount} files found (limit: 60)`);
      
    } catch (repoError) {
      const errorMessage = repoError instanceof Error ? repoError.message : String(repoError);
      
      console.log(`❌ Repository validation failed: ${errorMessage}`);
      
      // If error is about large repo, return 413 (Payload Too Large)
      if (errorMessage.includes("Repository is too large")) {
        return NextResponse.json(
          { error: errorMessage },
          { status: 413 }
        );
      }

      // Other validation errors (404, 403, etc.)
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    // Check if project with same name already exists for this user
    // (Only check this AFTER repository validation passes)
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
    });

    if (existingProject) {
      return NextResponse.json(
        {
          error:
            "A project with this name already exists. Please choose a different name.",
        },
        { status: 409 }
      );
    }

    console.log("✅ All validations passed. Creating project in database:", {
      projectName,
      repoUrl,
      branchName,
      fileCount: validationResult_repo.fileCount,
    });

    // Only create project if ALL validations pass (repository + file count + name uniqueness)
    const project = await db.project.create({
      data: {
        githubUrl: repoUrl.replace(/\/$/, ""), // Remove trailing slash
        projectName: projectName.trim(),
        branchName: branchName?.trim(),
        status: "loading",
        userToProjects: {
          create: {
            userId: session.user.id,
          },
        },
      },
    });

    console.log(`✅ Project created in database with ID: ${project.id}`);

    // Process repository synchronously and return 200 only when done
    try {
      console.log(`🔄 Starting repository processing for project: ${project.id}`);
      
      await processRepositoryAsync(
        project.id,
        repoUrl,
        branchName,
        finalGithubToken
      );
      
      await db.project.update({
        where: { id: project.id },
        data: { status: "ready" },
      });

      console.log(`✅ Project ${project.id} fully processed and ready`);

      return NextResponse.json(
        {
          project: {
            id: project.id,
            projectName: project.projectName,
            status: "ready",
            githubUrl: project.githubUrl,
            fileCount: validationResult_repo.fileCount,
          },
          message: "Project created and fully processed.",
        },
        { status: 200 }
      );
    } catch (processingError) {
      console.error(`❌ Processing failed for project ${project.id}:`, processingError);
      
      // Update project status to 'error'
      await db.project.update({
        where: { id: project.id },
        data: { status: "error" },
      });

      // await db.project.delete({
      //   where: { id: project.id },
      // });
      
      const errorMessage = processingError instanceof Error ? processingError.message : String(processingError);
      return NextResponse.json(
        {
          error: "Project created but processing failed.",
          details: errorMessage,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in createProject API:", error);

    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          {
            error:
              "GitHub API rate limit hit. Please provide a GitHub token or try again later.",
          },
          { status: 429 }
        );
      }

      if (
        error.message.includes("Not Found") ||
        error.message.includes("404")
      ) {
        return NextResponse.json(
          {
            error:
              "Repository not found. Please check the URL and ensure the repository is public or you have access.",
          },
          { status: 404 }
        );
      }

      if (
        error.message.includes("Forbidden") ||
        error.message.includes("403")
      ) {
        return NextResponse.json(
          {
            error:
              "Access denied. The repository may be private or require authentication.",
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        error:
          "An unexpected error occurred while creating the project. Please try again.",
      },
      { status: 500 }
    );
  }
}

// Process repository asynchronously
async function processRepositoryAsync(
  projectId: string,
  githubUrl: string,
  branchName: string,
  finalGithubToken?: string
) {
  try {
    // Process repository and commits
    await indexGithubRepo(projectId, githubUrl, branchName, finalGithubToken);
    await pollCommits(projectId, 1, finalGithubToken);

    console.log(`Project ${projectId} processed successfully`);

  } catch (error) {
    console.error(`Error processing project ${projectId}:`, error);
    throw error;
  }
}