import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "";
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (unreadOnly) where.isRead = false;

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.contact.count({ where }),
    ]);

    return NextResponse.json({
      data: contacts,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});
