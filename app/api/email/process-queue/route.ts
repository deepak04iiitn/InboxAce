import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import nodemailer from "nodemailer";
import { replaceVariables } from "@/lib/email-utils";

// This should be called by a cron job
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Find jobs that need to be sent
    const jobsToSend = await prisma.job.findMany({
      where: {
        status: "NOT_SENT",
        OR: [
          { customSendNow: true },
          {
            customScheduledFor: {
              lte: now,
            },
          },
        ],
      },
      include: {
        user: {
          include: {
            emailAccounts: {
              where: { isActive: true, isPrimary: true },
            },
          },
        },
        template: true,
      },
      take: 50, // Process 50 at a time
    });

    console.log(`Processing ${jobsToSend.length} jobs`);

    const results = [];

    for (const job of jobsToSend) {
      try {
        const emailAccount = job.user.emailAccounts[0];
        if (!emailAccount) {
          console.log(`No email account for job ${job.id}`);
          continue;
        }

        // Check daily limit
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (emailAccount.lastResetDate < today) {
          await prisma.emailAccount.update({
            where: { id: emailAccount.id },
            data: {
              sentToday: 0,
              lastResetDate: new Date(),
            },
          });
        } else if (emailAccount.sentToday >= emailAccount.dailyLimit) {
          console.log(`Daily limit reached for ${emailAccount.email}`);
          continue;
        }

        // Prepare email content
        let subject = job.customSubject || job.template?.subject || "Job Application";
        let body = job.customBody || job.template?.body || "";

        // Replace variables
        subject = replaceVariables(subject, job, job.user);
        body = replaceVariables(body, job, job.user);

        // Create email record
        const email = await prisma.email.create({
          data: {
            jobId: job.id,
            emailAccountId: emailAccount.id,
            subject,
            body,
            htmlBody: body,
            status: "PENDING",
            isFollowUp: false,
            followUpSequence: 1,
          },
        });

        // Configure transporter
        let transporter;
        if (emailAccount.accessToken && emailAccount.refreshToken) {
          transporter = nodemailer.createTransport({
            service: emailAccount.provider.toLowerCase(),
            auth: {
              type: "OAuth2",
              user: emailAccount.email,
              accessToken: emailAccount.accessToken,
              refreshToken: emailAccount.refreshToken,
            },
          });
        } else if (emailAccount.appPassword) {
          transporter = nodemailer.createTransport({
            service: emailAccount.provider.toLowerCase(),
            auth: {
              user: emailAccount.email,
              pass: emailAccount.appPassword,
            },
          });
        } else {
          throw new Error("No authentication method");
        }

        // Send email
        const info = await transporter.sendMail({
          from: `${job.user.name} <${emailAccount.email}>`,
          to: job.recipientEmail,
          subject,
          html: body,
        });

        // Update email status
        await prisma.email.update({
          where: { id: email.id },
          data: {
            status: "SENT",
            sentAt: new Date(),
            messageId: info.messageId,
          },
        });

        // Update job status
        await prisma.job.update({
          where: { id: job.id },
          data: {
            status: "SENT",
            sentAt: new Date(),
          },
        });

        // Update email account
        await prisma.emailAccount.update({
          where: { id: emailAccount.id },
          data: {
            sentToday: { increment: 1 },
          },
        });

        // Update batch if exists
        if (job.batchId) {
          await prisma.jobBatch.update({
            where: { id: job.batchId },
            data: {
              sentCount: { increment: 1 },
            },
          });
        }

        // Update analytics
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await prisma.analytics.upsert({
          where: {
            userId_date: {
              userId: job.userId,
              date: today,
            },
          },
          update: {
            emailsSent: { increment: 1 },
          },
          create: {
            userId: job.userId,
            date: today,
            emailsSent: 1,
          },
        });

        results.push({ jobId: job.id, status: "sent" });
      } catch (error: any) {
        console.error(`Error sending job ${job.id}:`, error);
        results.push({ jobId: job.id, status: "failed", error: error.message });
      }
    }

    // Process follow-ups
    await processFollowUps();

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error("Error processing queue:", error);
    return NextResponse.json(
      { error: "Failed to process queue" },
      { status: 500 }
    );
  }
}

async function processFollowUps() {
  const now = new Date();

  // Find jobs that need follow-ups
  const jobsForFollowUp = await prisma.job.findMany({
    where: {
      status: { in: ["SENT", "FOLLOW_UP_SENT"] },
      gotReply: false,
      OR: [
        {
          AND: [
            { hasCustomFollowUp: true },
            { followUpsSent: { lt: prisma.raw("COALESCE(\"customMaxFollowUps\", 0)") } },
          ],
        },
        {
          AND: [
            { batchId: { not: null } },
            { followUpsSent: { lt: prisma.raw("(SELECT \"maxFollowUps\" FROM \"JobBatch\" WHERE id = \"Job\".\"batchId\")") } },
          ],
        },
      ],
    },
    include: {
      user: {
        include: {
          emailAccounts: {
            where: { isActive: true, isPrimary: true },
          },
        },
      },
      template: true,
      batch: true,
    },
  });

  for (const job of jobsForFollowUp) {
    try {
      const daysBetween = job.batch?.daysBetweenFollowUps || 3;
      const lastSent = job.lastFollowUpAt || job.sentAt;

      if (!lastSent) continue;

      const daysSinceLastEmail = Math.floor(
        (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastEmail >= daysBetween) {
        // Send follow-up
        const emailAccount = job.user.emailAccounts[0];
        if (!emailAccount) continue;

        const subject = `Follow-up: ${job.customSubject || job.template?.subject}`;
        const body = generateFollowUpBody(job);

        // (Similar sending logic as above)
        // ... send email, update records
      }
    } catch (error) {
      console.error(`Error processing follow-up for job ${job.id}:`, error);
    }
  }
}

function generateFollowUpBody(job: any): string {
  return `
    <p>Hi ${job.recipientName},</p>
    <p>I wanted to follow up on my previous email regarding the ${job.position} position at ${job.company}.</p>
    <p>I remain very interested in this opportunity and would love to discuss how my skills align with your team's needs.</p>
    <p>Looking forward to hearing from you.</p>
    <p>Best regards,</p>
  `;
}
