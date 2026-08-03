import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";
import { normalizeScope, updateOrdered } from "@/lib/ordering";
import { positionValue } from "@/lib/validation";

export const PUT = withAuthParams(
  async (request, { params }) => {
    try {
      const body = await request.json();
      const { name, slug, description, isActive } = body;
      const position = positionValue.parse(body.position ?? body.sortOrder);

      const existing = await prisma.tourCategory.findUnique({
        where: { id: params.id },
      });
      if (!existing) {
        return NextResponse.json({ message: "Category not found" }, { status: 404 });
      }

      if (slug && slug !== existing.slug) {
        const slugExists = await prisma.tourCategory.findUnique({
          where: { slug },
        });
        if (slugExists) {
          return NextResponse.json({ message: "カテゴリー名が既に存在します" }, { status: 400 });
        }
      }

      const category = await updateOrdered("tour-category", params.id, { position }, (tx) =>
        tx.tourCategory.update({
          where: { id: params.id },
          data: {
            ...(name !== undefined ? { name } : {}),
            ...(slug !== undefined ? { slug } : {}),
            ...(description !== undefined ? { description } : {}),
            ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
          },
        })
      );
      return NextResponse.json({ data: category });
    } catch (error) {
      console.error("Update tour category error:", error);
      const message = error instanceof Error ? error.message : "Internal server error";
      return NextResponse.json({ message }, { status: 500 });
    }
  },
  { module: "tourist", action: "update" }
);

export const DELETE = withAuthParams(
  async (_request, { params }) => {
    try {
      const placeCount = await prisma.tourPlace.count({
        where: { categoryId: params.id, deletedAt: null },
      });
      if (placeCount > 0) {
        return NextResponse.json(
          {
            message: `Cannot delete: category still has ${placeCount} place(s). Move or delete them first.`,
          },
          { status: 400 }
        );
      }
      // Purge soft-deleted places still referencing this category, then delete it
      await prisma.$transaction([
        prisma.tourPlace.deleteMany({ where: { categoryId: params.id, deletedAt: { not: null } } }),
        prisma.tourCategory.delete({ where: { id: params.id } }),
      ]);
      await normalizeScope("tour-category");
      return NextResponse.json({ message: "Category deleted" });
    } catch (error) {
      console.error("Delete tour category error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "tourist", action: "delete" }
);
