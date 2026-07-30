import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { trackEventSchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// Max tracking events per IP per minute
const TRACK_LIMIT = 60;
const TRACK_WINDOW_MS = 60 * 1000;

// POST /api/analytics/track - Record a tracking event
// Public endpoint (no auth) — fire-and-forget from client.
// Supported events: page_view | view_category | view_dish.
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(`track:${ip}`, TRACK_LIMIT, TRACK_WINDOW_MS)) {
      return new NextResponse(null, { status: 429 });
    }

    const body = await request.json();
    const parsed = trackEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }
    const { event, path, entityType, slug, isNewVisitor } = parsed.data;

    // view_category/view_dish must carry an entity reference to be useful
    if (event !== "page_view" && (!entityType || !slug)) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    // Country from Vercel's geo header (edge-provided, no client fingerprinting)
    const country = request.headers.get("x-vercel-ip-country");

    // page_view and view_dish are navigations — keep today's counters live.
    // view_category is an in-page interaction, so it never counts as a page view.
    const isNavigation = event !== "view_category";
    const newVisitor = isNavigation && !!isNewVisitor;

    if (isNavigation) {
      // Today's date at midnight UTC for the UPSERT key
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      // Atomic UPSERT: create today's row if missing, otherwise increment counters
      await prisma.analyticsDaily.upsert({
        where: { date: today },
        create: {
          date: today,
          pageViews: 1,
          visitors: newVisitor ? 1 : 0,
        },
        update: {
          pageViews: { increment: 1 },
          ...(newVisitor ? { visitors: { increment: 1 } } : {}),
        },
      });
    }

    // Raw event — source for the daily top-lists rollup, retained 90 days
    await prisma.analyticsEvent.create({
      data: {
        event,
        path: path || null,
        entityType: entityType || null,
        slug: slug || null,
        country: country || null,
        isNewVisitor: newVisitor,
      },
    });

    // Return 204 No Content — minimal response for fire-and-forget
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // Log but don't break the client — tracking failures are non-critical
    console.error("Track analytics error:", error);
    return new NextResponse(null, { status: 204 });
  }
}
