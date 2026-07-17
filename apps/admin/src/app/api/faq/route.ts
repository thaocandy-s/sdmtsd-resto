import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async () => {
  try {
    const [faqs, categories] = await Promise.all([
      prisma.faq.findMany({
        where: { deletedAt: null },
        include: { category: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.faqCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    ]);
    return NextResponse.json({ data: faqs, categories });
  } catch (error) {
    console.error("Get FAQs error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const { question, answer, categoryId, isPublished, sortOrder } = body;
      if (!question || !answer || !categoryId)
        return NextResponse.json(
          { message: "Question, answer, and category are required" },
          { status: 400 }
        );

      const faq = await prisma.faq.create({
        data: {
          question,
          answer,
          categoryId,
          isPublished: isPublished || false,
          sortOrder: sortOrder || 0,
        },
        include: { category: true },
      });
      return NextResponse.json({ data: faq }, { status: 201 });
    } catch (error) {
      console.error("Create FAQ error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "faq", action: "create" }
);
