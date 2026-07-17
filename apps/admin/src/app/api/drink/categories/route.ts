import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async () => {
  try {
    const categories = await prisma.drinkCategory.findMany({
      include: { _count: { select: { drinks: true } } },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error("Get drink categories error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const { name, slug, sortOrder, isActive } = body;
      if (!name || !slug)
        return NextResponse.json({ message: "Name and slug are required" }, { status: 400 });

      const existing = await prisma.drinkCategory.findUnique({ where: { slug } });
      if (existing) return NextResponse.json({ message: "Slug already exists" }, { status: 400 });

      const category = await prisma.drinkCategory.create({
        data: { name, slug, sortOrder: sortOrder || 0, isActive: isActive !== false },
      });
      return NextResponse.json({ data: category }, { status: 201 });
    } catch (error) {
      console.error("Create drink category error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "drink", action: "create" }
);
