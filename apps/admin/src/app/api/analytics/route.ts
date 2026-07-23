import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const days = parseInt(searchParams.get("days") || "30");

      // Calculate date boundaries for current and comparison periods
      const now = new Date();
      now.setUTCHours(0, 0, 0, 0);

      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - days);

      const prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - days);

      const [currentPeriod, previousPeriod, dailyData] = await Promise.all([
        // Current period totals — aggregate DailyStatistic rows for selected range
        prisma.dailyStatistic.aggregate({
          where: { date: { gte: startDate, lte: now } },
          _sum: {
            pageViews: true,
            uniqueVisitors: true,
            homeViews: true,
            menuViews: true,
            drinkViews: true,
            buffetViews: true,
            beerArtViews: true,
            challengeViews: true,
            touristViews: true,
            infoViews: true,
            faqViews: true,
            contactViews: true,
            reservationViews: true,
            reservationClicks: true,
            contactClicks: true,
          },
        }),

        // Previous period totals — for period-over-period comparison
        prisma.dailyStatistic.aggregate({
          where: { date: { gte: prevStartDate, lt: startDate } },
          _sum: {
            pageViews: true,
            uniqueVisitors: true,
          },
        }),

        // Daily data points for trend chart — already bucketed by day
        prisma.dailyStatistic.findMany({
          where: { date: { gte: startDate, lte: now } },
          orderBy: { date: "asc" },
          select: {
            date: true,
            pageViews: true,
            uniqueVisitors: true,
            homeViews: true,
            menuViews: true,
            drinkViews: true,
            buffetViews: true,
            beerArtViews: true,
            challengeViews: true,
            touristViews: true,
            infoViews: true,
            faqViews: true,
            contactViews: true,
            reservationViews: true,
            reservationClicks: true,
            contactClicks: true,
          },
        }),
      ]);

      const sum = currentPeriod._sum;
      const prevSum = previousPeriod._sum;

      // Calculate period-over-period change percentage
      const prevPageViews = prevSum.pageViews ?? 0;
      const currPageViews = sum.pageViews ?? 0;
      const changePercent =
        prevPageViews > 0
          ? Math.round(((currPageViews - prevPageViews) / prevPageViews) * 100)
          : currPageViews > 0
            ? 100
            : 0;

      // Build section breakdown sorted by views (descending)
      const sectionBreakdown = [
        { section: "home", views: sum.homeViews ?? 0 },
        { section: "menu", views: sum.menuViews ?? 0 },
        { section: "drink", views: sum.drinkViews ?? 0 },
        { section: "buffet", views: sum.buffetViews ?? 0 },
        { section: "beerArt", views: sum.beerArtViews ?? 0 },
        { section: "challenge", views: sum.challengeViews ?? 0 },
        { section: "tourist", views: sum.touristViews ?? 0 },
        { section: "info", views: sum.infoViews ?? 0 },
        { section: "faq", views: sum.faqViews ?? 0 },
        { section: "contact", views: sum.contactViews ?? 0 },
        { section: "reservation", views: sum.reservationViews ?? 0 },
      ].sort((a, b) => b.views - a.views);

      return NextResponse.json({
        data: {
          summary: {
            totalPageViews: currPageViews,
            uniqueVisitors: sum.uniqueVisitors ?? 0,
            reservationClicks: sum.reservationClicks ?? 0,
            contactClicks: sum.contactClicks ?? 0,
            changePercent,
            prevPageViews,
          },
          sectionBreakdown,
          dailyData,
        },
      });
    } catch (error) {
      console.error("Get analytics error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  },
  { module: "analytics", action: "read" }
);
