import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";

export const GET = withAuthParams(async (_request, { params }) => {
  try {
    const contact = await prisma.contact.findUnique({ where: { id: params.id } });
    if (!contact) return NextResponse.json({ message: "Contact not found" }, { status: 404 });

    // Mark as read if not already
    if (!contact.isRead) {
      await prisma.contact.update({ where: { id: params.id }, data: { isRead: true } });
    }

    return NextResponse.json({ data: { ...contact, isRead: true } });
  } catch (error) {
    console.error("Get contact error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});

export const PUT = withAuthParams(
  async (request, { params }) => {
    try {
      const body = await request.json();
      const existing = await prisma.contact.findUnique({ where: { id: params.id } });
      if (!existing) return NextResponse.json({ message: "Contact not found" }, { status: 404 });

      const contact = await prisma.contact.update({
        where: { id: params.id },
        data: { status: body.status, isRead: body.isRead },
      });
      return NextResponse.json({ data: contact });
    } catch (error) {
      console.error("Update contact error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "contact", action: "update" }
);

export const DELETE = withAuthParams(
  async (_request, { params }) => {
    try {
      const existing = await prisma.contact.findUnique({ where: { id: params.id } });
      if (!existing) return NextResponse.json({ message: "Contact not found" }, { status: 404 });
      await prisma.contact.delete({ where: { id: params.id } });
      return NextResponse.json({ message: "Contact deleted successfully" });
    } catch (error) {
      console.error("Delete contact error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "contact", action: "delete" }
);
