import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";

// GET /api/menu/[id] - Get food by id
export const GET = withAuthParams(async (_request, { params }) => {
  try {
    const food = await prisma.food.findUnique({
      where: { id: params.id },
      include: { category: true },
    });

    if (!food) {
      return NextResponse.json({ message: "Food not found" }, { status: 404 });
    }

    return NextResponse.json({ data: food });
  } catch (error) {
    console.error("Get food error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});

// PUT /api/menu/[id] - Update food
export const PUT = withAuthParams(
  async (request, { params }) => {
    try {
      const body = await request.json();
      const {
        name,
        slug,
        description,
        price,
        originalPrice,
        categoryId,
        imageUrl,
        images,
        isPopular,
        isRecommended,
        allergens,
        ingredients,
        calories,
        sortOrder,
        status,
      } = body;

      const existing = await prisma.food.findUnique({
        where: { id: params.id },
      });
      if (!existing) {
        return NextResponse.json({ message: "Food not found" }, { status: 404 });
      }

      // Check slug uniqueness if changed
      if (slug && slug !== existing.slug) {
        const slugExists = await prisma.food.findUnique({ where: { slug } });
        if (slugExists) {
          return NextResponse.json({ message: "Slug already exists" }, { status: 400 });
        }
      }

      const food = await prisma.food.update({
        where: { id: params.id },
        data: {
          name,
          slug,
          description,
          price: price !== undefined ? parseInt(price) : undefined,
          originalPrice:
            originalPrice !== undefined
              ? originalPrice
                ? parseInt(originalPrice)
                : null
              : undefined,
          categoryId,
          imageUrl,
          images,
          isPopular,
          isRecommended,
          allergens,
          ingredients,
          calories: calories !== undefined ? (calories ? parseInt(calories) : null) : undefined,
          sortOrder: sortOrder !== undefined ? (sortOrder ? parseInt(sortOrder) : 0) : undefined,
          status,
        },
        include: { category: true },
      });

      return NextResponse.json({ data: food });
    } catch (error) {
      console.error("Update food error:", error);
      const message = error instanceof Error ? error.message : "Internal server error";
      return NextResponse.json({ message }, { status: 500 });
    }
  },
  { module: "menu", action: "update" }
);

// DELETE /api/menu/[id] - Soft delete food
export const DELETE = withAuthParams(
  async (_request, { params }) => {
    try {
      const existing = await prisma.food.findUnique({
        where: { id: params.id },
      });
      if (!existing) {
        return NextResponse.json({ message: "Food not found" }, { status: 404 });
      }

      await prisma.food.update({
        where: { id: params.id },
        data: { deletedAt: new Date() },
      });

      return NextResponse.json({ message: "Food deleted successfully" });
    } catch (error) {
      console.error("Delete food error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "menu", action: "delete" }
);
