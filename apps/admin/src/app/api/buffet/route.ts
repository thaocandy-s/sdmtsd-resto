import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { buffetCreateSchema } from "@/lib/validation";
import { createOrdered } from "@/lib/ordering";

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const requestedLimit = parseInt(searchParams.get("limit") || "10");
    const limit = Math.min(Math.max(1, requestedLimit), 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [buffets, total] = await Promise.all([
      prisma.buffetCourse.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sortOrder: "asc" },
      }),
      prisma.buffetCourse.count({ where }),
    ]);

    return NextResponse.json({
      data: buffets,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get buffets error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const parsed = buffetCreateSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { message: "Invalid input", errors: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const {
        name,
        slug,
        description,
        price,
        duration,
        minPeople,
        maxPeople,
        includes,
        isAllMenu,
        notes,
        imageUrl,
        images,
        isPopular,
        position,
        status,
      } = parsed.data;

      const existing = await prisma.buffetCourse.findUnique({ where: { slug } });
      if (existing)
        return NextResponse.json({ message: "メニュー名が既に存在します" }, { status: 400 });

      const buffet = await createOrdered("buffet", undefined, position, (tx, sortOrder) =>
        tx.buffetCourse.create({
          data: {
            name,
            slug,
            description,
            price,
            duration,
            minPeople,
            maxPeople,
            includes: includes || [],
            isAllMenu: isAllMenu || false,
            notes: notes || null,
            imageUrl,
            images: images || [],
            isPopular: isPopular || false,
            sortOrder,
            status: status || "DRAFT",
          },
        })
      );
      return NextResponse.json({ data: buffet }, { status: 201 });
    } catch (error) {
      console.error("Create buffet error:", error);
      const message = error instanceof Error ? error.message : "Internal server error";
      return NextResponse.json({ message }, { status: 500 });
    }
  },
  { module: "buffet", action: "create" }
);
