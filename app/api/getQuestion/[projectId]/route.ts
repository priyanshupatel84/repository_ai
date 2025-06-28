import { NextRequest, NextResponse } from "next/server";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

// Compatible with both direct and fetch calls
export async function GET(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Extract projectId from the URL
    const url = new URL(req.url);
    // Assumes route: /api/getQuestion/[projectId]
    const pathParts = url.pathname.split("/");
    const projectId = pathParts[pathParts.length - 1];

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const questions = await db.question.findMany({
      where: {
        projectId,
        user: {
          id: session.user.id,
        },
      },
      include: {
        user: {
          select: {
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("[GET_QUESTIONS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
