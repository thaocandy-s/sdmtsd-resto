import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";

export const PUT = withAuthParams(
  async (request, { params }) => {
    try {
      const body = await request.json();
      const category = await prisma.faqCategory.update({ where: { id: params.id }, data: body });
      return NextResponse.json({ data: category });
    } catch (error) {
      console.error("Update FAQ category error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "faq", action: "update" }
);

export const DELETE = withAuthParams(
  async (_request, { params }) => {
    try {
      const faqCount = await prisma.faq.count({ where: { categoryId: params.id } });
      if (faqCount > 0) {
        return NextResponse.json(
          {
            message: `Cannot delete: category still has ${faqCount} FAQ(s). Move or delete them first.`,
          },
          { status: 400 }
        );
      }
      await prisma.faqCategory.delete({ where: { id: params.id } });
      return NextResponse.json({ message: "Category deleted" });
    } catch (error) {
      console.error("Delete FAQ category error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "faq", action: "delete" }
);
