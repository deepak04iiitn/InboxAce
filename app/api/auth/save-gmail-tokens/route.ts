// app/api/auth/save-gmail-tokens/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accessToken, refreshToken, expiresAt } = await req.json();

    if (!accessToken) {
      return NextResponse.json({ error: "Missing access token" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const emailAccount = await prisma.emailAccount.upsert({
      where: {
        userId_email: {
          userId: user.id,
          email: session.user.email,
        },
      },
      create: {
        userId: user.id,
        email: session.user.email,
        provider: "GMAIL",
        accessToken,
        refreshToken: refreshToken || null,
        tokenExpiry: expiresAt ? new Date(expiresAt * 1000) : null,
        isPrimary: true,
        isActive: true,
      },
      update: {
        accessToken,
        refreshToken: refreshToken || null,
        tokenExpiry: expiresAt ? new Date(expiresAt * 1000) : null,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, emailAccountId: emailAccount.id });
  } catch (error) {
    console.error("Error saving Gmail tokens:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}