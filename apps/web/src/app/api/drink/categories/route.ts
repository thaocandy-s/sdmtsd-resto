import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/drink/categories - List drink categories
export async function GET() {
  try {
    const categories = await prisma.drinkCategory.findMany({
      where: {
        isActive: true,
      },
      include: {
        _count: {
          select: {
            drinks: {
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
    console.error("Get drink categories error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
