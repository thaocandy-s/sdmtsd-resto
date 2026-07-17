import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";
import { supabaseAdmin, MEDIA_BUCKET } from "@/lib/supabase";

export const PUT = withAuthParams(
  async (request, { params }) => {
    try {
      const body = await request.json();
      const media = await prisma.media.update({ where: { id: params.id }, data: body });
      return NextResponse.json({ data: media });
    } catch (error) {
      console.error("Update media error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "media", action: "update" }
);

export const DELETE = withAuthParams(
  async (_request, { params }) => {
    try {
      const media = await prisma.media.findUnique({ where: { id: params.id } });
      if (!media) {
        return NextResponse.json({ message: "Media not found" }, { status: 404 });
      }

      // Remove the underlying storage object first (best-effort); a stored
      // storagePath is only present for files we uploaded to Supabase.
      if (media.storagePath) {
        const { error: storageError } = await supabaseAdmin.storage
          .from(MEDIA_BUCKET)
          .remove([media.storagePath]);
        if (storageError) {
          console.error("Delete storage object error:", storageError);
        }
      }

      await prisma.media.delete({ where: { id: params.id } });
      return NextResponse.json({ message: "Media deleted" });
    } catch (error) {
      console.error("Delete media error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "media", action: "delete" }
);
