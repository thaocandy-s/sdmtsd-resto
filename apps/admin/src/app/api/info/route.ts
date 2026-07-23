import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

export async function GET() {
  try {
    const restaurant = await prisma.restaurant.findFirst();
    return NextResponse.json({ data: restaurant });
  } catch (error) {
    console.error("Get restaurant info error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

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
        googlePlaceId,
        googleMapQuery,
        openingHours,
        holidays,
        socialLinks,
        logoUrl,
        faviconUrl,
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
            googlePlaceId: googlePlaceId || null,
            googleMapQuery: googleMapQuery || null,
            openingHours,
            holidays,
            socialLinks,
            logoUrl,
            faviconUrl,
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
            googlePlaceId: googlePlaceId || null,
            googleMapQuery: googleMapQuery || null,
            openingHours,
            holidays,
            socialLinks,
            logoUrl,
            faviconUrl,
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
