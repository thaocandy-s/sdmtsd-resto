import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";

export const PUT = withAuthParams(
  async (request, { params }) => {
    try {
      const body = await request.json();
      const existing = await prisma.buffetCourse.findUnique({ where: { id: params.id } });
      if (!existing) return NextResponse.json({ message: "Buffet not found" }, { status: 404 });

      if (body.slug && body.slug !== existing.slug) {
        const slugExists = await prisma.buffetCourse.findUnique({ where: { slug: body.slug } });
        if (slugExists)
          return NextResponse.json({ message: "Slug already exists" }, { status: 400 });
      }

      const buffet = await prisma.buffetCourse.update({
        where: { id: params.id },
        data: {
          ...body,
          price: body.price !== undefined ? parseInt(body.price) : undefined,
          duration: body.duration !== undefined ? parseInt(body.duration) : undefined,
          minPeople:
            body.minPeople !== undefined
              ? body.minPeople
                ? parseInt(body.minPeople)
                : null
              : undefined,
          maxPeople:
            body.maxPeople !== undefined
              ? body.maxPeople
                ? parseInt(body.maxPeople)
                : null
              : undefined,
          sortOrder:
            body.sortOrder !== undefined
              ? body.sortOrder
                ? parseInt(body.sortOrder)
                : 0
              : undefined,
        },
      });
      return NextResponse.json({ data: buffet });
    } catch (error) {
      console.error("Update buffet error:", error);
      const message = error instanceof Error ? error.message : "Internal server error";
      return NextResponse.json({ message }, { status: 500 });
    }
  },
  { module: "buffet", action: "update" }
);

export const DELETE = withAuthParams(
  async (_request, { params }) => {
    try {
      const existing = await prisma.buffetCourse.findUnique({ where: { id: params.id } });
      if (!existing) return NextResponse.json({ message: "Buffet not found" }, { status: 404 });
      await prisma.buffetCourse.update({
        where: { id: params.id },
        data: { deletedAt: new Date() },
      });
      return NextResponse.json({ message: "Buffet deleted successfully" });
    } catch (error) {
      console.error("Delete buffet error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "buffet", action: "delete" }
);
