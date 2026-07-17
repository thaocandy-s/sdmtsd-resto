import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const folder = searchParams.get("folder") || "";
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (folder) where.folder = folder;
    if (search) where.fileName = { contains: search, mode: "insensitive" };

    const [media, total] = await Promise.all([
      prisma.media.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.media.count({ where }),
    ]);

    return NextResponse.json({
      data: media,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get media error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const {
        fileName,
        url,
        storagePath,
        mimeType,
        size,
        width,
        height,
        alt,
        tags,
        folder,
        uploadedBy,
      } = body;
      if (!fileName || !url || !storagePath || !mimeType)
        return NextResponse.json(
          { message: "fileName, url, storagePath, and mimeType are required" },
          { status: 400 }
        );

      const media = await prisma.media.create({
        data: {
          fileName,
          url,
          storagePath,
          mimeType,
          size: size || 0,
          width,
          height,
          alt,
          tags: tags || [],
          folder,
          uploadedBy,
        },
      });
      return NextResponse.json({ data: media }, { status: 201 });
    } catch (error) {
      console.error("Create media error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "media", action: "create" }
);
