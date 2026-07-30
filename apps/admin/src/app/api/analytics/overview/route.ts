import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { addDays, parseDays, startOfUtcDay } from "@/lib/analytics";

// GET /api/analytics/overview?days=N - Visitors/page views totals with
// period-over-period comparison. Reads analytics_daily only.
export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const days = parseDays(new URL(request.url).searchParams);
      if (days === null) {
        return NextResponse.json({ message: "Invalid days parameter" }, { status: 400 });
      }

      // Current period = last `days` days including today; previous period
      // is the same length immediately before it.
      const today = startOfUtcDay(new Date());
      const start = addDays(today, -(days - 1));
      const prevStart = addDays(start, -days);

      const [current, previous] = await Promise.all([
        prisma.analyticsDaily.aggregate({
          where: { date: { gte: start } },
          _sum: { visitors: true, pageViews: true },
        }),
        prisma.analyticsDaily.aggregate({
          where: { date: { gte: prevStart, lt: start } },
          _sum: { visitors: true, pageViews: true },
        }),
      ]);

      const pageViews = current._sum.pageViews ?? 0;
      const prevPageViews = previous._sum.pageViews ?? 0;

      // Period-over-period change on page views
      const changePercent =
        prevPageViews > 0
          ? Math.round(((pageViews - prevPageViews) / prevPageViews) * 100)
          : pageViews > 0
            ? 100
            : 0;

      return NextResponse.json({
        data: {
          visitors: current._sum.visitors ?? 0,
          pageViews,
          prevVisitors: previous._sum.visitors ?? 0,
          prevPageViews,
          changePercent,
        },
      });
    } catch (error) {
      console.error("Get analytics overview error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "analytics", action: "read" }
);
