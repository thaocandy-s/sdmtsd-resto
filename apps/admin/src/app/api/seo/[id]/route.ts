import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";

export const PUT = withAuthParams(
  async (request, { params }) => {
    try {
      const body = await request.json();
      const seo = await prisma.seoMeta.update({ where: { id: params.id }, data: body });
      return NextResponse.json({ data: seo });
    } catch (error) {
      console.error("Update SEO error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "seo", action: "update" }
);

export const DELETE = withAuthParams(
  async (_request, { params }) => {
    try {
      await prisma.seoMeta.delete({ where: { id: params.id } });
      return NextResponse.json({ message: "SEO meta deleted" });
    } catch (error) {
      console.error("Delete SEO error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "seo", action: "delete" }
);
