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

    const { workspaceId } = await req.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID is required" },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (workspace.ownerId === user.id) {
      return NextResponse.json(
        {
          error:
            "Workspace owner cannot leave. Please transfer ownership or delete the workspace.",
        },
        { status: 400 }
      );
    }

    // Remove membership
    await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        action: "WORKSPACE_LEFT",
        description: `Left workspace "${workspace.name}"`,
        metadata: {
          workspaceId: workspace.id,
          workspaceName: workspace.name,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully left workspace",
    });
  } catch (error: any) {
    console.error("Error leaving workspace:", error);
    return NextResponse.json(
      { error: "Failed to leave workspace", message: error.message },
      { status: 500 }
    );
  }
}
