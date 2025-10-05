// app/api/email-account/connect/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        accounts: {
          where: { provider: "google" },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has Google account connected
    const googleAccount = user.accounts[0];
    
    if (!googleAccount) {
      return NextResponse.json(
        { 
          error: "No Google account connected. Please sign in with Google first.",
          code: "NO_GOOGLE_ACCOUNT"
        },
        { status: 400 }
      );
    }

    // Check if EmailAccount already exists
    const existingEmailAccount = await prisma.emailAccount.findFirst({
      where: {
        userId: user.id,
        email: user.email,
      },
    });

    if (existingEmailAccount) {
      // Update existing account with latest tokens
      const updatedAccount = await prisma.emailAccount.update({
        where: { id: existingEmailAccount.id },
        data: {
          accessToken: googleAccount.access_token,
          refreshToken: googleAccount.refresh_token,
          tokenExpiry: googleAccount.expires_at 
            ? new Date(googleAccount.expires_at * 1000)
            : new Date(Date.now() + 3600 * 1000),
          isActive: true,
          isPrimary: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Email account reconnected successfully",
        emailAccount: {
          id: updatedAccount.id,
          email: updatedAccount.email,
          provider: updatedAccount.provider,
          isActive: updatedAccount.isActive,
        },
      });
    }

    // Create new EmailAccount
    const emailAccount = await prisma.emailAccount.create({
      data: {
        userId: user.id,
        email: user.email,
        provider: "GMAIL",
        accessToken: googleAccount.access_token,
        refreshToken: googleAccount.refresh_token,
        tokenExpiry: googleAccount.expires_at 
          ? new Date(googleAccount.expires_at * 1000)
          : new Date(Date.now() + 3600 * 1000),
        isPrimary: true,
        isActive: true,
        dailyLimit: 50,
        sentToday: 0,
        lastResetDate: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Email account connected successfully",
      emailAccount: {
        id: emailAccount.id,
        email: emailAccount.email,
        provider: emailAccount.provider,
        isActive: emailAccount.isActive,
      },
    });

  } catch (error: any) {
    console.error("Email account connection error:", error);
    return NextResponse.json(
      { 
        error: "Failed to connect email account",
        message: error.message,
        code: "CONNECTION_FAILED"
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check email account status
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        emailAccounts: {
          where: { isActive: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const hasEmailAccount = user.emailAccounts.length > 0;
    const primaryAccount = user.emailAccounts.find(acc => acc.isPrimary);

    return NextResponse.json({
      success: true,
      hasEmailAccount,
      emailAccounts: user.emailAccounts.map(acc => ({
        id: acc.id,
        email: acc.email,
        provider: acc.provider,
        isPrimary: acc.isPrimary,
        isActive: acc.isActive,
        dailyLimit: acc.dailyLimit,
        sentToday: acc.sentToday,
      })),
      primaryAccount: primaryAccount ? {
        id: primaryAccount.id,
        email: primaryAccount.email,
        provider: primaryAccount.provider,
      } : null,
    });

  } catch (error: any) {
    console.error("Get email account error:", error);
    return NextResponse.json(
      { error: "Failed to get email account", message: error.message },
      { status: 500 }
    );
  }
}