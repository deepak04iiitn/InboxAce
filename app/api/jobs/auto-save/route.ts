import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Auto-save request body:", body);
    
    // Simple validation without Zod
    const { jobId, updates, isDraft = false } = body;
    
    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json({ success: false, error: "Invalid jobId" }, { status: 400 });
    }
    
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ success: false, error: "Invalid updates" }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Check if job exists and belongs to user
    const existingJob = await prisma.job.findFirst({
      where: {
        id: jobId,
        userId: user.id,
      },
    });

    if (!existingJob) {
      // For temp jobs, we need to create them first
      if (jobId.startsWith("temp-")) {
        return NextResponse.json({ 
          success: false, 
          error: "Job not found. Please create the job first." 
        }, { status: 404 });
      }
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      ...updates,
      lastSavedAt: new Date(),
      isDirty: false,
    };

    // If it's a draft, ensure status is DRAFT
    if (isDraft) {
      updateData.status = "DRAFT";
    }

    // Update the job
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      job: updatedJob,
      savedAt: updateData.lastSavedAt,
    });
  } catch (error) {
    console.error("Auto-save error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to auto-save job" },
      { status: 500 }
    );
  }
}

// Batch auto-save for multiple jobs
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { jobs } = body;
    
    if (!Array.isArray(jobs)) {
      return NextResponse.json({ success: false, error: "Invalid jobs array" }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Batch update jobs
    const updatePromises = jobs.map(({ jobId, updates, isDraft }: any) => {
      const updateData: any = {
        ...updates,
        lastSavedAt: new Date(),
        isDirty: false,
      };

      if (isDraft) {
        updateData.status = "DRAFT";
      }

      return prisma.job.update({
        where: { id: jobId },
        data: updateData,
      });
    });

    const updatedJobs = await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      jobs: updatedJobs,
      savedAt: new Date(),
    });
  } catch (error) {
    console.error("Batch auto-save error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to auto-save jobs" },
      { status: 500 }
    );
  }
}
