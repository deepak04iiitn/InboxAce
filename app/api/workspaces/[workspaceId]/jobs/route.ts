import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

// GET - Get all jobs in workspace
export async function GET(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
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

    const jobs = await prisma.job.findMany({
      where: {
        workspaceId: params.workspaceId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        template: true,
        comments: {
          orderBy: {
            createdAt: "desc",
          },
        },
        emails: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      jobs,
    });
  } catch (error: any) {
    console.error("Error fetching workspace jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs", message: error.message },
      { status: 500 }
    );
  }
}

// POST - Create job in workspace
export async function POST(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
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

    const jobData = await req.json();

    // Create job
    const job = await prisma.job.create({
      data: {
        ...jobData,
        userId: user.id,
        workspaceId: params.workspaceId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        template: true,
      },
    });

    // Update member stats
    await prisma.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId: params.workspaceId,
          userId: user.id,
        },
      },
      data: {
        leadsAdded: { increment: 1 },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        action: "WORKSPACE_JOB_CREATED",
        description: `Added job for ${job.company} in workspace`,
        metadata: {
          workspaceId: params.workspaceId,
          jobId: job.id,
        },
      },
    });

    return NextResponse.json({
      success: true,
      job,
      message: "Job created successfully",
    });
  } catch (error: any) {
    console.error("Error creating workspace job:", error);
    return NextResponse.json(
      { error: "Failed to create job", message: error.message },
      { status: 500 }
    );
  }
}
