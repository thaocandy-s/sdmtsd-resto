import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";

// PUT /api/menu/categories/[id] - Update food category
export const PUT = withAuthParams(
  async (request, { params }) => {
    try {
      const body = await request.json();
      const { name, slug, sortOrder, isActive } = body;

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
          return NextResponse.json({ message: "Slug already exists" }, { status: 400 });
        }
      }

      const category = await prisma.foodCategory.update({
        where: { id: params.id },
        data: { name, slug, sortOrder, isActive },
      });

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

      await prisma.foodCategory.delete({ where: { id: params.id } });

      return NextResponse.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Delete food category error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "menu", action: "delete" }
);
