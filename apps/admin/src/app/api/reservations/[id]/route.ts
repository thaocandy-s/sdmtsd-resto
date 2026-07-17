import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";

export const GET = withAuthParams(async (_request, { params }) => {
  try {
    const reservation = await prisma.reservation.findUnique({ where: { id: params.id } });
    if (!reservation)
      return NextResponse.json({ message: "Reservation not found" }, { status: 404 });
    return NextResponse.json({ data: reservation });
  } catch (error) {
    console.error("Get reservation error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});

export const PUT = withAuthParams(
  async (request, { params }) => {
    try {
      const body = await request.json();
      const existing = await prisma.reservation.findUnique({ where: { id: params.id } });
      if (!existing)
        return NextResponse.json({ message: "Reservation not found" }, { status: 404 });

      const reservation = await prisma.reservation.update({
        where: { id: params.id },
        data: { status: body.status, notes: body.notes },
      });
      return NextResponse.json({ data: reservation });
    } catch (error) {
      console.error("Update reservation error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "reservation", action: "update" }
);

export const DELETE = withAuthParams(
  async (_request, { params }) => {
    try {
      const existing = await prisma.reservation.findUnique({ where: { id: params.id } });
      if (!existing)
        return NextResponse.json({ message: "Reservation not found" }, { status: 404 });
      await prisma.reservation.delete({ where: { id: params.id } });
      return NextResponse.json({ message: "Reservation deleted successfully" });
    } catch (error) {
      console.error("Delete reservation error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "reservation", action: "delete" }
);
