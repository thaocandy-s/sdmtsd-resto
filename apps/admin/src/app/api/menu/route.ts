import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

// GET /api/menu - List all foods (admin)
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (!includeDeleted) where.deletedAt = null;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (category) where.categoryId = category;
    if (status) where.status = status;

    const [foods, total] = await Promise.all([
      prisma.food.findMany({
        where,
        skip,
        take: limit,
        include: { category: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.food.count({ where }),
    ]);

    const categories = await prisma.foodCategory.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({
      data: foods,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      categories,
    });
  } catch (error) {
    console.error("Get foods error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});

// POST /api/menu - Create food
export const POST = withAuth(
  async (request: NextRequest) => {
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

      if (!name || !slug || !categoryId || price === undefined) {
        return NextResponse.json(
          { message: "Name, slug, category, and price are required" },
          { status: 400 }
        );
      }

      const existing = await prisma.food.findUnique({ where: { slug } });
      if (existing) {
        return NextResponse.json({ message: "Slug already exists" }, { status: 400 });
      }

      const food = await prisma.food.create({
        data: {
          name,
          slug,
          description,
          price: parseInt(price),
          originalPrice: originalPrice ? parseInt(originalPrice) : null,
          categoryId,
          imageUrl,
          images: images || [],
          isPopular: isPopular || false,
          isRecommended: isRecommended || false,
          allergens: allergens || [],
          ingredients,
          calories: calories ? parseInt(calories) : null,
          sortOrder: sortOrder ? parseInt(sortOrder) : 0,
          status: status || "DRAFT",
        },
        include: { category: true },
      });

      return NextResponse.json({ data: food }, { status: 201 });
    } catch (error) {
      console.error("Create food error:", error);
      const message = error instanceof Error ? error.message : "Internal server error";
      return NextResponse.json({ message }, { status: 500 });
    }
  },
  { module: "menu", action: "create" }
);
