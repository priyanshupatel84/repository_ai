import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { pollCommits } from "@/lib/github";

const ITEMS_PER_PAGE = 10;

const schema = z.object({
  projectId: z.string(),
  pageNo: z.number().int().positive().default(1),
  githubToken: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const validatedData = schema.parse(body);
    const { projectId, pageNo, githubToken } = validatedData;
    
    const finalGithubToken = githubToken || process.env.GITHUB_TOKEN;

    // First, check if we have commits for this page in DB
    const existingCommits = await db.commit.findMany({
      where: { projectId: projectId },
      orderBy: { commitDate: "desc" },
      skip: (pageNo - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    });

    // If we don't have enough commits for this page, fetch from GitHub
    if (existingCommits.length < ITEMS_PER_PAGE) {
      try {
        await pollCommits(projectId, pageNo, finalGithubToken);
      } catch (error) {
        console.error("Failed to fetch new commits:", error);
        // Continue with existing commits even if fetching new ones fails
      }
    }

    // Get final paginated commits from database
    const [commits, totalCommits] = await Promise.all([
      db.commit.findMany({
        where: { projectId: projectId },
        orderBy: { commitDate: "desc" },
        skip: (pageNo - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
      }),
      db.commit.count({
        where: { projectId: projectId }
      })
    ]);

    return NextResponse.json({
      commits,
      totalCommits,
      totalPages: Math.ceil(totalCommits / ITEMS_PER_PAGE),
      currentPage: pageNo,
    });

  } catch (error) {
    console.error("Error fetching commits:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch commits" },
      { status: 500 }
    );
  }
}
