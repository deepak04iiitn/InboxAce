import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        badges: {
          include: {
            badge: true,
          },
          orderBy: {
            earnedAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all available badges
    const allBadges = await prisma.badge.findMany({
      orderBy: { requirement: "asc" },
    });

    const earnedBadgeIds = new Set(user.badges.map((ub) => ub.badgeId));

    const badges = allBadges.map((badge) => ({
      ...badge,
      earned: earnedBadgeIds.has(badge.id),
      earnedAt: user.badges.find((ub) => ub.badgeId === badge.id)?.earnedAt,
    }));

    // Get user stats
    const analytics = await prisma.analytics.findMany({
      where: { userId: user.id },
    });

    const stats = {
      totalEmailsSent: analytics.reduce((sum, a) => sum + a.emailsSent, 0),
      totalReplies: analytics.reduce((sum, a) => sum + a.emailsReplied, 0),
      totalApplications: await prisma.job.count({
        where: { userId: user.id },
      }),
    };

    return NextResponse.json({
      success: true,
      badges,
      stats,
      earnedCount: user.badges.length,
      totalCount: allBadges.length,
    });
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json(
      { error: "Failed to fetch badges" },
      { status: 500 }
    );
  }
}

// Initialize default badges
export async function POST(req: NextRequest) {
  try {
    const defaultBadges = [
      {
        name: "First Email",
        description: "Send your first email",
        icon: "🎯",
        requirement: 1,
      },
      {
        name: "10 Emails",
        description: "Send 10 emails",
        icon: "📧",
        requirement: 10,
      },
      {
        name: "100 Emails",
        description: "Send 100 emails",
        icon: "🚀",
        requirement: 100,
      },
      {
        name: "First Reply",
        description: "Get your first reply",
        icon: "💬",
        requirement: 1,
      },
      {
        name: "10 Replies",
        description: "Get 10 replies",
        icon: "⭐",
        requirement: 10,
      },
      {
        name: "Persistent",
        description: "Send emails for 7 days straight",
        icon: "🔥",
        requirement: 7,
      },
    ];

    for (const badge of defaultBadges) {
      await prisma.badge.upsert({
        where: { name: badge.name },
        update: badge,
        create: badge,
      });
    }

    return NextResponse.json({ success: true, message: "Badges initialized" });
  } catch (error) {
    console.error("Error initializing badges:", error);
    return NextResponse.json(
      { error: "Failed to initialize badges" },
      { status: 500 }
    );
  }
}
