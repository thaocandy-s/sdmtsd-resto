import { NextResponse } from "next/server";
import { MediaCoverageCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";
import { deleteMediaByUrl } from "@/lib/supabase";
import { normalizeScope, updateOrdered } from "@/lib/ordering";
import { positionValue } from "@/lib/validation";

const VALID_CATEGORIES = new Set<string>(Object.values(MediaCoverageCategory));

export const PUT = withAuthParams(
  async (request, { params }) => {
    try {
      const body = await request.json();
      const existing = await prisma.mediaCoverage.findUnique({ where: { id: params.id } });
      if (!existing) return NextResponse.json({ message: "Item not found" }, { status: 404 });

      if (body.imageUrl !== undefined && body.imageUrl !== existing.imageUrl) {
        await deleteMediaByUrl(existing.imageUrl);
      }

      if (body.category && !VALID_CATEGORIES.has(body.category)) {
        return NextResponse.json({ message: "Invalid category" }, { status: 400 });
      }

      const position = positionValue.parse(body.position ?? body.sortOrder);
      delete body.position;
      delete body.sortOrder;

      const data = { ...body };
      if (data.publishedAt) data.publishedAt = new Date(data.publishedAt);

      const item = await updateOrdered("media-coverage", params.id, { position }, async (tx) => {
        if (body.isFeatured) {
          await tx.mediaCoverage.updateMany({
            where: {
              deletedAt: null,
              isFeatured: true,
              id: { not: params.id },
            },
            data: { isFeatured: false },
          });
        }
        return tx.mediaCoverage.update({
          where: { id: params.id },
          data,
        });
      });

      return NextResponse.json({ data: item });
    } catch (error) {
      console.error("Update media coverage error:", error);
      const message = error instanceof Error ? error.message : "Internal server error";
      return NextResponse.json({ message }, { status: 500 });
    }
  },
  { module: "mediaCoverage", action: "update" }
);

export const DELETE = withAuthParams(
  async (_request, { params }) => {
    try {
      const existing = await prisma.mediaCoverage.findUnique({ where: { id: params.id } });
      if (!existing) return NextResponse.json({ message: "Item not found" }, { status: 404 });
      if (existing.imageUrl) {
        await deleteMediaByUrl(existing.imageUrl);
      }
      await prisma.mediaCoverage.delete({ where: { id: params.id } });
      await normalizeScope("media-coverage");
      return NextResponse.json({ message: "Item deleted successfully" });
    } catch (error) {
      console.error("Delete media coverage error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "mediaCoverage", action: "delete" }
);
