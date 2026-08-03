import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";
import { normalizeScope, updateOrdered } from "@/lib/ordering";
import { positionValue } from "@/lib/validation";

export const PUT = withAuthParams(
  async (request, { params }) => {
    try {
      const body = await request.json();
      const existing = await prisma.faq.findUnique({ where: { id: params.id } });
      if (!existing) return NextResponse.json({ message: "FAQ not found" }, { status: 404 });

      // sortOrder is system-managed and global across categories, so a
      // category change keeps the item's position in the overall list.
      const position = positionValue.parse(body.position);
      const { question, answer, categoryId, isPublished } = body;

      const faq = await updateOrdered("faq", params.id, { position }, (tx, sortOrder) =>
        tx.faq.update({
          where: { id: params.id },
          data: {
            question,
            answer,
            categoryId,
            isPublished,
            ...(sortOrder !== undefined ? { sortOrder } : {}),
          },
          include: { category: true },
        })
      );
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
      await prisma.faq.delete({
        where: { id: params.id },
      });
      await normalizeScope("faq", undefined);
      return NextResponse.json({ message: "FAQ deleted" });
    } catch (error) {
      console.error("Delete FAQ error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "faq", action: "delete" }
);
