import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/reservation - Create reservation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, date, time, guests, course, notes } = body;

    if (!name || !email || !date || !time || !guests) {
      return NextResponse.json(
        { message: "Name, email, date, time, and guests are required" },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.create({
      data: {
        name,
        email,
        phone,
        date: new Date(date),
        time,
        guests: parseInt(guests),
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
