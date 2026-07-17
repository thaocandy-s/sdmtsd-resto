import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";

export const PUT = withAuthParams(
  async (request, { params }) => {
    try {
      const body = await request.json();
      const winner = await prisma.katanukiWinner.update({ where: { id: params.id }, data: body });
      return NextResponse.json({ data: winner });
    } catch (error) {
      console.error("Update winner error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "challenge", action: "update" }
);

export const DELETE = withAuthParams(
  async (_request, { params }) => {
    try {
      await prisma.katanukiWinner.delete({ where: { id: params.id } });
      return NextResponse.json({ message: "Winner deleted" });
    } catch (error) {
      console.error("Delete winner error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "challenge", action: "delete" }
);
