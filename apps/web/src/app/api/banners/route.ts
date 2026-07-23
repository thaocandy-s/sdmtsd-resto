import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const banners = await prisma.heroBanner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ data: banners });
  } catch (error) {
    console.error("Get banners error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
