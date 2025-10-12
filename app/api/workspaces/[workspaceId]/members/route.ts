import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

// GET - Get all members
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

    const members = await prisma.workspaceMember.findMany({
      where: {
        workspaceId: params.workspaceId,
      },
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
      orderBy: {
        joinedAt: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      members,
    });
  } catch (error: any) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members", message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove member (admin only)
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

    const { memberId } = await req.json();

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    // Check if user is admin
    const adminMembership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: params.workspaceId,
          userId: user.id,
        },
      },
    });

    if (!adminMembership || adminMembership.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can remove members" },
        { status: 403 }
      );
    }

    // Get member to remove
    const memberToRemove = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
      include: { user: true, workspace: true },
    });

    if (!memberToRemove) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Cannot remove workspace owner
    if (memberToRemove.workspace.ownerId === memberToRemove.userId) {
      return NextResponse.json(
        { error: "Cannot remove workspace owner" },
        { status: 400 }
      );
    }

    // Remove member
    await prisma.workspaceMember.delete({
      where: { id: memberId },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        action: "MEMBER_REMOVED",
        description: `Removed ${memberToRemove.user.name} from workspace "${memberToRemove.workspace.name}"`,
        metadata: {
          workspaceId: params.workspaceId,
          removedUserId: memberToRemove.userId,
          removedUserName: memberToRemove.user.name,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error: any) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: "Failed to remove member", message: error.message },
      { status: 500 }
    );
  }
}
