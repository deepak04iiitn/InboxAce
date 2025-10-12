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

    const { name, password, description } = await req.json();

    // Validate required fields
    if (!name || !password) {
      return NextResponse.json(
        { error: "Name and password are required" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate invite code
    const inviteCode = `WS-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // Create workspace
    const workspace = await prisma.workspace.create({
      data: {
        name,
        password: hashedPassword,
        description: description || null,
        ownerId: user.id,
        inviteCode,
      },
    });

    // Add owner as admin member
    await prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        role: "ADMIN",
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        action: "WORKSPACE_CREATED",
        description: `Created workspace "${name}"`,
        metadata: {
          workspaceId: workspace.id,
          workspaceName: name,
        },
      },
    });

    return NextResponse.json({
      success: true,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
        ownerId: workspace.ownerId,
        createdAt: workspace.createdAt,
      },
      message: "Workspace created successfully!",
    });
  } catch (error: any) {
    console.error("Error creating workspace:", error);
    return NextResponse.json(
      { error: "Failed to create workspace", message: error.message },
      { status: 500 }
    );
  }
}
