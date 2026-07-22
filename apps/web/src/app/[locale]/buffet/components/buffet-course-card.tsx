"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { formatPriceWithTax } from "@resto-hub/utils";

export interface BuffetCourse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  duration: number;
  minPeople: number | null;
  maxPeople: number | null;
  includes: string[];
  imageUrl: string | null;
  isPopular: boolean;
}

interface BuffetCourseCardProps {
  course: BuffetCourse;
}

export function BuffetCourseCard({ course }: BuffetCourseCardProps) {
  const t = useTranslations("buffet");
  const tCommon = useTranslations("common");

  const formatPrice = (price: number) => formatPriceWithTax(price);

  return (
    <Link
      href={`/buffet/${course.slug}`}
      className="group bg-background-secondary border border-border rounded-lg overflow-hidden hover:border-gold-500/50 transition-all"
    >
      <div className="relative h-48 bg-background-tertiary">
        {course.imageUrl ? (
          <img
            src={course.imageUrl}
            alt={course.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground-tertiary">
            {t("noImage")}
          </div>
        )}
        {course.isPopular && (
          <span className="absolute top-2 right-2 px-2 py-1 bg-gold-500 text-background text-xs rounded">
            {tCommon("popular")}
          </span>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-foreground group-hover:text-gold-400 transition-colors mb-2">
          {course.name}
        </h3>
        {course.description && (
          <p className="text-sm text-foreground-secondary mb-4 line-clamp-2">
            {course.description}
          </p>
        )}
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-gold-400">{formatPrice(course.price)}</span>
          <span className="text-sm text-foreground-secondary">
            {t("durationMin", { duration: course.duration })}
          </span>
        </div>
        {(course.minPeople !== null || course.maxPeople !== null) && (
          <p className="text-xs text-foreground-tertiary mb-3">
            {course.minPeople !== null && course.maxPeople !== null
              ? t("peopleRange", { min: course.minPeople, max: course.maxPeople })
              : course.minPeople !== null
                ? t("minPeopleVal", { count: course.minPeople })
                : course.maxPeople !== null
                  ? t("maxPeopleVal", { count: course.maxPeople })
                  : null}
          </p>
        )}
        {course.includes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {course.includes.slice(0, 3).map((item) => (
              <span key={item} className="px-2 py-0.5 bg-gold-500/10 text-gold-400 text-xs rounded">
                {item}
              </span>
            ))}
            {course.includes.length > 3 && (
              <span className="px-2 py-0.5 text-foreground-tertiary text-xs">
                {t("moreItems", { count: course.includes.length - 3 })}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
