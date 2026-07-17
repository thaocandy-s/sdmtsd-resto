import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/info - Get restaurant information
export async function GET() {
  try {
    const restaurant = await prisma.restaurant.findFirst({
      where: { isActive: true },
    });

    if (!restaurant) {
      return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });
    }

    return NextResponse.json({ data: restaurant });
  } catch (error) {
    console.error("Get restaurant info error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
