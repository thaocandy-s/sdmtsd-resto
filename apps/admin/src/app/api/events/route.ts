import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async () => {
  try {
    const events = await prisma.event.findMany({ orderBy: { startDate: "desc" } });
    return NextResponse.json({ data: events });
  } catch (error) {
    console.error("Get events error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const { title, description, imageUrl, startDate, endDate, isActive, sortOrder } = body;

      if (!title || !startDate || !endDate) {
        return NextResponse.json(
          { message: "Title, start date, and end date are required" },
          { status: 400 }
        );
      }

      const event = await prisma.event.create({
        data: {
          title,
          description,
          imageUrl,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          isActive: isActive !== false,
          sortOrder: sortOrder || 0,
        },
      });
      return NextResponse.json({ data: event }, { status: 201 });
    } catch (error) {
      console.error("Create event error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "home", action: "create" }
);
