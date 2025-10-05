import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

// GET - Fetch user's email accounts
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        emailAccounts: {
          select: {
            id: true,
            email: true,
            provider: true,
            isPrimary: true,
            isActive: true,
            dailyLimit: true,
            sentToday: true,
            lastResetDate: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      emailAccounts: user.emailAccounts,
      hasEmailAccount: user.emailAccounts.length > 0,
    });
  } catch (error) {
    console.error("Error fetching email accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch email accounts" },
      { status: 500 }
    );
  }
}

// POST - Add new email account
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

    const body = await req.json();
    const { email, provider, appPassword } = body;

    if (!email || !provider || !appPassword) {
      return NextResponse.json(
        { error: "Missing required fields: email, provider, appPassword" },
        { status: 400 }
      );
    }

    // Check if this is the first email account (make it primary)
    const existingAccounts = await prisma.emailAccount.count({
      where: { userId: user.id },
    });

    const emailAccount = await prisma.emailAccount.create({
      data: {
        userId: user.id,
        email,
        provider,
        appPassword,
        isPrimary: existingAccounts === 0,
        isActive: true,
        dailyLimit: 50,
        sentToday: 0,
        lastResetDate: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      emailAccount: {
        id: emailAccount.id,
        email: emailAccount.email,
        provider: emailAccount.provider,
        isPrimary: emailAccount.isPrimary,
      },
      message: "Email account connected successfully!",
    });
  } catch (error) {
    console.error("Error adding email account:", error);
    return NextResponse.json(
      { error: "Failed to add email account" },
      { status: 500 }
    );
  }
}
