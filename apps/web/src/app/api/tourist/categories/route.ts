import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/tourist/categories - List tour categories
export async function GET() {
  try {
    const categories = await prisma.tourCategory.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            places: {
              where: {
                deletedAt: null,
                isPublished: true,
              },
            },
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error("Get tour categories error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
