import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
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

    // Get all workspaces where user is a member
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
        isActive: true,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
        _count: {
          select: {
            jobs: true,
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get user's role in each workspace
    const workspacesWithRole = workspaces.map((workspace) => {
      const userMember = workspace.members.find((m) => m.userId === user.id);
      return {
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
        owner: workspace.owner,
        isOwner: workspace.ownerId === user.id,
        userRole: userMember?.role || "CONTRIBUTOR",
        totalEmailsSent: workspace.totalEmailsSent,
        totalReplies: workspace.totalReplies,
        totalOpportunities: workspace.totalOpportunities,
        memberCount: workspace._count.members,
        jobCount: workspace._count.jobs,
        members: workspace.members.map((m) => ({
          id: m.id,
          user: m.user,
          role: m.role,
          leadsAdded: m.leadsAdded,
          emailsSent: m.emailsSent,
          joinedAt: m.joinedAt,
        })),
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      };
    });

    return NextResponse.json({
      success: true,
      workspaces: workspacesWithRole,
    });
  } catch (error: any) {
    console.error("Error fetching workspaces:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspaces", message: error.message },
      { status: 500 }
    );
  }
}
