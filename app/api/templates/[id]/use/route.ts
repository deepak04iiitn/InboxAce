import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const templateId = params.id;

    await prisma.emailTemplate.update({
      where: { id: templateId },
      data: {
        usageCount: { increment: 1 },
        downloads: { increment: 1 },
      },
    });

    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error("Template use error:", error);
    return NextResponse.json(
      { error: "Failed to use template" },
      { status: 500 }
    );
  }
}
