"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Scroll to and briefly highlight a newly created item so users can locate it.
// Usage:
//   const { flash, getHighlightProps } = useHighlightNew();
//   after create: flash(newItem.id)
//   on each row:  <div {...getHighlightProps(item.id)}>
export function useHighlightNew(durationMs = 2200) {
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback((id: string) => {
    setHighlightId(id);
    // Wait a tick for the new row to render, then scroll it into view.
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(`[data-highlight-id="${id}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, []);

  useEffect(() => {
    if (!highlightId) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setHighlightId(null), durationMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [highlightId, durationMs]);

  const getHighlightProps = useCallback(
    (id: string) => ({
      "data-highlight-id": id,
      className: highlightId === id ? "ring-2 ring-gold-500 animate-highlight-flash" : "",
    }),
    [highlightId]
  );

  return { highlightId, flash, getHighlightProps };
}
