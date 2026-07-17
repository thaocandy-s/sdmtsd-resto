import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";

export const GET = withAuthParams(async (_request, { params }) => {
  try {
    const drink = await prisma.drink.findUnique({
      where: { id: params.id },
      include: { category: true },
    });
    if (!drink) return NextResponse.json({ message: "Drink not found" }, { status: 404 });
    return NextResponse.json({ data: drink });
  } catch (error) {
    console.error("Get drink error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});

export const PUT = withAuthParams(
  async (request, { params }) => {
    try {
      const body = await request.json();
      const existing = await prisma.drink.findUnique({ where: { id: params.id } });
      if (!existing) return NextResponse.json({ message: "Drink not found" }, { status: 404 });

      if (body.slug && body.slug !== existing.slug) {
        const slugExists = await prisma.drink.findUnique({ where: { slug: body.slug } });
        if (slugExists)
          return NextResponse.json({ message: "Slug already exists" }, { status: 400 });
      }

      const drink = await prisma.drink.update({
        where: { id: params.id },
        data: {
          ...body,
          price: body.price !== undefined ? parseInt(body.price) : undefined,
          originalPrice:
            body.originalPrice !== undefined
              ? body.originalPrice
                ? parseInt(body.originalPrice)
                : null
              : undefined,
          alcoholPercent:
            body.alcoholPercent !== undefined
              ? body.alcoholPercent
                ? parseFloat(body.alcoholPercent)
                : null
              : undefined,
          sortOrder:
            body.sortOrder !== undefined
              ? body.sortOrder
                ? parseInt(body.sortOrder)
                : 0
              : undefined,
        },
        include: { category: true },
      });
      return NextResponse.json({ data: drink });
    } catch (error) {
      console.error("Update drink error:", error);
      const message = error instanceof Error ? error.message : "Internal server error";
      return NextResponse.json({ message }, { status: 500 });
    }
  },
  { module: "drink", action: "update" }
);

export const DELETE = withAuthParams(
  async (_request, { params }) => {
    try {
      const existing = await prisma.drink.findUnique({ where: { id: params.id } });
      if (!existing) return NextResponse.json({ message: "Drink not found" }, { status: 404 });
      await prisma.drink.update({ where: { id: params.id }, data: { deletedAt: new Date() } });
      return NextResponse.json({ message: "Drink deleted successfully" });
    } catch (error) {
      console.error("Delete drink error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "drink", action: "delete" }
);
