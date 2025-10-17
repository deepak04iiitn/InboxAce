import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

// POST - Leave workspace
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

    // Check if user is a member of the workspace
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: params.workspaceId,
          userId: user.id,
        },
      },
      include: {
        workspace: {
          select: {
            name: true,
            ownerId: true,
          },
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this workspace" },
        { status: 404 }
      );
    }

    // Check if user is the workspace owner
    if (membership.workspace.ownerId === user.id) {
      return NextResponse.json(
        { error: "Workspace owners cannot leave their own workspace. Transfer ownership or delete the workspace instead." },
        { status: 400 }
      );
    }

    // Remove user from workspace
    await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId: params.workspaceId,
          userId: user.id,
        },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        action: "WORKSPACE_LEFT",
        description: `Left workspace "${membership.workspace.name}"`,
        metadata: {
          workspaceId: params.workspaceId,
          workspaceName: membership.workspace.name,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully left the workspace",
    });
  } catch (error: any) {
    console.error("Error leaving workspace:", error);
    return NextResponse.json(
      { error: "Failed to leave workspace", message: error.message },
      { status: 500 }
    );
  }
}
