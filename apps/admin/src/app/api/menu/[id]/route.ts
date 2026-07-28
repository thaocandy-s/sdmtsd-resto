import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";
import { deleteMediaByUrl } from "@/lib/supabase";
import { foodUpdateSchema } from "@/lib/validation";
import { normalizeScope, updateOrdered } from "@/lib/ordering";

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
      const parsed = foodUpdateSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { message: "Invalid input", errors: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

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
        ingredients,
        calories,
        position,
        status,
      } = parsed.data;

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

      const food = await updateOrdered(
        "food",
        params.id,
        {
          previousScope: existing.categoryId,
          nextScope: categoryId ?? existing.categoryId,
          position,
        },
        (tx, resolvedSortOrder) =>
          tx.food.update({
            where: { id: params.id },
            data: {
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
              ingredients,
              calories,
              ...(resolvedSortOrder !== undefined ? { sortOrder: resolvedSortOrder } : {}),
              status,
            },
            include: { category: true },
          })
      );

      // DB updated successfully — now it is safe to remove the replaced image
      if (imageUrl !== undefined && imageUrl !== existing.imageUrl) {
        await deleteMediaByUrl(existing.imageUrl);
      }

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

      // Soft delete first, then clean up storage
      await prisma.food.update({
        where: { id: params.id },
        data: { deletedAt: new Date() },
      });
      await normalizeScope("food", existing.categoryId);

      if (existing.imageUrl) {
        await deleteMediaByUrl(existing.imageUrl);
      }

      return NextResponse.json({ message: "Food deleted successfully" });
    } catch (error) {
      console.error("Delete food error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "menu", action: "delete" }
);
