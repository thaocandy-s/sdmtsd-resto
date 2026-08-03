import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";
import { normalizeScope, updateOrdered } from "@/lib/ordering";
import { positionValue } from "@/lib/validation";

// PUT /api/drink/categories/[id] - Update drink category
export const PUT = withAuthParams(
  async (request, { params }) => {
    try {
      const body = await request.json();
      const { name, slug, description, isActive } = body;
      const position = positionValue.parse(body.position);

      const existing = await prisma.drinkCategory.findUnique({
        where: { id: params.id },
      });
      if (!existing) {
        return NextResponse.json({ message: "Category not found" }, { status: 404 });
      }

      if (slug && slug !== existing.slug) {
        const slugExists = await prisma.drinkCategory.findUnique({
          where: { slug },
        });
        if (slugExists) {
          return NextResponse.json({ message: "カテゴリー名が既に存在します" }, { status: 400 });
        }
      }

      const category = await updateOrdered("drink-category", params.id, { position }, (tx) =>
        tx.drinkCategory.update({
          where: { id: params.id },
          data: {
            name,
            slug,
            description: description !== undefined ? description : existing.description,
            isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
          },
        })
      );

      return NextResponse.json({ data: category });
    } catch (error) {
      console.error("Update drink category error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "drink", action: "update" }
);

// DELETE /api/drink/categories/[id] - Delete drink category
export const DELETE = withAuthParams(
  async (_request, { params }) => {
    try {
      const existing = await prisma.drinkCategory.findUnique({
        where: { id: params.id },
      });
      if (!existing) {
        return NextResponse.json({ message: "Category not found" }, { status: 404 });
      }

      const drinkCount = await prisma.drink.count({
        where: { categoryId: params.id, deletedAt: null },
      });
      if (drinkCount > 0) {
        return NextResponse.json(
          {
            message: `Cannot delete: category still has ${drinkCount} drink(s). Move or delete them first.`,
          },
          { status: 400 }
        );
      }

      // Purge soft-deleted drinks still referencing this category, then delete it
      await prisma.$transaction([
        prisma.drink.deleteMany({ where: { categoryId: params.id, deletedAt: { not: null } } }),
        prisma.drinkCategory.delete({ where: { id: params.id } }),
      ]);
      await normalizeScope("drink-category");

      return NextResponse.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Delete drink category error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "drink", action: "delete" }
);
