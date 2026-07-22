import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/buffet - List buffet courses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const requestedLimit = parseInt(searchParams.get("limit") || "10");
    const limit = Math.min(Math.max(1, requestedLimit), 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "PUBLISHED";

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.buffetCourse.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sortOrder: "asc" },
      }),
      prisma.buffetCourse.count({ where }),
    ]);

    return NextResponse.json({
      data: courses,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get buffet courses error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
