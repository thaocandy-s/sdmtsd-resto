"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GroupedCategory } from "./types";
import { FoodCard } from "./FoodCard";

interface CategorySliceSectionProps {
  group: GroupedCategory;
  formatPrice: (price: number) => string;
}

export function CategorySliceSection({ group, formatPrice }: CategorySliceSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section id={`category-${group.category.slug}`} className="scroll-mt-24 space-y-6">
      {/* Category Slice Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <h2 className="text-2xl font-jp font-bold text-gold-400">{group.category.name}</h2>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20">
            {group.foods.length}
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-gold-500/20 via-border to-transparent" />

          {/* Carousel Next / Prev Controls */}
          {(canScrollPrev || canScrollNext) && (
            <div className="flex items-center gap-2">
              <button
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                aria-label="Previous items"
                className="p-2 rounded-full border border-border bg-background-secondary text-foreground-secondary hover:text-gold-400 hover:border-gold-500/50 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={scrollNext}
                disabled={!canScrollNext}
                aria-label="Next items"
                className="p-2 rounded-full border border-border bg-background-secondary text-foreground-secondary hover:text-gold-400 hover:border-gold-500/50 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        {group.category.description && (
          <p className="text-sm text-foreground-secondary pt-1">{group.category.description}</p>
        )}
      </div>

      {/* Carousel of Food Cards */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-6">
          {group.foods.map((food) => (
            <div key={food.id} className="pl-6 flex-[0_0_100%] min-w-0 md:flex-[0_0_33.333333%]">
              <FoodCard food={food} formatPrice={formatPrice} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
