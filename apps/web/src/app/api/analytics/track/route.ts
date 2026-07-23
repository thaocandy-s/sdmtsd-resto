import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Valid tracking event types mapped to DailyStatistic columns
const EVENT_COLUMN_MAP: Record<string, string> = {
  page_view: "pageViews",
  home_view: "homeViews",
  menu_view: "menuViews",
  drink_view: "drinkViews",
  buffet_view: "buffetViews",
  beer_art_view: "beerArtViews",
  challenge_view: "challengeViews",
  tourist_view: "touristViews",
  info_view: "infoViews",
  faq_view: "faqViews",
  contact_view: "contactViews",
  reservation_view: "reservationViews",
  reservation_click: "reservationClicks",
  contact_click: "contactClicks",
};

// POST /api/analytics/track - Record a tracking event
// Public endpoint (no auth) — fire-and-forget from client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, path, locale, referrer, isNewVisitor } = body;

    // Validate event type
    if (!event || !EVENT_COLUMN_MAP[event]) {
      return NextResponse.json({ message: "Invalid event type" }, { status: 400 });
    }

    // Get today's date at midnight UTC for the UPSERT key
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Build the increment object for the specific event column
    const incrementData: Record<string, number> = {
      [EVENT_COLUMN_MAP[event]]: 1,
    };

    // Always increment pageViews for any *_view event (not for click events)
    if (event.endsWith("_view") && event !== "page_view") {
      incrementData.pageViews = 1;
    }

    // Increment uniqueVisitors if this is a new visitor session
    if (isNewVisitor) {
      incrementData.uniqueVisitors = 1;
    }

    // Atomic UPSERT: create today's row if missing, otherwise increment counters
    await prisma.dailyStatistic.upsert({
      where: { date: today },
      create: {
        date: today,
        ...Object.fromEntries(Object.entries(incrementData).map(([key, val]) => [key, val])),
      },
      update: {
        ...Object.fromEntries(
          Object.entries(incrementData).map(([key, val]) => [key, { increment: val }])
        ),
      },
    });

    // Also write a raw PageView for short-term debugging (kept for 90 days)
    if (path && event.endsWith("_view")) {
      await prisma.pageView.create({
        data: {
          path: path || "/",
          locale: locale || null,
          referrer: referrer || null,
          userAgent: request.headers.get("user-agent") || null,
        },
      });
    }

    // Return 204 No Content — minimal response for fire-and-forget
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // Log but don't break the client — tracking failures are non-critical
    console.error("Track analytics error:", error);
    return new NextResponse(null, { status: 204 });
  }
}
