"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WinnerCard, Winner } from "./winner-card";

interface WinnerSliderProps {
  winners: Winner[];
}

export function WinnerSlider({ winners }: WinnerSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const checkScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setShowLeft(scrollLeft > 5);
    // Use a 5px buffer to account for subpixel scroll rounding
    setShowRight(scrollLeft + clientWidth < scrollWidth - 5);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [winners]);

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;
    const { clientWidth } = containerRef.current;
    const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
    containerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Only show navigation controls and scroll snapping if there are more than 4 items
  const shouldSlide = winners.length > 4;

  if (!shouldSlide) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {winners.map((winner) => (
          <WinnerCard key={winner.id} winner={winner} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative group w-full">
      {/* Scrollable Container */}
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {winners.map((winner) => (
          <div
            key={winner.id}
            className="w-[calc(50%-8px)] md:w-[calc(25%-12px)] flex-shrink-0 snap-start"
          >
            <WinnerCard winner={winner} />
          </div>
        ))}
      </div>

      {/* Left Navigation Button */}
      {showLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-black/85 hover:bg-gold-500 hover:text-black text-white rounded-full p-2 border border-border transition-all shadow-lg flex items-center justify-center h-10 w-10 hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {/* Right Navigation Button */}
      {showRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-black/85 hover:bg-gold-500 hover:text-black text-white rounded-full p-2 border border-border transition-all shadow-lg flex items-center justify-center h-10 w-10 hover:scale-105 active:scale-95"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
