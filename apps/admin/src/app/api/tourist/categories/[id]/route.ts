import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";

export const PUT = withAuthParams(
  async (request, { params }) => {
    try {
      const body = await request.json();
      const category = await prisma.tourCategory.update({ where: { id: params.id }, data: body });
      return NextResponse.json({ data: category });
    } catch (error) {
      console.error("Update tour category error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "tourist", action: "update" }
);

export const DELETE = withAuthParams(
  async (_request, { params }) => {
    try {
      await prisma.tourCategory.delete({ where: { id: params.id } });
      return NextResponse.json({ message: "Category deleted" });
    } catch (error) {
      console.error("Delete tour category error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "tourist", action: "delete" }
);
