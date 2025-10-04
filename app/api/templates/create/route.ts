import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const templateSchema = z.object({
  name: z.string().min(3).max(100),
  subject: z.string().min(1).max(200),
  body: z.string().min(10),
  category: z.enum([
    "GENERAL",
    "TECH",
    "FINANCE",
    "MARKETING",
    "SALES",
    "DESIGN",
    "CONSULTING",
    "OTHER",
  ]),
  tags: z.array(z.string()).max(10),
  variables: z.array(z.string()).max(20).optional(),
  isPublic: z.boolean().default(false),
  isCommunity: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  console.log("=== CREATE TEMPLATE API CALLED ===");
  
  try {
    // Check authentication
    const session = await getServerSession();
    console.log("Session:", session ? "Authenticated" : "Not authenticated");
    
    if (!session || !session.user) {
      console.error("❌ Unauthorized - No session");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    console.log("Request body:", body);

    // Validate data
    const validatedData = templateSchema.parse(body);
    console.log("Validated data:", validatedData);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });
    
    console.log("User found:", user ? `${user.name} (${user.id})` : "Not found");

    if (!user) {
      console.error("❌ User not found in database");
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Extract variables from subject and body
    const subjectVars = validatedData.subject.match(/\{\{([^}]+)\}\}/g) || [];
    const bodyVars = validatedData.body.match(/\{\{([^}]+)\}\}/g) || [];
    const allVars = [
      ...new Set([...subjectVars, ...bodyVars].map((v) => v.replace(/[{}]/g, ""))),
    ];
    
    console.log("Extracted variables:", allVars);

    // Create template
    console.log("Creating template in database...");
    const template = await prisma.emailTemplate.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        subject: validatedData.subject,
        body: validatedData.body,
        category: validatedData.category,
        tags: validatedData.tags,
        variables: allVars,
        isPublic: validatedData.isPublic,
        isCommunity: validatedData.isCommunity,
        isShared: validatedData.isPublic || validatedData.isCommunity,
        createdByName: user.name,
      },
    });

    console.log("✅ Template created successfully:", template.id);
    console.log("Template details:", {
      id: template.id,
      name: template.name,
      isPublic: template.isPublic,
      isCommunity: template.isCommunity,
    });

    return NextResponse.json({
      success: true,
      template,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Validation error:", error.errors);
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("❌ Template creation error:", error);
    return NextResponse.json(
      { error: "Failed to create template", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
