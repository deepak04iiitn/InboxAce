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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const templateId = params.id;

    const existingLike = await prisma.templateLike.findUnique({
      where: {
        templateId_userId: {
          templateId,
          userId: user.id,
        },
      },
    });

    if (existingLike) {
      await prisma.templateLike.delete({
        where: { id: existingLike.id },
      });

      await prisma.emailTemplate.update({
        where: { id: templateId },
        data: { likes: { decrement: 1 } },
      });

      return NextResponse.json({
        success: true,
        liked: false,
      });
    } else {
      await prisma.templateLike.create({
        data: {
          templateId,
          userId: user.id,
        },
      });

      await prisma.emailTemplate.update({
        where: { id: templateId },
        data: { likes: { increment: 1 } },
      });

      return NextResponse.json({
        success: true,
        liked: true,
      });
    }
  } catch (error) {
    console.error("Template like error:", error);
    return NextResponse.json(
      { error: "Failed to like template" },
      { status: 500 }
    );
  }
}
