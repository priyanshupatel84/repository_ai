import { NextRequest, NextResponse } from "next/server";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { z } from "zod";


const deleteSchema = z.object({
  projectId: z.string()
});

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions) as Session | null;
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const { projectId } = deleteSchema.parse(body);

    // Delete related records in transaction
    await db.$transaction([
      db.commit.deleteMany({ where: { projectId } }),
      db.sourceCodeEmbedding.deleteMany({ where: { projectId } }),
      db.question.deleteMany({ where: { projectId } }),
      db.userToProject.deleteMany({ where: { projectId } })
    ]);

    // Delete main project
    await db.project.delete({
      where: { id: projectId }
    });


    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting project:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to delete project"
      }),
      { status: 500 }
    );
  }
}
