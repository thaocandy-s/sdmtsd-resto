import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";
import { deleteMediaByUrl } from "@/lib/supabase";

export const PUT = withAuthParams(
  async (request, { params }) => {
    try {
      const body = await request.json();
      const existing = await prisma.heroBanner.findUnique({ where: { id: params.id } });
      if (!existing) return NextResponse.json({ message: "Banner not found" }, { status: 404 });

      const banner = await prisma.heroBanner.update({
        where: { id: params.id },
        data: {
          ...body,
          startDate: body.startDate ? new Date(body.startDate) : null,
          endDate: body.endDate ? new Date(body.endDate) : null,
        },
      });
      return NextResponse.json({ data: banner });
    } catch (error) {
      console.error("Update banner error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "home", action: "update" }
);

export const DELETE = withAuthParams(
  async (_request, { params }) => {
    try {
      const existing = await prisma.heroBanner.findUnique({ where: { id: params.id } });
      if (!existing) return NextResponse.json({ message: "Banner not found" }, { status: 404 });

      if (existing.imageUrl) {
        await deleteMediaByUrl(existing.imageUrl);
      }

      await prisma.heroBanner.delete({ where: { id: params.id } });
      return NextResponse.json({ message: "Banner deleted successfully" });
    } catch (error) {
      console.error("Delete banner error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "home", action: "delete" }
);
