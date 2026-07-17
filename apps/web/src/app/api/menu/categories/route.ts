import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/menu/categories - List food categories
export async function GET() {
  try {
    const categories = await prisma.foodCategory.findMany({
      where: {
        isActive: true,
      },
      include: {
        _count: {
          select: {
            foods: {
              where: {
                deletedAt: null,
                status: "PUBLISHED",
              },
            },
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error("Get food categories error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
