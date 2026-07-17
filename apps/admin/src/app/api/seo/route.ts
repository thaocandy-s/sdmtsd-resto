import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path") || "";

    if (path) {
      const seo = await prisma.seoMeta.findUnique({ where: { pagePath: path } });
      return NextResponse.json({ data: seo });
    }

    const seoMetas = await prisma.seoMeta.findMany({ orderBy: { pagePath: "asc" } });
    return NextResponse.json({ data: seoMetas });
  } catch (error) {
    console.error("Get SEO error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const {
        pagePath,
        title,
        description,
        keywords,
        ogImage,
        ogTitle,
        ogDescription,
        canonicalUrl,
        noIndex,
        jsonLd,
      } = body;
      if (!pagePath)
        return NextResponse.json({ message: "Page path is required" }, { status: 400 });

      const existing = await prisma.seoMeta.findUnique({ where: { pagePath } });
      if (existing)
        return NextResponse.json(
          { message: "SEO meta for this path already exists" },
          { status: 400 }
        );

      const seo = await prisma.seoMeta.create({
        data: {
          pagePath,
          title,
          description,
          keywords: keywords || [],
          ogImage,
          ogTitle,
          ogDescription,
          canonicalUrl,
          noIndex: noIndex || false,
          jsonLd,
        },
      });
      return NextResponse.json({ data: seo }, { status: 201 });
    } catch (error) {
      console.error("Create SEO error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "seo", action: "create" }
);
