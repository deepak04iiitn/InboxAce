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
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get analytics data
    const analytics = await prisma.analytics.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Calculate totals
    const totals = {
      emailsSent: analytics.reduce((sum, a) => sum + a.emailsSent, 0),
      emailsOpened: analytics.reduce((sum, a) => sum + a.emailsOpened, 0),
      emailsReplied: analytics.reduce((sum, a) => sum + a.emailsReplied, 0),
      emailsFailed: analytics.reduce((sum, a) => sum + a.emailsFailed, 0),
      followUpsSent: analytics.reduce((sum, a) => sum + a.followUpsSent, 0),
    };

    // Calculate rates
    const openRate = totals.emailsSent > 0
      ? (totals.emailsOpened / totals.emailsSent) * 100
      : 0;
    const replyRate = totals.emailsSent > 0
      ? (totals.emailsReplied / totals.emailsSent) * 100
      : 0;

    // Get job statistics
    const jobs = await prisma.job.findMany({
      where: { userId: user.id },
      select: {
        status: true,
        company: true,
        emailType: true,
        gotReply: true,
      },
    });

    const jobStats = {
      total: jobs.length,
      sent: jobs.filter((j) => j.status === "SENT" || j.status === "FOLLOW_UP_SENT" || j.status === "REPLIED").length,
      replied: jobs.filter((j) => j.gotReply).length,
      notSent: jobs.filter((j) => j.status === "NOT_SENT").length,
    };

    // Top companies
    const companyCounts: { [key: string]: number } = {};
    jobs.forEach((job) => {
      companyCounts[job.company] = (companyCounts[job.company] || 0) + 1;
    });

    const topCompanies = Object.entries(companyCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([company, count]) => ({ company, count }));

    // Email type distribution
    const emailTypes = jobs.reduce((acc: any, job) => {
      acc[job.emailType] = (acc[job.emailType] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      totals,
      rates: {
        openRate: openRate.toFixed(2),
        replyRate: replyRate.toFixed(2),
      },
      jobStats,
      topCompanies,
      emailTypes,
      timeline: analytics,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
