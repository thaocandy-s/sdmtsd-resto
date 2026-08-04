import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { createOrdered } from "@/lib/ordering";
import { positionValue } from "@/lib/validation";

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.mediaOutlet.findMany({
        skip,
        take: limit,
        orderBy: { sortOrder: "asc" },
      }),
      prisma.mediaOutlet.count(),
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
    console.error("Get media outlets error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const { name, logoUrl, websiteUrl, isActive } = body;

      if (!name || !logoUrl) {
        return NextResponse.json({ message: "Name and logo are required" }, { status: 400 });
      }

      const position = positionValue.parse(body.position ?? body.sortOrder);
      const item = await createOrdered("media-outlet", undefined, position, (tx, sortOrder) =>
        tx.mediaOutlet.create({
          data: {
            name,
            logoUrl,
            websiteUrl: websiteUrl || null,
            isActive: isActive !== false,
            sortOrder,
          },
        })
      );

      return NextResponse.json({ data: item }, { status: 201 });
    } catch (error) {
      console.error("Create media outlet error:", error);
      const message = error instanceof Error ? error.message : "Internal server error";
      return NextResponse.json({ message }, { status: 500 });
    }
  },
  { module: "mediaOutlet", action: "create" }
);
