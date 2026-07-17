import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const group = searchParams.get("group") || "";

      const where: Record<string, unknown> = {};
      if (group) where.group = group;

      const settings = await prisma.setting.findMany({ where, orderBy: { key: "asc" } });
      return NextResponse.json({ data: settings });
    } catch (error) {
      console.error("Get settings error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "settings", action: "read" }
);

export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const { key, value, group } = body;
      if (!key) return NextResponse.json({ message: "Key is required" }, { status: 400 });

      const setting = await prisma.setting.upsert({
        where: { key },
        update: { value, group: group || "general" },
        create: { key, value, group: group || "general" },
      });
      return NextResponse.json({ data: setting });
    } catch (error) {
      console.error("Save setting error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "settings", action: "update" }
);
