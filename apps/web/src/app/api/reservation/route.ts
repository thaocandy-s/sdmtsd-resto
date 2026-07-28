import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reservationSchema } from "@/lib/validation";

// POST /api/reservation - Create reservation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = reservationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, phone, date, time, guests, course, notes } = parsed.data;

    const reservation = await prisma.reservation.create({
      data: {
        name,
        email,
        phone,
        date,
        time,
        guests,
        course,
        notes,
      },
    });

    return NextResponse.json({ data: reservation }, { status: 201 });
  } catch (error) {
    console.error("Create reservation error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
