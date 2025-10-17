import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

// GET - Get workspace settings
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

    // Check if user is a member and has admin role or is owner
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.workspaceId },
      select: { ownerId: true }
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: params.workspaceId,
          userId: user.id,
        },
      },
    });

    const isOwner = workspace.ownerId === user.id;
    const isAdmin = membership?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "You must be an admin or owner to view workspace settings" },
        { status: 403 }
      );
    }

    const workspaceData = await prisma.workspace.findUnique({
      where: { id: params.workspaceId },
      select: {
        id: true,
        name: true,
        description: true,
        defaultFollowUpInterval: true,
        totalEmailsSent: true,
        totalReplies: true,
        totalOpportunities: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!workspaceData) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      settings: workspaceData,
    });
  } catch (error: any) {
    console.error("Error fetching workspace settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspace settings", message: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update workspace settings
export async function PUT(
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

    // Check if user is a member and has admin role or is owner
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.workspaceId },
      select: { ownerId: true }
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: params.workspaceId,
          userId: user.id,
        },
      },
    });

    const isOwner = workspace.ownerId === user.id;
    const isAdmin = membership?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "You must be an admin or owner to update workspace settings" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { defaultFollowUpInterval, name, description } = body;

    // Validate follow-up interval
    if (defaultFollowUpInterval !== undefined) {
      if (typeof defaultFollowUpInterval !== 'number' || defaultFollowUpInterval < 1 || defaultFollowUpInterval > 30) {
        return NextResponse.json(
          { error: "Follow-up interval must be between 1 and 30 days" },
          { status: 400 }
        );
      }
    }

    // Validate name
    if (name !== undefined && (!name || name.trim().length === 0)) {
      return NextResponse.json(
        { error: "Workspace name cannot be empty" },
        { status: 400 }
      );
    }

    const updatedWorkspace = await prisma.workspace.update({
      where: { id: params.workspaceId },
      data: {
        defaultFollowUpInterval: defaultFollowUpInterval !== undefined ? defaultFollowUpInterval : undefined,
        name: name !== undefined ? name.trim() : undefined,
        description: description !== undefined ? description : undefined,
      },
      select: {
        id: true,
        name: true,
        description: true,
        defaultFollowUpInterval: true,
        totalEmailsSent: true,
        totalReplies: true,
        totalOpportunities: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        action: "WORKSPACE_SETTINGS_UPDATED",
        description: `Updated workspace settings for "${updatedWorkspace.name}"`,
        metadata: {
          workspaceId: params.workspaceId,
          updatedFields: Object.keys(body),
        },
      },
    });

    return NextResponse.json({
      success: true,
      settings: updatedWorkspace,
      message: "Workspace settings updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating workspace settings:", error);
    return NextResponse.json(
      { error: "Failed to update workspace settings", message: error.message },
      { status: 500 }
    );
  }
}
