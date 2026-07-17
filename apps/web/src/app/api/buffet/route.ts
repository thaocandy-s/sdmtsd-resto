import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/buffet - List buffet courses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PUBLISHED";

    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    const courses = await prisma.buffetCourse.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ data: courses });
  } catch (error) {
    console.error("Get buffet courses error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
