import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const days = parseInt(searchParams.get("days") || "30");
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [
        totalViews,
        uniquePages,
        topPages,
        viewsByDay,
        topReferrers,
        topCountries,
        recentViews,
      ] = await Promise.all([
        prisma.pageView.count({ where: { createdAt: { gte: startDate } } }),
        prisma.pageView
          .groupBy({ by: ["path"], where: { createdAt: { gte: startDate } }, _count: true })
          .then((r) => r.length),
        prisma.pageView.groupBy({
          by: ["path"],
          where: { createdAt: { gte: startDate } },
          _count: { path: true },
          orderBy: { _count: { path: "desc" } },
          take: 20,
        }),
        prisma.pageView.groupBy({
          by: ["path"],
          where: { createdAt: { gte: startDate } },
          _count: { path: true },
          orderBy: { _count: { path: "desc" } },
          take: 10,
        }),
        prisma.pageView.groupBy({
          by: ["referrer"],
          where: { createdAt: { gte: startDate }, referrer: { not: null } },
          _count: { referrer: true },
          orderBy: { _count: { referrer: "desc" } },
          take: 10,
        }),
        prisma.pageView.groupBy({
          by: ["country"],
          where: { createdAt: { gte: startDate }, country: { not: null } },
          _count: { country: true },
          orderBy: { _count: { country: "desc" } },
          take: 10,
        }),
        prisma.pageView.findMany({
          where: { createdAt: { gte: startDate } },
          take: 20,
          orderBy: { createdAt: "desc" },
        }),
      ]);

      const popularFoods = await prisma.food.findMany({
        where: { deletedAt: null, status: "PUBLISHED", isPopular: true },
        take: 10,
        orderBy: { sortOrder: "asc" },
        include: { category: true },
      });

      const popularDrinks = await prisma.drink.findMany({
        where: { deletedAt: null, status: "PUBLISHED", isPopular: true },
        take: 10,
        orderBy: { sortOrder: "asc" },
        include: { category: true },
      });

      return NextResponse.json({
        data: {
          totalViews,
          uniquePages,
          topPages: topPages.map((p) => ({ path: p.path, views: p._count.path })),
          viewsByDay: viewsByDay.map((v) => ({ path: v.path, views: v._count.path })),
          topReferrers: topReferrers.map((r) => ({
            referrer: r.referrer,
            count: r._count.referrer,
          })),
          topCountries: topCountries.map((c) => ({ country: c.country, count: c._count.country })),
          recentViews,
          popularFoods,
          popularDrinks,
        },
      });
    } catch (error) {
      console.error("Get analytics error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "analytics", action: "read" }
);
