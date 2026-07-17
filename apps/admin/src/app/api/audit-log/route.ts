import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");
      const module = searchParams.get("module") || "";
      const action = searchParams.get("action") || "";
      const userId = searchParams.get("userId") || "";

      const skip = (page - 1) * limit;
      const where: Record<string, unknown> = {};
      if (module) where.module = module;
      if (action) where.action = action;
      if (userId) where.userId = userId;

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
        prisma.auditLog.count({ where }),
      ]);

      return NextResponse.json({
        data: logs,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      console.error("Get audit logs error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "auditLog", action: "read" }
);
