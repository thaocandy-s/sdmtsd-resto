import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/tourist - List tour places
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const category = searchParams.get("category") || "";

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      deletedAt: null,
      isPublished: true,
    };

    if (category) {
      where.category = {
        slug: category,
        isActive: true,
      };
    }

    const [places, total] = await Promise.all([
      prisma.tourPlace.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.tourPlace.count({ where }),
    ]);

    return NextResponse.json({
      data: places,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get tour places error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
