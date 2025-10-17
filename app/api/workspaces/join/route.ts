import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

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

    const { workspaceId, password } = await req.json();

    // Validate required fields
    if (!workspaceId || !password) {
      return NextResponse.json(
        { error: "Workspace ID and password are required" },
        { status: 400 }
      );
    }

    // Find workspace
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        owner: { select: { name: true, email: true } },
        members: { where: { userId: user.id } },
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Check if already a member
    if (workspace.members.length > 0) {
      return NextResponse.json(
        { error: "You are already a member of this workspace" },
        { status: 400 }
      );
    }

    // Check if user is blocked from this workspace
    const isBlocked = await prisma.workspaceBlockedUser.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: workspace.id,
          userId: user.id,
        },
      },
    });

    if (isBlocked) {
      return NextResponse.json(
        { error: "You are blocked from joining this workspace" },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, workspace.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Add member
    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        role: "CONTRIBUTOR",
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        action: "WORKSPACE_JOINED",
        description: `Joined workspace "${workspace.name}"`,
        metadata: {
          workspaceId: workspace.id,
          workspaceName: workspace.name,
        },
      },
    });

    return NextResponse.json({
      success: true,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
        owner: workspace.owner,
      },
      member: {
        id: member.id,
        role: member.role,
      },
      message: "Successfully joined workspace!",
    });
  } catch (error: any) {
    console.error("Error joining workspace:", error);
    return NextResponse.json(
      { error: "Failed to join workspace", message: error.message },
      { status: 500 }
    );
  }
}
