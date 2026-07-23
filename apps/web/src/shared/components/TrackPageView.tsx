"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Maps URL pathname segments to analytics event types.
 * Extracts the section from paths like /en/menu, /ja/drink, etc.
 */
function getEventType(pathname: string): string {
  // Remove locale prefix (/en, /ja) to get the section
  const section = pathname.replace(/^\/(en|ja)/, "").split("/")[1] || "";

  const sectionMap: Record<string, string> = {
    "": "home_view",
    menu: "menu_view",
    drink: "drink_view",
    buffet: "buffet_view",
    "beer-art": "beer_art_view",
    challenge: "challenge_view",
    tourist: "tourist_view",
    info: "info_view",
    faq: "faq_view",
    contact: "contact_view",
    reservation: "reservation_view",
  };

  return sectionMap[section] || "page_view";
}

/**
 * TrackPageView — Invisible client component that fires analytics events.
 *
 * Sends a single tracking beacon on each page navigation.
 * Uses sessionStorage to detect new visitors for uniqueVisitors counting.
 * Fire-and-forget: never blocks rendering or affects UX.
 */
export function TrackPageView() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string>("");

  useEffect(() => {
    // Skip if already tracked this exact path (prevents double-fire on re-renders)
    if (pathname === lastTrackedPath.current) return;
    lastTrackedPath.current = pathname;

    // Determine if this is a new visitor session (for uniqueVisitors approximation)
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

    const event = getEventType(pathname);
    const payload = JSON.stringify({
      event,
      path: pathname,
      locale: pathname.match(/^\/(en|ja)/)?.[1] || null,
      referrer: document.referrer || null,
      isNewVisitor,
    });

    // Use sendBeacon for non-blocking delivery (survives page unload)
    // Falls back to fetch with keepalive if sendBeacon is unavailable
    try {
      const sent = navigator.sendBeacon?.(
        "/api/analytics/track",
        new Blob([payload], { type: "application/json" })
      );

      if (!sent) {
        fetch("/api/analytics/track", {
          method: "POST",
          body: payload,
          headers: { "Content-Type": "application/json" },
          keepalive: true,
        }).catch(() => {
          // Silently ignore tracking failures — non-critical
        });
      }
    } catch {
      // Silently ignore tracking failures — non-critical
    }
  }, [pathname]);

  // This component renders nothing — purely side-effect
  return null;
}
