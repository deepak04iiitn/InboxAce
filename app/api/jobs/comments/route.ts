import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { jobId, comment } = body;

    if (!jobId || !comment) {
      return NextResponse.json(
        { error: "Job ID and comment are required" },
        { status: 400 }
      );
    }

    const jobComment = await prisma.jobComment.create({
      data: {
        jobId,
        userId: user.id,
        userName: user.name,
        comment,
      },
    });

    return NextResponse.json({ success: true, comment: jobComment });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
