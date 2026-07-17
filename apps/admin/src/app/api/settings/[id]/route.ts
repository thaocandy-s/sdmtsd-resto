import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthParams } from "@/lib/auth";

export const DELETE = withAuthParams(
  async (_request, { params }) => {
    try {
      await prisma.setting.delete({ where: { id: params.id } });
      return NextResponse.json({ message: "Deleted" });
    } catch (error) {
      console.error("Delete setting error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "settings", action: "update" }
);
