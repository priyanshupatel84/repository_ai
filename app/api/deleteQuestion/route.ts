// app/api/deleteQuestion/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function DELETE(req: Request) {
  try {
    const { questionId } = await req.json();

    if (!questionId) {
      return new NextResponse("Question ID required", { status: 400 });
    }

    const deletedQuestion = await db.question.delete({
      where: { id: questionId }
    });

    return NextResponse.json(deletedQuestion);
    
  } catch (error) {
    console.error("[DELETE_QUESTION_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    );
  }
}
