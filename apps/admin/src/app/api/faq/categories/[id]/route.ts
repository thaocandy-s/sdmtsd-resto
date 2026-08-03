import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";
import { normalizeScope, updateOrdered } from "@/lib/ordering";
import { positionValue } from "@/lib/validation";

export const PUT = withAuthParams(
  async (request, { params }) => {
    try {
      const body = await request.json();
      const { name, slug, description, isActive } = body;
      const position = positionValue.parse(body.position);

      const existing = await prisma.faqCategory.findUnique({
        where: { id: params.id },
      });
      if (!existing) {
        return NextResponse.json({ message: "Category not found" }, { status: 404 });
      }

      if (slug && slug !== existing.slug) {
        const slugExists = await prisma.faqCategory.findUnique({
          where: { slug },
        });
        if (slugExists) {
          return NextResponse.json({ message: "カテゴリー名が既に存在します" }, { status: 400 });
        }
      }

      const category = await updateOrdered("faq-category", params.id, { position }, (tx) =>
        tx.faqCategory.update({
          where: { id: params.id },
          data: {
            ...(name !== undefined ? { name } : {}),
            ...(slug !== undefined ? { slug } : {}),
            ...(description !== undefined ? { description } : {}),
            ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
          },
        })
      );
      return NextResponse.json({ data: category });
    } catch (error) {
      console.error("Update FAQ category error:", error);
      const message = error instanceof Error ? error.message : "Internal server error";
      return NextResponse.json({ message }, { status: 500 });
    }
  },
  { module: "faq", action: "update" }
);

export const DELETE = withAuthParams(
  async (_request, { params }) => {
    try {
      const faqCount = await prisma.faq.count({
        where: { categoryId: params.id, deletedAt: null },
      });
      if (faqCount > 0) {
        return NextResponse.json(
          {
            message: `Cannot delete: category still has ${faqCount} FAQ(s). Move or delete them first.`,
          },
          { status: 400 }
        );
      }
      // Purge soft-deleted FAQs still referencing this category, then delete it
      await prisma.$transaction([
        prisma.faq.deleteMany({ where: { categoryId: params.id, deletedAt: { not: null } } }),
        prisma.faqCategory.delete({ where: { id: params.id } }),
      ]);
      await normalizeScope("faq-category");
      return NextResponse.json({ message: "Category deleted" });
    } catch (error) {
      console.error("Delete FAQ category error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "faq", action: "delete" }
);
