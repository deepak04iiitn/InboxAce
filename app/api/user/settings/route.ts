import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

// GET - Get user settings
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        defaultFollowUpInterval: true,
        defaultTemplateId: true,
        defaultFollowUpTemplateId: true,
        customDefaultSubject: true,
        customDefaultBody: true,
        customDefaultFollowUpSubject: true,
        customDefaultFollowUpBody: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      settings: user,
    });
  } catch (error: any) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings", message: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update user settings
export async function PUT(req: NextRequest) {
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

    const body = await req.json();
    const {
      defaultFollowUpInterval,
      defaultTemplateId,
      defaultFollowUpTemplateId,
      customDefaultSubject,
      customDefaultBody,
      customDefaultFollowUpSubject,
      customDefaultFollowUpBody,
    } = body;

    // Validate follow-up interval
    if (defaultFollowUpInterval !== undefined) {
      if (typeof defaultFollowUpInterval !== 'number' || defaultFollowUpInterval < 1 || defaultFollowUpInterval > 30) {
        return NextResponse.json(
          { error: "Follow-up interval must be between 1 and 30 days" },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        defaultFollowUpInterval: defaultFollowUpInterval !== undefined ? defaultFollowUpInterval : user.defaultFollowUpInterval,
        defaultTemplateId: defaultTemplateId !== undefined ? defaultTemplateId : user.defaultTemplateId,
        defaultFollowUpTemplateId: defaultFollowUpTemplateId !== undefined ? defaultFollowUpTemplateId : user.defaultFollowUpTemplateId,
        customDefaultSubject: customDefaultSubject !== undefined ? customDefaultSubject : user.customDefaultSubject,
        customDefaultBody: customDefaultBody !== undefined ? customDefaultBody : user.customDefaultBody,
        customDefaultFollowUpSubject: customDefaultFollowUpSubject !== undefined ? customDefaultFollowUpSubject : user.customDefaultFollowUpSubject,
        customDefaultFollowUpBody: customDefaultFollowUpBody !== undefined ? customDefaultFollowUpBody : user.customDefaultFollowUpBody,
      },
      select: {
        id: true,
        name: true,
        email: true,
        defaultFollowUpInterval: true,
        defaultTemplateId: true,
        defaultFollowUpTemplateId: true,
        customDefaultSubject: true,
        customDefaultBody: true,
        customDefaultFollowUpSubject: true,
        customDefaultFollowUpBody: true,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        action: "SETTINGS_UPDATED",
        description: "Updated user settings",
        metadata: {
          updatedFields: Object.keys(body),
        },
      },
    });

    return NextResponse.json({
      success: true,
      settings: updatedUser,
      message: "Settings updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings", message: error.message },
      { status: 500 }
    );
  }
}
