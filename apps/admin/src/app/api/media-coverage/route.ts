import { NextRequest, NextResponse } from "next/server";
import { MediaCoverageCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { createOrdered } from "@/lib/ordering";
import { positionValue } from "@/lib/validation";

const VALID_CATEGORIES = new Set<string>(Object.values(MediaCoverageCategory));

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { mediaName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (category && VALID_CATEGORIES.has(category)) {
      where.category = category as MediaCoverageCategory;
    }
    if (status === "published") where.isPublished = true;
    if (status === "draft") where.isPublished = false;

    const [items, total] = await Promise.all([
      prisma.mediaCoverage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sortOrder: "asc" },
      }),
      prisma.mediaCoverage.count({ where }),
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
    console.error("Get media coverage error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const {
        publishedAt,
        mediaName,
        title,
        description,
        imageUrl,
        externalUrl,
        category,
        isFeatured,
        isPublished,
      } = body;

      if (!title || !imageUrl || !externalUrl || !mediaName || !publishedAt || !category) {
        return NextResponse.json({ message: "Required fields are missing" }, { status: 400 });
      }
      if (!VALID_CATEGORIES.has(category)) {
        return NextResponse.json({ message: "Invalid category" }, { status: 400 });
      }

      const position = positionValue.parse(body.position ?? body.sortOrder);

      const item = await createOrdered(
        "media-coverage",
        undefined,
        position,
        async (tx, sortOrder) => {
          if (isFeatured) {
            await tx.mediaCoverage.updateMany({
              where: { deletedAt: null, isFeatured: true },
              data: { isFeatured: false },
            });
          }
          return tx.mediaCoverage.create({
            data: {
              publishedAt: new Date(publishedAt),
              mediaName,
              title,
              description: description || null,
              imageUrl,
              externalUrl,
              category: category as MediaCoverageCategory,
              isFeatured: isFeatured || false,
              isPublished: isPublished || false,
              sortOrder,
            },
          });
        }
      );

      return NextResponse.json({ data: item }, { status: 201 });
    } catch (error) {
      console.error("Create media coverage error:", error);
      const message = error instanceof Error ? error.message : "Internal server error";
      return NextResponse.json({ message }, { status: 500 });
    }
  },
  { module: "mediaCoverage", action: "create" }
);
