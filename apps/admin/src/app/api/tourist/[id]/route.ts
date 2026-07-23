import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";
import { deleteMediaByUrl } from "@/lib/supabase";

export const PUT = withAuthParams(
  async (request, { params }) => {
    try {
      const body = await request.json();
      const existing = await prisma.tourPlace.findUnique({ where: { id: params.id } });
      if (!existing) return NextResponse.json({ message: "Place not found" }, { status: 404 });

      if (body.imageUrl !== undefined && body.imageUrl !== existing.imageUrl) {
        await deleteMediaByUrl(existing.imageUrl);
      }

      if (body.images !== undefined && Array.isArray(body.images)) {
        const deletedImages = existing.images.filter((img) => !body.images.includes(img));
        for (const imgUrl of deletedImages) {
          await deleteMediaByUrl(imgUrl);
        }
      }

      if (body.slug && body.slug !== existing.slug) {
        const slugExists = await prisma.tourPlace.findUnique({ where: { slug: body.slug } });
        if (slugExists)
          return NextResponse.json({ message: "Slug already exists" }, { status: 400 });
      }

      const {
        name,
        slug,
        description,
        categoryId,
        address,
        latitude,
        longitude,
        websiteUrl,
        phone,
        imageUrl,
        images,
        openingHours,
        isPublished,
        sortOrder,
      } = body;

      const place = await prisma.tourPlace.update({
        where: { id: params.id },
        data: {
          name,
          slug,
          description,
          categoryId,
          address,
          latitude: latitude ? parseFloat(latitude as any) : null,
          longitude: longitude ? parseFloat(longitude as any) : null,
          websiteUrl,
          phone,
          imageUrl,
          images: images || [],
          openingHours,
          isPublished: isPublished !== undefined ? isPublished : undefined,
          sortOrder:
            sortOrder !== undefined ? (sortOrder ? parseInt(sortOrder as any) : 0) : undefined,
        },
        include: { category: true },
      });
      return NextResponse.json({ data: place });
    } catch (error) {
      console.error("Update tourist place error:", error);
      const message = error instanceof Error ? error.message : "Internal server error";
      return NextResponse.json({ message }, { status: 500 });
    }
  },
  { module: "tourist", action: "update" }
);

export const DELETE = withAuthParams(
  async (_request, { params }) => {
    try {
      const existing = await prisma.tourPlace.findUnique({ where: { id: params.id } });
      if (!existing) return NextResponse.json({ message: "Place not found" }, { status: 404 });

      if (existing.imageUrl) {
        await deleteMediaByUrl(existing.imageUrl);
      }

      if (existing.images && Array.isArray(existing.images)) {
        for (const imgUrl of existing.images) {
          await deleteMediaByUrl(imgUrl);
        }
      }

      await prisma.tourPlace.update({ where: { id: params.id }, data: { deletedAt: new Date() } });
      return NextResponse.json({ message: "Place deleted" });
    } catch (error) {
      console.error("Delete tourist place error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "tourist", action: "delete" }
);
