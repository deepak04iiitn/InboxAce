import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

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

    const { inviteCode } = await req.json();

    if (!inviteCode) {
      return NextResponse.json(
        { error: "Invite code is required" },
        { status: 400 }
      );
    }

    // Find workspace by invite code
    const workspace = await prisma.workspace.findUnique({
      where: { inviteCode },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMembership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: workspace.id,
          userId: user.id,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "You are already a member of this workspace" },
        { status: 400 }
      );
    }

    // Add user as member
    await prisma.workspaceMember.create({
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
        description: `Joined workspace "${workspace.name}" using invite code`,
        metadata: {
          workspaceId: workspace.id,
          workspaceName: workspace.name,
          inviteCode,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully joined workspace",
      workspace: {
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
        owner: workspace.owner,
      },
    });
  } catch (error: any) {
    console.error("Error joining workspace:", error);
    return NextResponse.json(
      { error: "Failed to join workspace", message: error.message },
      { status: 500 }
    );
  }
}
