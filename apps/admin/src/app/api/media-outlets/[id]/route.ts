import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";
import { deleteMediaByUrl } from "@/lib/supabase";
import { normalizeScope, updateOrdered } from "@/lib/ordering";
import { positionValue } from "@/lib/validation";

export const PUT = withAuthParams(
  async (request, { params }) => {
    try {
      const body = await request.json();
      const existing = await prisma.mediaOutlet.findUnique({ where: { id: params.id } });
      if (!existing) return NextResponse.json({ message: "Item not found" }, { status: 404 });

      if (body.logoUrl !== undefined && body.logoUrl !== existing.logoUrl) {
        await deleteMediaByUrl(existing.logoUrl);
      }

      const position = positionValue.parse(body.position ?? body.sortOrder);
      delete body.position;
      delete body.sortOrder;

      const item = await updateOrdered("media-outlet", params.id, { position }, (tx) =>
        tx.mediaOutlet.update({
          where: { id: params.id },
          data: body,
        })
      );

      return NextResponse.json({ data: item });
    } catch (error) {
      console.error("Update media outlet error:", error);
      const message = error instanceof Error ? error.message : "Internal server error";
      return NextResponse.json({ message }, { status: 500 });
    }
  },
  { module: "mediaOutlet", action: "update" }
);

export const DELETE = withAuthParams(
  async (_request, { params }) => {
    try {
      const existing = await prisma.mediaOutlet.findUnique({ where: { id: params.id } });
      if (!existing) return NextResponse.json({ message: "Item not found" }, { status: 404 });
      if (existing.logoUrl) {
        await deleteMediaByUrl(existing.logoUrl);
      }
      await prisma.mediaOutlet.delete({ where: { id: params.id } });
      await normalizeScope("media-outlet");
      return NextResponse.json({ message: "Item deleted successfully" });
    } catch (error) {
      console.error("Delete media outlet error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "mediaOutlet", action: "delete" }
);
