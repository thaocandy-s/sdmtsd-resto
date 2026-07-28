import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { createOrdered } from "@/lib/ordering";
import { positionValue } from "@/lib/validation";

export const GET = withAuth(async () => {
  try {
    const banners = await prisma.heroBanner.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ data: banners });
  } catch (error) {
    console.error("Get banners error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const {
        title,
        subtitle,
        imageUrl,
        mobileImageUrl,
        ctaLabel,
        ctaUrl,
        isActive,
        startDate,
        endDate,
      } = body;

      if (!title || !imageUrl) {
        return NextResponse.json({ message: "Title and image URL are required" }, { status: 400 });
      }

      const position = positionValue.parse(body.position);
      const banner = await createOrdered("banner", undefined, position, (tx, sortOrder) =>
        tx.heroBanner.create({
          data: {
            title,
            subtitle,
            imageUrl,
            mobileImageUrl,
            ctaLabel,
            ctaUrl,
            sortOrder,
            isActive: isActive !== false,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
          },
        })
      );
      return NextResponse.json({ data: banner }, { status: 201 });
    } catch (error) {
      console.error("Create banner error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "home", action: "create" }
);
