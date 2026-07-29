import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// Called by the admin app after any successful content mutation so the
// public site's ISR cache reflects the latest data (ordering included)
// immediately instead of waiting for the time-based revalidate window.
// Protected by a shared secret header.

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Revalidate every page under the root layout (all locales/routes).
  revalidatePath("/", "layout");

  return NextResponse.json({ data: { revalidated: true } });
}
