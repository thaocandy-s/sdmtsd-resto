import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ slug: string }> };

// GET /api/tourist/[slug] - Get tour place by slug
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;

    const place = await prisma.tourPlace.findFirst({
      where: {
        slug,
        deletedAt: null,
        isPublished: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!place) {
      return NextResponse.json({ message: "Place not found" }, { status: 404 });
    }

    return NextResponse.json({ data: place });
  } catch (error) {
    console.error("Get tour place error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
