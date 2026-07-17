import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";

export const PUT = withAuthParams(
  async (request, { params }) => {
    try {
      const body = await request.json();
      const existing = await prisma.tourPlace.findUnique({ where: { id: params.id } });
      if (!existing) return NextResponse.json({ message: "Place not found" }, { status: 404 });

      if (body.slug && body.slug !== existing.slug) {
        const slugExists = await prisma.tourPlace.findUnique({ where: { slug: body.slug } });
        if (slugExists)
          return NextResponse.json({ message: "Slug already exists" }, { status: 400 });
      }

      const place = await prisma.tourPlace.update({
        where: { id: params.id },
        data: {
          ...body,
          latitude: body.latitude ? parseFloat(body.latitude) : undefined,
          longitude: body.longitude ? parseFloat(body.longitude) : undefined,
          sortOrder:
            body.sortOrder !== undefined
              ? body.sortOrder
                ? parseInt(body.sortOrder)
                : 0
              : undefined,
        },
        include: { category: true },
      });
      return NextResponse.json({ data: place });
    } catch (error) {
      console.error("Update tourist place error:", error);
      const message = error instanceof Error ? error.message : "Internal server error";
      return NextResponse.json({ message }, { status: 500 });
    }
  },
  { module: "tourist", action: "update" }
);

export const DELETE = withAuthParams(
  async (_request, { params }) => {
    try {
      await prisma.tourPlace.update({ where: { id: params.id }, data: { deletedAt: new Date() } });
      return NextResponse.json({ message: "Place deleted" });
    } catch (error) {
      console.error("Delete tourist place error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "tourist", action: "delete" }
);
