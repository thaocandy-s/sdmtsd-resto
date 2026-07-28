import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";
import { deleteMediaByUrl } from "@/lib/supabase";
import { drinkUpdateSchema } from "@/lib/validation";

export const GET = withAuthParams(async (_request, { params }) => {
  try {
    const drink = await prisma.drink.findUnique({
      where: { id: params.id },
      include: { category: true },
    });
    if (!drink) return NextResponse.json({ message: "Drink not found" }, { status: 404 });
    return NextResponse.json({ data: drink });
  } catch (error) {
    console.error("Get drink error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});

export const PUT = withAuthParams(
  async (request, { params }) => {
    try {
      const body = await request.json();
      const parsed = drinkUpdateSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { message: "Invalid input", errors: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const data = parsed.data;
      const existing = await prisma.drink.findUnique({ where: { id: params.id } });
      if (!existing) return NextResponse.json({ message: "Drink not found" }, { status: 404 });

      if (data.slug && data.slug !== existing.slug) {
        const slugExists = await prisma.drink.findUnique({ where: { slug: data.slug } });
        if (slugExists)
          return NextResponse.json({ message: "Slug already exists" }, { status: 400 });
      }

      const drink = await prisma.drink.update({
        where: { id: params.id },
        data,
        include: { category: true },
      });

      // DB updated successfully — now it is safe to remove the replaced image
      if (data.imageUrl !== undefined && data.imageUrl !== existing.imageUrl) {
        await deleteMediaByUrl(existing.imageUrl);
      }

      return NextResponse.json({ data: drink });
    } catch (error) {
      console.error("Update drink error:", error);
      const message = error instanceof Error ? error.message : "Internal server error";
      return NextResponse.json({ message }, { status: 500 });
    }
  },
  { module: "drink", action: "update" }
);

export const DELETE = withAuthParams(
  async (_request, { params }) => {
    try {
      const existing = await prisma.drink.findUnique({ where: { id: params.id } });
      if (!existing) return NextResponse.json({ message: "Drink not found" }, { status: 404 });
      // Soft delete first, then clean up storage
      await prisma.drink.update({ where: { id: params.id }, data: { deletedAt: new Date() } });
      if (existing.imageUrl) {
        await deleteMediaByUrl(existing.imageUrl);
      }
      return NextResponse.json({ message: "Drink deleted successfully" });
    } catch (error) {
      console.error("Delete drink error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "drink", action: "delete" }
);
