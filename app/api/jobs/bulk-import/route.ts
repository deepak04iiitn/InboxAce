import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { parse } from "csv-parse/sync";

// Field mappings - maps various possible CSV column names to our database fields
const FIELD_MAPPINGS: Record<string, string[]> = {
  recipientName: ["recipientName", "recipient_name", "name", "recipient", "contact_name", "contactName"],
  recipientEmail: ["recipientEmail", "recipient_email", "email", "contact_email", "contactEmail"],
  recipientGender: ["recipientGender", "recipient_gender", "gender"],
  position: ["position", "title", "job_title", "jobTitle", "role"],
  company: ["company", "organization", "org", "company_name", "companyName"],
  emailType: ["emailType", "email_type", "type"],
  customSubject: ["customSubject", "custom_subject", "subject", "email_subject", "emailSubject"],
  customBody: ["customBody", "custom_body", "body", "email_body", "emailBody", "message"],
  notes: ["notes", "note", "comments", "comment"],
  tags: ["tags", "tag", "labels", "label"],
  customLinks: ["customLinks", "custom_links", "links", "link", "urls"],
};

// Normalize column name for matching
function normalizeColumnName(name: string): string {
  return name.toLowerCase().trim().replace(/[\s_-]+/g, '');
}

// Find the best matching field for a CSV column
function findMatchingField(csvColumn: string): string | null {
  const normalized = normalizeColumnName(csvColumn);
  
  for (const [dbField, aliases] of Object.entries(FIELD_MAPPINGS)) {
    if (aliases.some(alias => normalizeColumnName(alias) === normalized)) {
      return dbField;
    }
  }
  
  return null;
}

// Map CSV row to job object
function mapCsvRowToJob(record: any, columnMapping: Map<string, string>): Partial<any> {
  const job: any = {};
  
  for (const [csvColumn, dbField] of columnMapping.entries()) {
    const value = record[csvColumn];
    if (value !== undefined && value !== null && value !== "") {
      job[dbField] = value;
    }
  }
  
  return job;
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

    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    });

    if (!records || records.length === 0) {
      return NextResponse.json(
        { error: "CSV file is empty or invalid" },
        { status: 400 }
      );
    }

    // Auto-detect column mappings from first row
    const csvColumns = Object.keys(records[0]);
    const columnMapping = new Map<string, string>();
    const unmappedColumns: string[] = [];

    for (const csvColumn of csvColumns) {
      const dbField = findMatchingField(csvColumn);
      if (dbField) {
        columnMapping.set(csvColumn, dbField);
      } else {
        unmappedColumns.push(csvColumn);
      }
    }

    // Get user's default template
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
      include: { defaultTemplate: true },
    });

    const validJobs: any[] = [];
    const errors: any[] = [];
    const warnings: any[] = [];

    // Validate and process each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const mappedData = mapCsvRowToJob(record, columnMapping);

      // Check for required fields
      const missingFields: string[] = [];
      if (!mappedData.recipientName) missingFields.push("recipientName");
      if (!mappedData.recipientEmail) missingFields.push("recipientEmail");
      if (!mappedData.position) missingFields.push("position");
      if (!mappedData.company) missingFields.push("company");

      if (missingFields.length > 0) {
        errors.push({
          row: i + 2, // +2 because: +1 for index, +1 for header row
          error: `Missing required fields: ${missingFields.join(", ")}`,
          data: record,
        });
        continue;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(mappedData.recipientEmail)) {
        errors.push({
          row: i + 2,
          error: "Invalid email format",
          data: record,
        });
        continue;
      }

      // Process special fields
      const jobData: any = {
        userId: user.id,
        recipientName: mappedData.recipientName,
        recipientEmail: mappedData.recipientEmail,
        position: mappedData.position,
        company: mappedData.company,
        recipientGender: mappedData.recipientGender?.toUpperCase() || "NOT_SPECIFIED",
        emailType: mappedData.emailType?.toUpperCase() || "APPLICATION",
        status: "NOT_SENT",
        customSendNow: true,
        hasCustomSchedule: false,
        hasCustomFollowUp: false,
      };

      // Handle subject and body - use CSV values if provided, otherwise use default template
      if (mappedData.customSubject) {
        jobData.customSubject = mappedData.customSubject;
      } else if (userSettings?.defaultTemplate) {
        jobData.customSubject = userSettings.defaultTemplate.subject;
      }

      if (mappedData.customBody) {
        jobData.customBody = mappedData.customBody;
      } else if (userSettings?.defaultTemplate) {
        jobData.customBody = userSettings.defaultTemplate.body;
      }

      // Set template ID if default template exists and no custom content provided
      if (userSettings?.defaultTemplate && !mappedData.customSubject && !mappedData.customBody) {
        jobData.templateId = userSettings.defaultTemplate.id;
      }

      // Handle optional fields
      if (mappedData.notes) {
        jobData.notes = mappedData.notes;
      }

      // Handle tags (comma or semicolon separated)
      if (mappedData.tags) {
        jobData.tags = mappedData.tags
          .split(/[,;]/)
          .map((t: string) => t.trim())
          .filter((t: string) => t);
      } else {
        jobData.tags = [];
      }

      // Handle custom links (semicolon separated)
      if (mappedData.customLinks) {
        jobData.customLinks = mappedData.customLinks
          .split(";")
          .map((l: string) => l.trim())
          .filter((l: string) => l);
      } else {
        jobData.customLinks = [];
      }

      validJobs.push(jobData);
    }

    // Bulk insert valid records
    const createdJobs = await prisma.job.createMany({
      data: validJobs,
      skipDuplicates: true,
    });

    // Log the import activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        action: "BULK_IMPORT",
        description: `Imported ${createdJobs.count} jobs from CSV`,
        metadata: {
          totalRows: records.length,
          successCount: createdJobs.count,
          errorCount: errors.length,
          unmappedColumns: unmappedColumns,
          mappedFields: Array.from(columnMapping.values()),
        },
      },
    });

    // Send response
    return NextResponse.json({
      success: true,
      imported: createdJobs.count,
      errors: errors,
      warnings: unmappedColumns.length > 0 ? [{
        type: "unmapped_columns",
        message: `The following columns were not recognized and were ignored: ${unmappedColumns.join(", ")}`,
        columns: unmappedColumns,
      }] : [],
      mapping: {
        mapped: Array.from(columnMapping.entries()).map(([csv, db]) => ({ csvColumn: csv, dbField: db })),
        unmapped: unmappedColumns,
      },
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