import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

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
      name,
      description,
      templateId,
      batchSubject,
      batchBody,
      batchLinks,
      sendNow,
      scheduledFor,
      maxFollowUps,
      daysBetweenFollowUps,
      jobs: jobsData,
    } = body;

    // Validate
    if (!name || !jobsData || jobsData.length === 0) {
      return NextResponse.json(
        { error: "Batch name and jobs are required" },
        { status: 400 }
      );
    }

    // Create batch
    const batch = await prisma.jobBatch.create({
      data: {
        userId: user.id,
        name,
        description: description || null,
        templateId: templateId || null,
        batchSubject: batchSubject || null,
        batchBody: batchBody || null,
        batchLinks: batchLinks || [],
        sendNow: sendNow ?? true,
        scheduledFor: scheduledFor || null,
        maxFollowUps: maxFollowUps || 0,
        daysBetweenFollowUps: daysBetweenFollowUps || user.defaultFollowUpInterval || 1,
        totalJobs: jobsData.length,
      },
    });

    // Create jobs for batch
    const jobsToCreate = jobsData.map((job: any) => ({
      userId: user.id,
      batchId: batch.id,
      templateId: templateId || null,
      recipientName: job.recipientName,
      recipientGender: job.recipientGender || "NOT_SPECIFIED",
      position: job.position,
      company: job.company,
      recipientEmail: job.recipientEmail,
      emailType: job.emailType || "APPLICATION",
      customSubject: job.customSubject || batchSubject || null,
      customBody: job.customBody || batchBody || null,
      customLinks: job.customLinks || batchLinks || [],
      hasCustomSchedule: !sendNow,
      customSendNow: sendNow,
      customScheduledFor: scheduledFor || null,
      hasCustomFollowUp: maxFollowUps > 0,
      customMaxFollowUps: maxFollowUps || null,
      notes: job.notes || null,
      tags: job.tags || [],
      status: "NOT_SENT",
    }));

    await prisma.job.createMany({
      data: jobsToCreate,
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        action: "BATCH_CREATED",
        description: `Created batch "${name}" with ${jobsData.length} jobs`,
        metadata: { batchId: batch.id },
      },
    });

    return NextResponse.json({ success: true, batch });
  } catch (error) {
    console.error("Error creating batch:", error);
    return NextResponse.json(
      { error: "Failed to create batch" },
      { status: 500 }
    );
  }
}
