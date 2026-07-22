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

    const [items, total] = await Promise.all([
      prisma.beerArt.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sortOrder: "asc" },
      }),
      prisma.beerArt.count({ where }),
    ]);

    return NextResponse.json({
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get beer art error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const { title, description, imageUrl, customerName, artistName, isPublished, sortOrder } =
        body;
      if (!title || !imageUrl)
        return NextResponse.json({ message: "Title and image URL are required" }, { status: 400 });

      const item = await prisma.beerArt.create({
        data: {
          title,
          description,
          imageUrl,
          customerName,
          artistName,
          isPublished: isPublished || false,
          sortOrder: sortOrder ? parseInt(sortOrder) : 0,
        },
      });
      return NextResponse.json({ data: item }, { status: 201 });
    } catch (error) {
      console.error("Create beer art error:", error);
      const message = error instanceof Error ? error.message : "Internal server error";
      return NextResponse.json({ message }, { status: 500 });
    }
  },
  { module: "beerArt", action: "create" }
);
