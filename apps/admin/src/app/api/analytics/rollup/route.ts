import { NextRequest, NextResponse } from "next/server";
import { runRollup } from "@/lib/analytics";

// GET /api/analytics/rollup - Daily rollup job (Vercel Cron).
// Recomputes recent analytics_daily top lists from raw events and deletes
// events older than the 90-day retention window. Idempotent — safe to rerun.
//
// Not wrapped in withAuth: it is invoked by Vercel Cron, which authenticates
// with `Authorization: Bearer ${CRON_SECRET}` (set in Vercel env).
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runRollup();
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Analytics rollup error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
