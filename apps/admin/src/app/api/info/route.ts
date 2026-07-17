import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async () => {
  try {
    const restaurant = await prisma.restaurant.findFirst();
    return NextResponse.json({ data: restaurant });
  } catch (error) {
    console.error("Get restaurant info error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});

export const PUT = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const {
        name,
        slug,
        description,
        address,
        phone,
        email,
        latitude,
        longitude,
        openingHours,
        holidays,
        socialLinks,
        isActive,
      } = body;

      let restaurant = await prisma.restaurant.findFirst();

      if (restaurant) {
        restaurant = await prisma.restaurant.update({
          where: { id: restaurant.id },
          data: {
            name,
            slug,
            description,
            address,
            phone,
            email,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            openingHours,
            holidays,
            socialLinks,
            isActive,
          },
        });
      } else {
        restaurant = await prisma.restaurant.create({
          data: {
            name: name || "Restaurant",
            slug: slug || "restaurant",
            description,
            address,
            phone,
            email,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            openingHours,
            holidays,
            socialLinks,
            isActive: isActive !== false,
          },
        });
      }

      return NextResponse.json({ data: restaurant });
    } catch (error) {
      console.error("Update restaurant info error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "info", action: "update" }
);
