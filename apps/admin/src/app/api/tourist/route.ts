import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where = { deletedAt: null };

    const [places, total] = await Promise.all([
      prisma.tourPlace.findMany({
        where,
        skip,
        take: limit,
        include: { category: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.tourPlace.count({ where }),
    ]);

    return NextResponse.json({
      data: places,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get tourist places error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const {
        name,
        slug,
        description,
        categoryId,
        address,
        latitude,
        longitude,
        websiteUrl,
        phone,
        imageUrl,
        images,
        openingHours,
        isPublished,
        sortOrder,
      } = body;
      if (!name || !slug || !categoryId)
        return NextResponse.json(
          { message: "Name, slug, and category are required" },
          { status: 400 }
        );

      const existing = await prisma.tourPlace.findUnique({ where: { slug } });
      if (existing) return NextResponse.json({ message: "Slug already exists" }, { status: 400 });

      const place = await prisma.tourPlace.create({
        data: {
          name,
          slug,
          description,
          categoryId,
          address,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          websiteUrl,
          phone,
          imageUrl,
          images: images || [],
          openingHours,
          isPublished: isPublished || false,
          sortOrder: sortOrder ? parseInt(sortOrder) : 0,
        },
        include: { category: true },
      });
      return NextResponse.json({ data: place }, { status: 201 });
    } catch (error) {
      console.error("Create tourist place error:", error);
      const message = error instanceof Error ? error.message : "Internal server error";
      return NextResponse.json({ message }, { status: 500 });
    }
  },
  { module: "tourist", action: "create" }
);
