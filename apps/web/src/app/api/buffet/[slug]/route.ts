import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ slug: string }> };

// GET /api/buffet/[slug] - Get buffet course by slug
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;

    const course = await prisma.buffetCourse.findFirst({
      where: {
        slug,
        deletedAt: null,
        status: "PUBLISHED",
      },
    });

    if (!course) {
      return NextResponse.json({ message: "Buffet course not found" }, { status: 404 });
    }

    return NextResponse.json({ data: course });
  } catch (error) {
    console.error("Get buffet course error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
