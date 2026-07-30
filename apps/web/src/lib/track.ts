// Client-side analytics beacon — fire-and-forget delivery to /api/analytics/track.
// Only the three supported events are sent; advanced web metrics (device,
// referrer, UTM…) are left to Vercel Analytics.

export type TrackedEvent = "page_view" | "view_category" | "view_dish";

export interface TrackPayload {
  event: TrackedEvent;
  path?: string;
  locale?: string | null;
  entityType?: "menu" | "drink" | "buffet";
  slug?: string;
  isNewVisitor?: boolean;
}

const TRACK_ENDPOINT = "/api/analytics/track";

/**
 * Sends a tracking event without blocking rendering or navigation.
 * Uses sendBeacon (survives page unload) with a keepalive fetch fallback.
 * Failures are silently ignored — tracking is never critical.
 */
export function track(payload: TrackPayload): void {
  const body = JSON.stringify(payload);

  try {
    const sent = navigator.sendBeacon?.(
      TRACK_ENDPOINT,
      new Blob([body], { type: "application/json" })
    );

    if (!sent) {
      fetch(TRACK_ENDPOINT, {
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      }).catch(() => {
        // Silently ignore tracking failures — non-critical
      });
    }
  } catch {
    // Silently ignore tracking failures — non-critical
  }
}
