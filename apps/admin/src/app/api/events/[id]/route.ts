import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";

export const PUT = withAuthParams(
  async (request, { params }) => {
    try {
      const body = await request.json();
      const existing = await prisma.event.findUnique({ where: { id: params.id } });
      if (!existing) return NextResponse.json({ message: "Event not found" }, { status: 404 });

      const event = await prisma.event.update({
        where: { id: params.id },
        data: {
          ...body,
          startDate: body.startDate ? new Date(body.startDate) : undefined,
          endDate: body.endDate ? new Date(body.endDate) : undefined,
        },
      });
      return NextResponse.json({ data: event });
    } catch (error) {
      console.error("Update event error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "home", action: "update" }
);

export const DELETE = withAuthParams(
  async (_request, { params }) => {
    try {
      const existing = await prisma.event.findUnique({ where: { id: params.id } });
      if (!existing) return NextResponse.json({ message: "Event not found" }, { status: 404 });
      await prisma.event.delete({ where: { id: params.id } });
      return NextResponse.json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Delete event error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "home", action: "delete" }
);
