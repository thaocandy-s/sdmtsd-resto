import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ slug: string }> };

// GET /api/drink/[slug] - Get drink by slug
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;

    const drink = await prisma.drink.findFirst({
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

    if (!drink) {
      return NextResponse.json({ message: "Drink not found" }, { status: 404 });
    }

    // Get related drinks from same category
    const relatedDrinks = await prisma.drink.findMany({
      where: {
        categoryId: drink.categoryId,
        id: { not: drink.id },
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
      data: drink,
      related: relatedDrinks,
    });
  } catch (error) {
    console.error("Get drink error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
