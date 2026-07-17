import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/contact - Submit contact form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: "Name, email, subject, and message are required" },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        subject,
        message,
      },
    });

    return NextResponse.json({ data: contact }, { status: 201 });
  } catch (error) {
    console.error("Create contact error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
