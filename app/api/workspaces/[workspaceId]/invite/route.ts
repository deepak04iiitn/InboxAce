import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

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

    // Check if user is admin of the workspace
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: params.workspaceId,
          userId: user.id,
        },
      },
    });

    if (!membership || membership.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can invite members" },
        { status: 403 }
      );
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const invitedUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!invitedUser) {
      return NextResponse.json(
        { error: "User with this email does not exist" },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMembership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: params.workspaceId,
          userId: invitedUser.id,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "User is already a member of this workspace" },
        { status: 400 }
      );
    }

    // Check if user is blocked from this workspace
    const isBlocked = await prisma.workspaceBlockedUser.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: params.workspaceId,
          userId: invitedUser.id,
        },
      },
    });

    if (isBlocked) {
      return NextResponse.json(
        { error: "User is blocked from joining this workspace" },
        { status: 403 }
      );
    }

    // Add user as member
    await prisma.workspaceMember.create({
      data: {
        workspaceId: params.workspaceId,
        userId: invitedUser.id,
        role: "CONTRIBUTOR",
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        action: "MEMBER_INVITED",
        description: `Invited ${invitedUser.name} to workspace`,
        metadata: {
          workspaceId: params.workspaceId,
          invitedUserId: invitedUser.id,
          invitedUserName: invitedUser.name,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Member invited successfully",
    });
  } catch (error: any) {
    console.error("Error inviting member:", error);
    return NextResponse.json(
      { error: "Failed to invite member", message: error.message },
      { status: 500 }
    );
  }
}
