// app/api/user/default-template/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

// GET - Fetch user's default template
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
      include: {
        defaultTemplate: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      hasDefaultTemplate: !!user.defaultTemplateId,
      defaultTemplate: user.defaultTemplate,
    });
  } catch (error) {
    console.error("Fetch default template error:", error);
    return NextResponse.json(
      { error: "Failed to fetch default template" },
      { status: 500 }
    );
  }
}

// POST - Set user's default template
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { templateId } = await req.json();

    if (!templateId) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    // Verify template exists
    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update user's default template
    await prisma.user.update({
      where: { id: user.id },
      data: {
        defaultTemplateId: templateId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Default template set successfully",
    });
  } catch (error) {
    console.error("Set default template error:", error);
    return NextResponse.json(
      { error: "Failed to set default template" },
      { status: 500 }
    );
  }
}

// DELETE - Remove user's default template
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        defaultTemplateId: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Default template removed",
    });
  } catch (error) {
    console.error("Remove default template error:", error);
    return NextResponse.json(
      { error: "Failed to remove default template" },
      { status: 500 }
    );
  }
}