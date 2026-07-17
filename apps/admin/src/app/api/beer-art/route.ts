import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async () => {
  try {
    const items = await prisma.beerArt.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ data: items });
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
