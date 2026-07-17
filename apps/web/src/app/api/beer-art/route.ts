import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/beer-art - List beer art gallery
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      isPublished: true,
    };

    const [items, total] = await Promise.all([
      prisma.beerArt.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sortOrder: "asc" },
      }),
      prisma.beerArt.count({ where }),
    ]);

    return NextResponse.json({
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get beer art error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
