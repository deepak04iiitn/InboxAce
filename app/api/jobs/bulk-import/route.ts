import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { parse } from "csv-parse/sync";

// ✅ Define the structure of each CSV row
interface JobRecord {
  recipientName: string;
  recipientEmail: string;
  position: string;
  company: string;
  recipientGender?: string;
  emailType?: string;
  customSubject?: string;
  customBody?: string;
  customLinks?: string;
  notes?: string;
  tags?: string;
}

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

    // Check if user has premium access
    if (user.pricingTier === "FREE") {
      return NextResponse.json(
        { error: "Bulk import is a premium feature. Please upgrade." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileContent = await file.text();

    // ✅ Parse CSV with strong typing
    const records = parse<JobRecord>(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const validJobs: any[] = [];
    const errors: any[] = [];

    // ✅ Validate each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i];

      // Validate required fields
      if (!record.recipientName || !record.recipientEmail || !record.position || !record.company) {
        errors.push({
          row: i + 1,
          error: "Missing required fields (recipientName, recipientEmail, position, company)",
          data: record,
        });
        continue;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(record.recipientEmail)) {
        errors.push({
          row: i + 1,
          error: "Invalid email format",
          data: record,
        });
        continue;
      }

      // Prepare job entry
      validJobs.push({
        userId: user.id,
        recipientName: record.recipientName,
        recipientGender: record.recipientGender?.toUpperCase() || "NOT_SPECIFIED",
        position: record.position,
        company: record.company,
        recipientEmail: record.recipientEmail,
        emailType: record.emailType?.toUpperCase() || "APPLICATION",
        customSubject: record.customSubject || null,
        customBody: record.customBody || null,
        customLinks: record.customLinks ? record.customLinks.split(";") : [],
        notes: record.notes || null,
        tags: record.tags ? record.tags.split(",").map((t) => t.trim()) : [],
        status: "NOT_SENT",
        hasCustomSchedule: false,
        customSendNow: true,
        hasCustomFollowUp: false,
      });
    }

    // ✅ Bulk insert valid records
    const createdJobs = await prisma.job.createMany({
      data: validJobs,
      skipDuplicates: true,
    });

    // ✅ Log the import activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        action: "BULK_IMPORT",
        description: `Imported ${createdJobs.count} jobs from CSV`,
        metadata: {
          totalRows: records.length,
          successCount: createdJobs.count,
          errorCount: errors.length,
        },
      },
    });

    // ✅ Send response
    return NextResponse.json({
      success: true,
      imported: createdJobs.count,
      errors: errors,
      message: `Successfully imported ${createdJobs.count} jobs. ${errors.length} errors found.`,
    });
  } catch (error) {
    console.error("Error importing jobs:", error);
    return NextResponse.json(
      { error: "Failed to import jobs" },
      { status: 500 }
    );
  }
}
