import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

// POST - Block a user from the workspace
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

    const { userId, reason } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user is admin or owner
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.workspaceId },
      select: { ownerId: true }
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const adminMembership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: params.workspaceId,
          userId: user.id,
        },
      },
    });

    const isOwner = workspace.ownerId === user.id;
    const isAdmin = adminMembership?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Only admins and owners can block users" },
        { status: 403 }
      );
    }

    // Check if user to block exists
    const userToBlock = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToBlock) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Cannot block workspace owner
    if (workspace.ownerId === userId) {
      return NextResponse.json(
        { error: "Cannot block workspace owner" },
        { status: 400 }
      );
    }

    // Check if user is already blocked
    const existingBlock = await prisma.workspaceBlockedUser.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: params.workspaceId,
          userId: userId,
        },
      },
    });

    if (existingBlock) {
      return NextResponse.json(
        { error: "User is already blocked from this workspace" },
        { status: 400 }
      );
    }

    // Remove user from workspace if they are a member
    const memberToRemove = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: params.workspaceId,
          userId: userId,
        },
      },
    });

    if (memberToRemove) {
      // Only owners can block admins
      if (memberToRemove.role === "ADMIN" && !isOwner) {
        return NextResponse.json(
          { error: "Only workspace owners can block admins" },
          { status: 403 }
        );
      }

      // Remove member first
      await prisma.workspaceMember.delete({
        where: { id: memberToRemove.id },
      });
    }

    // Block user
    await prisma.workspaceBlockedUser.create({
      data: {
        workspaceId: params.workspaceId,
        userId: userId,
        blockedBy: user.id,
        reason: reason || null,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        action: "USER_BLOCKED",
        description: `Blocked user ${userToBlock.name} from workspace`,
        metadata: {
          workspaceId: params.workspaceId,
          blockedUserId: userId,
          reason: reason,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "User blocked successfully",
    });
  } catch (error: any) {
    console.error("Error blocking user:", error);
    return NextResponse.json(
      { error: "Failed to block user", message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Unblock a user from the workspace
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

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user is admin or owner
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.workspaceId },
      select: { ownerId: true }
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const adminMembership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: params.workspaceId,
          userId: user.id,
        },
      },
    });

    const isOwner = workspace.ownerId === user.id;
    const isAdmin = adminMembership?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Only admins and owners can unblock users" },
        { status: 403 }
      );
    }

    // Check if user is blocked
    const blockedUser = await prisma.workspaceBlockedUser.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: params.workspaceId,
          userId: userId,
        },
      },
      include: { user: true },
    });

    if (!blockedUser) {
      return NextResponse.json(
        { error: "User is not blocked from this workspace" },
        { status: 404 }
      );
    }

    // Unblock user
    await prisma.workspaceBlockedUser.delete({
      where: { id: blockedUser.id },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        action: "USER_UNBLOCKED",
        description: `Unblocked user ${blockedUser.user.name} from workspace`,
        metadata: {
          workspaceId: params.workspaceId,
          unblockedUserId: userId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "User unblocked successfully",
    });
  } catch (error: any) {
    console.error("Error unblocking user:", error);
    return NextResponse.json(
      { error: "Failed to unblock user", message: error.message },
      { status: 500 }
    );
  }
}
