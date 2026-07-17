import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/drink - List drinks with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "PUBLISHED";
    const sort = searchParams.get("sort") || "sortOrder";
    const order = searchParams.get("order") || "asc";

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

    if (category) {
      where.category = {
        slug: category,
        isActive: true,
      };
    }

    const [drinks, total] = await Promise.all([
      prisma.drink.findMany({
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
        orderBy: { [sort]: order },
      }),
      prisma.drink.count({ where }),
    ]);

    return NextResponse.json({
      data: drinks,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get drinks error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
