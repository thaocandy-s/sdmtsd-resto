import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";
import { deleteMediaByUrl } from "@/lib/supabase";
import { normalizeScope, updateOrdered } from "@/lib/ordering";
import { positionValue } from "@/lib/validation";

export const PUT = withAuthParams(
  async (request, { params }) => {
    try {
      const body = await request.json();
      const existing = await prisma.beerArt.findUnique({ where: { id: params.id } });
      if (!existing) return NextResponse.json({ message: "Item not found" }, { status: 404 });

      if (body.imageUrl !== undefined && body.imageUrl !== existing.imageUrl) {
        await deleteMediaByUrl(existing.imageUrl);
      }

      const position = positionValue.parse(body.position ?? body.sortOrder);
      delete body.position;
      delete body.sortOrder;

      const item = await updateOrdered("beer-art", params.id, { position }, (tx) =>
        tx.beerArt.update({
          where: { id: params.id },
          data: body,
        })
      );
      return NextResponse.json({ data: item });
    } catch (error) {
      console.error("Update beer art error:", error);
      const message = error instanceof Error ? error.message : "Internal server error";
      return NextResponse.json({ message }, { status: 500 });
    }
  },
  { module: "beerArt", action: "update" }
);

export const DELETE = withAuthParams(
  async (_request, { params }) => {
    try {
      const existing = await prisma.beerArt.findUnique({ where: { id: params.id } });
      if (!existing) return NextResponse.json({ message: "Item not found" }, { status: 404 });
      if (existing.imageUrl) {
        await deleteMediaByUrl(existing.imageUrl);
      }
      await prisma.beerArt.update({ where: { id: params.id }, data: { deletedAt: new Date() } });
      await normalizeScope("beer-art");
      return NextResponse.json({ message: "Item deleted successfully" });
    } catch (error) {
      console.error("Delete beer art error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "beerArt", action: "delete" }
);
