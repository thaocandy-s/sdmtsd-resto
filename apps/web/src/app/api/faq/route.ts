import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/faq - List FAQs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";

    const where: Record<string, unknown> = {
      deletedAt: null,
      isPublished: true,
    };

    if (category) {
      where.category = {
        slug: category,
        isActive: true,
      };
    }

    if (search) {
      where.OR = [
        { question: { contains: search, mode: "insensitive" } },
        { answer: { contains: search, mode: "insensitive" } },
      ];
    }

    const faqs = await prisma.faq.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ data: faqs });
  } catch (error) {
    console.error("Get FAQs error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
