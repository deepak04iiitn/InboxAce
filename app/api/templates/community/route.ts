import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "recent";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        { isPublic: true },
        { isCommunity: true },
      ],
    };

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { subject: { contains: search, mode: "insensitive" } },
            { tags: { has: search.toLowerCase() } },
          ],
        },
      ];
    }

    let orderBy: any = { createdAt: "desc" };

    switch (sortBy) {
      case "popular":
        orderBy = { usageCount: "desc" };
        break;
      case "rating":
        orderBy = { rating: "desc" };
        break;
      case "likes":
        orderBy = { likes: "desc" };
        break;
    }

    const [templates, total] = await Promise.all([
      prisma.emailTemplate.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
          ratings: {
            take: 3,
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      prisma.emailTemplate.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      templates,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch templates error:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}
