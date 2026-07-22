import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";

// PUT /api/drink/categories/[id] - Update drink category
export const PUT = withAuthParams(
  async (request, { params }) => {
    try {
      const body = await request.json();
      const { name, slug, description, sortOrder, isActive } = body;

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
          return NextResponse.json({ message: "Slug already exists" }, { status: 400 });
        }
      }

      const category = await prisma.drinkCategory.update({
        where: { id: params.id },
        data: {
          name,
          slug,
          description: description !== undefined ? description : existing.description,
          sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : existing.sortOrder,
          isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
        },
      });

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

      await prisma.drinkCategory.delete({ where: { id: params.id } });

      return NextResponse.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Delete drink category error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "drink", action: "delete" }
);
