import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

// GET /api/dashboard/stats - Get dashboard statistics
export const GET = withAuth(async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalFoods,
      totalDrinks,
      totalBuffets,
      totalReservations,
      pendingReservations,
      totalContacts,
      unreadContacts,
      todayPageViews,
      totalPageViews,
      recentReservations,
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
      prisma.pageView.count({ where: { createdAt: { gte: today } } }),
      prisma.pageView.count(),
      prisma.reservation.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          date: true,
          time: true,
          guests: true,
          status: true,
          createdAt: true,
        },
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
          todayPageViews,
          totalPageViews,
        },
        recentReservations,
        recentContacts,
        popularFoods,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
});
