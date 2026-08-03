import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";
import { normalizeScope, updateOrdered } from "@/lib/ordering";
import { positionValue } from "@/lib/validation";

// PUT /api/menu/categories/[id] - Update food category
export const PUT = withAuthParams(
  async (request, { params }) => {
    try {
      const body = await request.json();
      const { name, slug, isActive } = body;
      const position = positionValue.parse(body.position);

      const existing = await prisma.foodCategory.findUnique({
        where: { id: params.id },
      });
      if (!existing) {
        return NextResponse.json({ message: "Category not found" }, { status: 404 });
      }

      if (slug && slug !== existing.slug) {
        const slugExists = await prisma.foodCategory.findUnique({
          where: { slug },
        });
        if (slugExists) {
          return NextResponse.json({ message: "カテゴリー名が既に存在します" }, { status: 400 });
        }
      }

      const category = await updateOrdered("food-category", params.id, { position }, (tx) =>
        tx.foodCategory.update({
          where: { id: params.id },
          data: { name, slug, isActive },
        })
      );

      return NextResponse.json({ data: category });
    } catch (error) {
      console.error("Update food category error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "menu", action: "update" }
);

// DELETE /api/menu/categories/[id] - Soft delete food category
export const DELETE = withAuthParams(
  async (_request, { params }) => {
    try {
      const existing = await prisma.foodCategory.findUnique({
        where: { id: params.id },
      });
      if (!existing) {
        return NextResponse.json({ message: "Category not found" }, { status: 404 });
      }

      const foodCount = await prisma.food.count({
        where: { categoryId: params.id, deletedAt: null },
      });
      if (foodCount > 0) {
        return NextResponse.json(
          {
            message: `Cannot delete: category still has ${foodCount} food item(s). Move or delete them first.`,
          },
          { status: 400 }
        );
      }

      // Purge soft-deleted foods still referencing this category, then delete it
      await prisma.$transaction([
        prisma.food.deleteMany({ where: { categoryId: params.id, deletedAt: { not: null } } }),
        prisma.foodCategory.delete({ where: { id: params.id } }),
      ]);
      await normalizeScope("food-category");

      return NextResponse.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Delete food category error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "menu", action: "delete" }
);
