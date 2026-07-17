import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";

export const PUT = withAuthParams(
  async (request, { params }) => {
    try {
      const body = await request.json();
      const faq = await prisma.faq.update({
        where: { id: params.id },
        data: body,
        include: { category: true },
      });
      return NextResponse.json({ data: faq });
    } catch (error) {
      console.error("Update FAQ error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "faq", action: "update" }
);

export const DELETE = withAuthParams(
  async (_request, { params }) => {
    try {
      await prisma.faq.update({ where: { id: params.id }, data: { deletedAt: new Date() } });
      return NextResponse.json({ message: "FAQ deleted" });
    } catch (error) {
      console.error("Delete FAQ error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "faq", action: "delete" }
);
