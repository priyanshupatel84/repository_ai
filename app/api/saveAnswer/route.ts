import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession, Session } from "next-auth";
import db from "@/lib/db";
import { authOptions } from "@/lib/auth";

const saveAnswerSchema = z.object({
  projectId: z.string(),
  question: z.string(),
  answer: z.string(),
  filesReferences: z.array(
    z.object({
      fileName: z.string(),
      sourceCode: z.string(),
      summary: z.string(),
    })
  ),
});

export async function POST(req: NextRequest) {
  
  const session = await getServerSession(authOptions) as Session | null;

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const input = saveAnswerSchema.parse(body);

    const newQuestion = await db.question.create({
      data: {
        answer: input.answer,
        filesReferences: input.filesReferences,
        projectId: input.projectId,
        question: input.question,
        userId: session.user.id,
      },
    });

    return NextResponse.json(newQuestion);
  } catch (error) {
    console.error("Error saving answer:", error);
    return NextResponse.json(
      { error: "Failed to save answer" },
      { status: 500 }
    );
  }
}
