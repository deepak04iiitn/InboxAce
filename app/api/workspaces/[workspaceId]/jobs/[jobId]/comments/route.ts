import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

// GET - Get all comments for a job
export async function GET(
  req: NextRequest,
  { params }: { params: { workspaceId: string; jobId: string } }
) {
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

    // Check if user is a member
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: params.workspaceId,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this workspace" },
        { status: 403 }
      );
    }

    const comments = await prisma.jobComment.findMany({
      where: {
        jobId: params.jobId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      comments,
    });
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments", message: error.message },
      { status: 500 }
    );
  }
}

// POST - Add comment to job
export async function POST(
  req: NextRequest,
  { params }: { params: { workspaceId: string; jobId: string } }
) {
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

    // Check if user is a member
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: params.workspaceId,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this workspace" },
        { status: 403 }
      );
    }

    const { comment } = await req.json();

    if (!comment || comment.trim() === "") {
      return NextResponse.json(
        { error: "Comment cannot be empty" },
        { status: 400 }
      );
    }

    // Verify job belongs to workspace
    const job = await prisma.job.findFirst({
      where: {
        id: params.jobId,
        workspaceId: params.workspaceId,
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found in this workspace" },
        { status: 404 }
      );
    }

    // Create comment
    const newComment = await prisma.jobComment.create({
      data: {
        jobId: params.jobId,
        userId: user.id,
        userName: user.name,
        comment: comment.trim(),
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        action: "COMMENT_ADDED",
        description: `Added comment to job in workspace`,
        metadata: {
          workspaceId: params.workspaceId,
          jobId: params.jobId,
          commentId: newComment.id,
        },
      },
    });

    return NextResponse.json({
      success: true,
      comment: newComment,
      message: "Comment added successfully",
    });
  } catch (error: any) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment", message: error.message },
      { status: 500 }
    );
  }
}
