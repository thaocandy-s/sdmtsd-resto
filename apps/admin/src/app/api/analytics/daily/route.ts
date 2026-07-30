import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { addDays, parseDays, startOfUtcDay } from "@/lib/analytics";

// GET /api/analytics/daily?days=N - Per-day traffic for the trend chart.
// Reads analytics_daily only (already bucketed by day).
export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const days = parseDays(new URL(request.url).searchParams);
      if (days === null) {
        return NextResponse.json({ message: "Invalid days parameter" }, { status: 400 });
      }

      const today = startOfUtcDay(new Date());
      const start = addDays(today, -(days - 1));

      const daily = await prisma.analyticsDaily.findMany({
        where: { date: { gte: start } },
        orderBy: { date: "asc" },
        select: { date: true, visitors: true, pageViews: true },
      });

      return NextResponse.json({ data: { daily } });
    } catch (error) {
      console.error("Get analytics daily error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "analytics", action: "read" }
);
