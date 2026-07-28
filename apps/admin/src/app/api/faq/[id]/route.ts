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

      // sortOrder is system-managed; explicit position and category changes
      // are handled by the shared ordering service.
      const position = positionValue.parse(body.position);
      const { question, answer, categoryId, isPublished } = body;

      const faq = await updateOrdered(
        "faq",
        params.id,
        {
          previousScope: existing.categoryId,
          nextScope: categoryId ?? existing.categoryId,
          position,
        },
        (tx, sortOrder) =>
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
      const faq = await prisma.faq.update({
        where: { id: params.id },
        data: { deletedAt: new Date() },
      });
      await normalizeScope("faq", faq.categoryId);
      return NextResponse.json({ message: "FAQ deleted" });
    } catch (error) {
      console.error("Delete FAQ error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "faq", action: "delete" }
);
