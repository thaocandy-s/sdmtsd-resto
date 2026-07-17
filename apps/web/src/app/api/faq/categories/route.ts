import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/faq/categories - List FAQ categories
export async function GET() {
  try {
    const categories = await prisma.faqCategory.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            faqs: {
              where: {
                deletedAt: null,
                isPublished: true,
              },
            },
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error("Get FAQ categories error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
