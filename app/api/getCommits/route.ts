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
    const body = await req.json()
    const validatedData = schema.parse(body)
    const { projectId, pageNo, githubToken } = validatedData

    // Process commits for the requested page
    await pollCommits(projectId, pageNo, githubToken);

    // Get paginated commits from database
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
    console.error("Error fetching commits:", error); // Already present
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch commits" },
      { status: 500 }
    );
  }
}
