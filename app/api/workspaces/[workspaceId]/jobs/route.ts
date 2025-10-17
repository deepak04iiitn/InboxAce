import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

// GET - Get all jobs in workspace
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params before accessing properties
    const { workspaceId } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is a member
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: workspaceId,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this workspace" },
        { status: 403 }
      );
    }

    const jobs = await prisma.job.findMany({
      where: {
        workspaceId: workspaceId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        template: true,
        comments: {
          orderBy: {
            createdAt: "desc",
          },
        },
        emails: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      jobs,
    });
  } catch (error: any) {
    console.error("Error fetching workspace jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs", message: error.message },
      { status: 500 }
    );
  }
}

// POST - Create job in workspace
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params before accessing properties
    const { workspaceId } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is a member
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: workspaceId,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this workspace" },
        { status: 403 }
      );
    }

    let jobData;
    try {
      jobData = await req.json();
      console.log("Workspace job creation request data:", jobData);
    } catch (parseError) {
      console.error("Failed to parse request JSON:", parseError);
      return NextResponse.json(
        { 
          error: "Invalid JSON in request body", 
          message: "The request body contains invalid JSON",
          success: false
        },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = ['recipientName', 'recipientEmail', 'position', 'company'];
    const missingFields = requiredFields.filter(field => !jobData[field] || jobData[field].trim() === '');
    
    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      return NextResponse.json(
        { 
          error: "Missing required fields", 
          message: `Missing: ${missingFields.join(', ')}`,
          success: false
        },
        { status: 400 }
      );
    }

    // Get workspace to use its default follow-up interval
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });

    if (!workspace) {
      console.error("Workspace not found:", workspaceId);
      return NextResponse.json(
        { 
          error: "Workspace not found", 
          message: "The specified workspace does not exist",
          success: false
        },
        { status: 404 }
      );
    }

    console.log("Workspace found:", workspace.id, workspace.name);

    // Set auto-send timer to 30 minutes from now if not scheduled
    const autoSendAt = jobData.customScheduledFor ? null : new Date(Date.now() + 30 * 60 * 1000);

    // Prepare job data for database
    const jobCreateData = {
      ...jobData,
      userId: user.id,
      workspaceId: workspaceId,
      // If no custom follow-up settings, use workspace default
      hasCustomFollowUp: jobData.hasCustomFollowUp || false,
      customMaxFollowUps: jobData.customMaxFollowUps || null,
      autoSendAt: autoSendAt,
    };

    console.log("Job data to be created:", jobCreateData);

    // Create job
    const job = await prisma.job.create({
      data: jobCreateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        template: true,
      },
    });

    // Update member stats
    await prisma.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId: workspaceId,
          userId: user.id,
        },
      },
      data: {
        leadsAdded: { increment: 1 },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        action: "WORKSPACE_JOB_CREATED",
        description: `Added job for ${job.company} in workspace`,
        metadata: {
          workspaceId: workspaceId,
          jobId: job.id,
        },
      },
    });

    console.log("Workspace job created successfully:", job);
    
    return NextResponse.json({
      success: true,
      job,
      message: "Job created successfully",
    });
  } catch (error: any) {
    console.error("Error creating workspace job:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    // Ensure we always return a valid JSON response
    const errorResponse = { 
      error: "Failed to create job", 
      message: error.message || "Unknown error occurred",
      details: error.code || error.name || "Unknown error type",
      success: false
    };
    
    console.log("Returning error response:", errorResponse);
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
