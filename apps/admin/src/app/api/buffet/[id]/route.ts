import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";
import { deleteMediaByUrl } from "@/lib/supabase";
import { buffetUpdateSchema } from "@/lib/validation";
import { normalizeScope, updateOrdered } from "@/lib/ordering";

export const PUT = withAuthParams(
  async (request, { params }) => {
    try {
      const body = await request.json();
      const parsed = buffetUpdateSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { message: "Invalid input", errors: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const { position, ...data } = parsed.data;
      const existing = await prisma.buffetCourse.findUnique({ where: { id: params.id } });
      if (!existing) return NextResponse.json({ message: "Buffet not found" }, { status: 404 });

      if (data.slug && data.slug !== existing.slug) {
        const slugExists = await prisma.buffetCourse.findUnique({ where: { slug: data.slug } });
        if (slugExists)
          return NextResponse.json({ message: "Slug already exists" }, { status: 400 });
      }

      const buffet = await updateOrdered("buffet", params.id, { position }, (tx) =>
        tx.buffetCourse.update({
          where: { id: params.id },
          data,
        })
      );

      // DB updated successfully — now it is safe to remove the replaced image
      if (data.imageUrl !== undefined && data.imageUrl !== existing.imageUrl) {
        await deleteMediaByUrl(existing.imageUrl);
      }

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
      // Hard delete from database
      await prisma.buffetCourse.delete({
        where: { id: params.id },
      });
      await normalizeScope("buffet");
      if (existing.imageUrl) {
        await deleteMediaByUrl(existing.imageUrl);
      }
      return NextResponse.json({ message: "Buffet deleted successfully" });
    } catch (error) {
      console.error("Delete buffet error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "buffet", action: "delete" }
);
