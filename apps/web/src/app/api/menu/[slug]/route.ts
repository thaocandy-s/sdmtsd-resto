import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ slug: string }> };

// GET /api/menu/[slug] - Get food by slug
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;

    const food = await prisma.food.findFirst({
      where: {
        slug,
        deletedAt: null,
        status: "PUBLISHED",
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!food) {
      return NextResponse.json({ message: "Food not found" }, { status: 404 });
    }

    // Get related foods from same category
    const relatedFoods = await prisma.food.findMany({
      where: {
        categoryId: food.categoryId,
        id: { not: food.id },
        deletedAt: null,
        status: "PUBLISHED",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        price: true,
      },
      take: 4,
      orderBy: { isPopular: "desc" },
    });

    return NextResponse.json({
      data: food,
      related: relatedFoods,
    });
  } catch (error) {
    console.error("Get food error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
