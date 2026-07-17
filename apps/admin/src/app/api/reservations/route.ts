import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.reservation.count({ where }),
    ]);

    return NextResponse.json({
      data: reservations,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get reservations error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});
