import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

// POST /api/analytics/cleanup - Delete raw PageView logs older than 90 days
// Protected endpoint — requires analytics:write permission
export const POST = withAuth(
  async () => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);

      const result = await prisma.pageView.deleteMany({
        where: { createdAt: { lt: cutoffDate } },
      });

      return NextResponse.json({
        data: {
          deletedCount: result.count,
          cutoffDate: cutoffDate.toISOString(),
        },
      });
    } catch (error) {
      console.error("Cleanup error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "analytics", action: "write" }
);
