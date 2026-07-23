import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

// GET /api/dashboard/stats - Get dashboard statistics
export const GET = withAuth(async () => {
  try {
    // Calculate date boundaries for time-based queries
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const [
      totalFoods,
      totalDrinks,
      totalBuffets,
      totalReservations,
      pendingReservations,
      totalContacts,
      unreadContacts,
      todayStats,
      weekStats,
      totalStats,
      recentContacts,
      popularFoods,
    ] = await Promise.all([
      prisma.food.count({ where: { deletedAt: null } }),
      prisma.drink.count({ where: { deletedAt: null } }),
      prisma.buffetCourse.count({ where: { deletedAt: null } }),
      prisma.reservation.count(),
      prisma.reservation.count({ where: { status: "PENDING" } }),
      prisma.contact.count(),
      prisma.contact.count({ where: { isRead: false } }),

      // Today's page views — single row lookup (O(1))
      prisma.dailyStatistic.findUnique({
        where: { date: today },
        select: { pageViews: true, uniqueVisitors: true },
      }),

      // This week's page views — aggregate up to 7 rows
      prisma.dailyStatistic.aggregate({
        where: { date: { gte: startOfWeek } },
        _sum: { pageViews: true, uniqueVisitors: true },
      }),

      // Total page views — aggregate all rows (~365/year)
      prisma.dailyStatistic.aggregate({
        _sum: { pageViews: true, uniqueVisitors: true },
      }),

      prisma.contact.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          isRead: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.food.findMany({
        where: { deletedAt: null, status: "PUBLISHED" },
        take: 5,
        orderBy: { isPopular: "desc" },
        select: {
          id: true,
          name: true,
          price: true,
          isPopular: true,
        },
      }),
    ]);

    return NextResponse.json({
      data: {
        stats: {
          totalFoods,
          totalDrinks,
          totalBuffets,
          totalReservations,
          pendingReservations,
          totalContacts,
          unreadContacts,
          todayPageViews: todayStats?.pageViews ?? 0,
          todayUniqueVisitors: todayStats?.uniqueVisitors ?? 0,
          weekPageViews: weekStats._sum.pageViews ?? 0,
          totalPageViews: totalStats._sum.pageViews ?? 0,
          totalUniqueVisitors: totalStats._sum.uniqueVisitors ?? 0,
        },
        recentContacts,
        popularFoods,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});
