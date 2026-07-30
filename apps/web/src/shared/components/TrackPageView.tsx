"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { track, TrackPayload } from "@/lib/track";

// Detail pages under these sections count as dish views
const DISH_SECTIONS = new Set(["menu", "drink", "buffet"]);

/**
 * Derives the tracking event from the pathname.
 * `/en/menu/wagyu-steak` → view_dish (menu, wagyu-steak); anything else → page_view.
 */
function buildEvent(pathname: string): Pick<TrackPayload, "event" | "entityType" | "slug"> {
  const segments = pathname
    .replace(/^\/(en|ja)(?=\/|$)/, "")
    .split("/")
    .filter(Boolean);

  if (segments.length === 2 && DISH_SECTIONS.has(segments[0])) {
    return {
      event: "view_dish",
      entityType: segments[0] as TrackPayload["entityType"],
      slug: segments[1],
    };
  }

  return { event: "page_view" };
}

/**
 * TrackPageView — Invisible client component that fires analytics events.
 *
 * Sends a single tracking beacon on each page navigation (page_view, or
 * view_dish on menu/drink/buffet detail pages — the server counts those as
 * page views too). Uses sessionStorage to flag new visitors for the daily
 * visitors count. Fire-and-forget: never blocks rendering or affects UX.
 */
export function TrackPageView() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string>("");

  useEffect(() => {
    // Skip if already tracked this exact path (prevents double-fire on re-renders)
    if (pathname === lastTrackedPath.current) return;
    lastTrackedPath.current = pathname;

    // Determine if this is a new visitor session (for the visitors count)
    let isNewVisitor = false;
    try {
      if (!sessionStorage.getItem("resto_visited")) {
        sessionStorage.setItem("resto_visited", "1");
        isNewVisitor = true;
      }
    } catch {
      // sessionStorage unavailable (e.g., SSR, private browsing) — treat as new
      isNewVisitor = true;
    }

    track({
      ...buildEvent(pathname),
      path: pathname,
      locale: pathname.match(/^\/(en|ja)(?=\/|$)/)?.[1] || null,
      isNewVisitor,
    });
  }, [pathname]);

  // This component renders nothing — purely side-effect
  return null;
}
