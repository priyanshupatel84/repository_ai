import { NextRequest, NextResponse } from "next/server";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { projectId } = await params;

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
