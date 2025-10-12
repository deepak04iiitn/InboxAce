import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

// GET - Get workspace details
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

    const workspace = await prisma.workspace.findUnique({
      where: { id: params.workspaceId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
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
        jobs: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
            comments: {
              include: {
                job: false,
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
          orderBy: {
            createdAt: "desc",
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

    // Check if user is a member
    const isMember = workspace.members.some((m) => m.userId === user.id);
    if (!isMember) {
      return NextResponse.json(
        { error: "You are not a member of this workspace" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      workspace: {
        ...workspace,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching workspace:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspace", message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete workspace (owner only)
export async function DELETE(
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

    const workspace = await prisma.workspace.findUnique({
      where: { id: params.workspaceId },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (workspace.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Only the workspace owner can delete it" },
        { status: 403 }
      );
    }

    // Delete workspace (cascade will handle members and jobs)
    await prisma.workspace.delete({
      where: { id: params.workspaceId },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        action: "WORKSPACE_DELETED",
        description: `Deleted workspace "${workspace.name}"`,
        metadata: {
          workspaceId: workspace.id,
          workspaceName: workspace.name,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Workspace deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting workspace:", error);
    return NextResponse.json(
      { error: "Failed to delete workspace", message: error.message },
      { status: 500 }
    );
  }
}
