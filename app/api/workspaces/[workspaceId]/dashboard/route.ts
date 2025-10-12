import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

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

    // Get workspace with detailed stats
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.workspaceId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
        },
        jobs: {
          include: {
            emails: true,
          },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Calculate stats
    const totalJobs = workspace.jobs.length;
    const totalEmailsSent = workspace.jobs.filter(
      (j) => j.status !== "NOT_SENT" && j.status !== "SCHEDULED"
    ).length;
    const totalReplies = workspace.jobs.filter((j) => j.gotReply).length;
    const totalFollowUps = workspace.jobs.reduce(
      (sum, j) => sum + j.followUpsSent,
      0
    );

    // Member-wise stats
    const memberStats = workspace.members.map((member) => {
      const memberJobs = workspace.jobs.filter((j) => j.userId === member.userId);
      const memberSent = memberJobs.filter(
        (j) => j.status !== "NOT_SENT" && j.status !== "SCHEDULED"
      ).length;
      const memberReplies = memberJobs.filter((j) => j.gotReply).length;

      return {
        id: member.id,
        user: member.user,
        role: member.role,
        leadsAdded: member.leadsAdded,
        emailsSent: memberSent,
        repliesReceived: memberReplies,
        joinedAt: member.joinedAt,
      };
    });

    // Recent activity
    const recentJobs = workspace.jobs
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);

    // Status breakdown
    const statusBreakdown = {
      NOT_SENT: workspace.jobs.filter((j) => j.status === "NOT_SENT").length,
      SCHEDULED: workspace.jobs.filter((j) => j.status === "SCHEDULED").length,
      SENT: workspace.jobs.filter((j) => j.status === "SENT").length,
      REPLIED: workspace.jobs.filter((j) => j.status === "REPLIED").length,
      FOLLOW_UP_SENT: workspace.jobs.filter((j) => j.status === "FOLLOW_UP_SENT")
        .length,
    };

    return NextResponse.json({
      success: true,
      dashboard: {
        workspace: {
          id: workspace.id,
          name: workspace.name,
          description: workspace.description,
        },
        stats: {
          totalJobs,
          totalEmailsSent,
          totalReplies,
          totalFollowUps,
          totalMembers: workspace.members.length,
          replyRate:
            totalEmailsSent > 0
              ? ((totalReplies / totalEmailsSent) * 100).toFixed(1)
              : "0.0",
        },
        statusBreakdown,
        memberStats,
        recentJobs: recentJobs.map((job) => ({
          id: job.id,
          company: job.company,
          position: job.position,
          recipientName: job.recipientName,
          status: job.status,
          createdAt: job.createdAt,
          userId: job.userId,
        })),
      },
    });
  } catch (error: any) {
    console.error("Error fetching workspace dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard", message: error.message },
      { status: 500 }
    );
  }
}
