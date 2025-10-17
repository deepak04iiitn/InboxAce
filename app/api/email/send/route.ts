import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import nodemailer from "nodemailer";
import { getValidAccessToken } from "@/lib/token-refresh";
import { replaceVariables, preserveHtmlFormatting } from "@/lib/email-utils";


export async function POST(req: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    // 2. Parse request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { jobId, subject, htmlBody, isFollowUp } = body;

    // 3. Validate required fields
    if (!jobId) {
      return NextResponse.json(
        { error: "Missing required field: jobId" },
        { status: 400 }
      );
    }

    if (!subject || !htmlBody) {
      return NextResponse.json(
        { error: "Missing required fields: subject and htmlBody" },
        { status: 400 }
      );
    }

    // 4. Get user with email accounts
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        emailAccounts: {
          where: { isActive: true, isPrimary: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 5. Check if user has email account configured
    const emailAccount = user.emailAccounts[0];
    if (!emailAccount) {
      return NextResponse.json(
        { 
          error: "No email account configured. Please sign out and sign in again to connect your Gmail.",
          code: "NO_EMAIL_ACCOUNT"
        },
        { status: 400 }
      );
    }

    // 6. Get job details - check both user jobs and workspace jobs
    const job = await prisma.job.findFirst({
      where: { 
        id: jobId,
        OR: [
          { userId: user.id },
          {
            workspaceId: { not: null },
            workspace: {
              members: {
                some: { userId: user.id }
              }
            }
          }
        ]
      },
      include: { 
        template: true,
        workspace: {
          include: {
            members: {
              where: { userId: user.id }
            }
          }
        }
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found or you don't have permission" },
        { status: 404 }
      );
    }

    // 7. Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (emailAccount.lastResetDate < today) {
      // Reset daily counter
      await prisma.emailAccount.update({
        where: { id: emailAccount.id },
        data: {
          sentToday: 0,
          lastResetDate: new Date(),
        },
      });
    } else if (emailAccount.sentToday >= emailAccount.dailyLimit) {
      return NextResponse.json(
        { 
          error: `Daily email limit reached (${emailAccount.dailyLimit} emails). Please try again tomorrow.`,
          code: "DAILY_LIMIT_REACHED"
        },
        { status: 429 }
      );
    }

    // 8. Get valid access token (will refresh if expired)
    const validAccessToken = await getValidAccessToken(emailAccount.id);
    
    if (!validAccessToken) {
      return NextResponse.json(
        { 
          error: "Failed to get valid access token. Please sign out and sign in again.",
          code: "TOKEN_REFRESH_FAILED"
        },
        { status: 401 }
      );
    }

    // 9. Create email record
    const email = await prisma.email.create({
      data: {
        jobId,
        emailAccountId: emailAccount.id,
        subject,
        body: htmlBody,
        htmlBody,
        status: "PENDING",
        isFollowUp: isFollowUp || false,
        followUpSequence: isFollowUp ? job.followUpsSent + 1 : 1,
      },
    });

    // 10. Configure email transporter with OAuth2
    let transporter;
    
    try {
      if (validAccessToken && emailAccount.refreshToken) {
        // OAuth2 authentication with valid token
        transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            type: "OAuth2",
            user: emailAccount.email,
            accessToken: validAccessToken,
            refreshToken: emailAccount.refreshToken,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        });
      } else if (emailAccount.appPassword) {
        // Fallback to app password authentication
        transporter = nodemailer.createTransport({
          service: emailAccount.provider.toLowerCase(),
          auth: {
            user: emailAccount.email,
            pass: emailAccount.appPassword,
          },
        });
      } else {
        throw new Error("No authentication method configured for email account");
      }
    } catch (error: any) {
      await prisma.email.update({
        where: { id: email.id },
        data: {
          status: "FAILED",
          errorMessage: `Transport configuration failed: ${error.message}`,
        },
      });

      return NextResponse.json(
        { 
          error: "Email account authentication failed. Please reconnect your email account.",
          code: "AUTH_FAILED"
        },
        { status: 400 }
      );
    }

    // 11. Process email content with variable replacement (backup)
    let finalSubject = subject;
    let finalBody = htmlBody;
    
    // If the content still contains variables, replace them
    if (subject.includes('{{') || htmlBody.includes('{{')) {
      finalSubject = replaceVariables(subject, job, user);
      finalBody = replaceVariables(htmlBody, job, user);
    }
    
    // Ensure proper HTML formatting
    finalBody = preserveHtmlFormatting(finalBody);

    // 12. Send email
    try {
      const info = await transporter.sendMail({
        from: `${user.name} <${emailAccount.email}>`,
        to: job.recipientEmail,
        subject: finalSubject,
        html: finalBody,
      });

      // 13. Update email status to sent
      await prisma.email.update({
        where: { id: email.id },
        data: {
          status: "SENT",
          sentAt: new Date(),
          messageId: info.messageId,
        },
      });

      // 14. Update job status and clear auto-send timer
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: isFollowUp ? "FOLLOW_UP_SENT" : "SENT",
          sentAt: !isFollowUp ? new Date() : job.sentAt,
          followUpsSent: isFollowUp ? job.followUpsSent + 1 : job.followUpsSent,
          lastFollowUpAt: isFollowUp ? new Date() : job.lastFollowUpAt,
          autoSendAt: null, // Clear auto-send timer
        },
      });

      // 15. Update email account sent count
      await prisma.emailAccount.update({
        where: { id: emailAccount.id },
        data: {
          sentToday: { increment: 1 },
        },
      });

      // 16. Update analytics
      await updateAnalytics(user.id, "emailsSent");

      // 17. Check for badge achievements
      await checkBadges(user.id);

      return NextResponse.json({
        success: true,
        email: {
          id: email.id,
          status: "SENT",
          sentAt: new Date(),
        },
        messageId: info.messageId,
        message: "Email sent successfully!",
      });

    } catch (error: any) {
      // Email sending failed
      await prisma.email.update({
        where: { id: email.id },
        data: {
          status: "FAILED",
          errorMessage: error.message,
          retryCount: { increment: 1 },
        },
      });

      console.error("Email sending error:", error);

      return NextResponse.json(
        { 
          error: `Failed to send email: ${error.message}`,
          code: "SEND_FAILED",
          details: error.response || error.message
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("Email send API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error.message,
        code: "INTERNAL_ERROR"
      },
      { status: 500 }
    );
  }
}

// Helper function to update analytics
async function updateAnalytics(userId: string, field: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.analytics.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        [field]: { increment: 1 },
      },
      create: {
        userId,
        date: today,
        [field]: 1,
      },
    });
  } catch (error) {
    console.error("Failed to update analytics:", error);
  }
}

// Helper function to check badge achievements
async function checkBadges(userId: string) {
  try {
    const analytics = await prisma.analytics.findMany({
      where: { userId },
    });

    const totalEmailsSent = analytics.reduce((sum, a) => sum + a.emailsSent, 0);
    const totalReplies = analytics.reduce((sum, a) => sum + a.emailsReplied, 0);

    const badges = await prisma.badge.findMany();

    for (const badge of badges) {
      const existing = await prisma.userBadge.findUnique({
        where: {
          userId_badgeId: {
            userId,
            badgeId: badge.id,
          },
        },
      });

      if (!existing) {
        let earned = false;

        // Check badge conditions
        if (badge.name === "First Email" && totalEmailsSent >= 1) earned = true;
        if (badge.name === "10 Emails" && totalEmailsSent >= 10) earned = true;
        if (badge.name === "100 Emails" && totalEmailsSent >= 100) earned = true;
        if (badge.name === "First Reply" && totalReplies >= 1) earned = true;
        if (badge.name === "10 Replies" && totalReplies >= 10) earned = true;

        if (earned) {
          await prisma.userBadge.create({
            data: {
              userId,
              badgeId: badge.id,
            },
          });
        }
      }
    }
  } catch (error) {
    console.error("Failed to check badges:", error);
  }
}