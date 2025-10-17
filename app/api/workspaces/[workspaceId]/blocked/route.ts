import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

// GET - Get all blocked users for a workspace
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
        { error: "Only admins and owners can view blocked users" },
        { status: 403 }
      );
    }

    const blockedUsers = await prisma.workspaceBlockedUser.findMany({
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
        blockedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        blockedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      blockedUsers,
    });
  } catch (error: any) {
    console.error("Error fetching blocked users:", error);
    return NextResponse.json(
      { error: "Failed to fetch blocked users", message: error.message },
      { status: 500 }
    );
  }
}
