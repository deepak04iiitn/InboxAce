import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

// GET - Fetch all jobs for user
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
    const status = searchParams.get("status");
    const workspaceId = searchParams.get("workspaceId");
    const batchId = searchParams.get("batchId");

    const whereClause: any = { userId: user.id };
    if (status) whereClause.status = status;
    if (workspaceId) whereClause.workspaceId = workspaceId;
    if (batchId) whereClause.batchId = batchId;

    const jobs = await prisma.job.findMany({
      where: whereClause,
      include: {
        emails: {
          orderBy: { createdAt: "desc" },
        },
        comments: {
          orderBy: { createdAt: "desc" },
        },
        template: true,
        batch: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

// POST - Create new job
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
    const {
      recipientName,
      recipientGender,
      position,
      company,
      recipientEmail,
      emailType,
      customSubject,
      customBody,
      customLinks,
      customSendNow,
      customScheduledFor,
      customMaxFollowUps,
      notes,
      tags,
      workspaceId,
      templateId,
    } = body;

    // Validate required fields
    if (!recipientName || !recipientEmail || !position || !company) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const job = await prisma.job.create({
      data: {
        userId: user.id,
        recipientName,
        recipientGender: recipientGender || "NOT_SPECIFIED",
        position,
        company,
        recipientEmail,
        emailType: emailType || "APPLICATION",
        customSubject: customSubject || null,
        customBody: customBody || null,
        customLinks: customLinks || [],
        hasCustomSchedule: !!customScheduledFor,
        customSendNow: customSendNow ?? true,
        customScheduledFor: customScheduledFor || null,
        hasCustomFollowUp: customMaxFollowUps !== undefined,
        customMaxFollowUps: customMaxFollowUps || null,
        notes: notes || null,
        tags: tags || [],
        workspaceId: workspaceId || null,
        templateId: templateId || null,
        status: "NOT_SENT",
      },
      include: {
        template: true,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        action: "JOB_CREATED",
        description: `Created job application for ${position} at ${company}`,
        metadata: { jobId: job.id },
      },
    });

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}
