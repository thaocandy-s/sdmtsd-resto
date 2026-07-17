import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// GET /api/beer-art/[id] - Get beer art by ID
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const item = await prisma.beerArt.findFirst({
      where: {
        id,
        deletedAt: null,
        isPublished: true,
      },
    });

    if (!item) {
      return NextResponse.json({ message: "Beer art not found" }, { status: 404 });
    }

    return NextResponse.json({ data: item });
  } catch (error) {
    console.error("Get beer art error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
