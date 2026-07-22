"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { formatPriceWithTax } from "@resto-hub/utils";
import { BuffetCourse } from "./buffet-course-card";

interface BuffetDetailContentProps {
  course: BuffetCourse;
}

export function BuffetDetailContent({ course }: BuffetDetailContentProps) {
  const t = useTranslations("buffet");
  const tCommon = useTranslations("common");

  const formatPrice = (price: number) => formatPriceWithTax(price);

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href="/buffet"
        className="inline-flex items-center text-gold-400 hover:text-gold-300 mb-6"
      >
        &larr; {t("backToList")}
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-background-secondary rounded-lg overflow-hidden">
          {course.imageUrl ? (
            <img src={course.imageUrl} alt={course.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-foreground-tertiary">
              {t("noImage")}
            </div>
          )}
        </div>

        <div>
          {course.isPopular && (
            <span className="inline-block px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded mb-2">
              {tCommon("popular")}
            </span>
          )}

          <h1 className="text-3xl font-jp font-bold text-gold-400 mb-4">{course.name}</h1>

          {course.description && (
            <p className="text-foreground-secondary mb-6">{course.description}</p>
          )}

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl font-bold text-gold-400">{formatPrice(course.price)}</span>
            <span className="text-foreground-secondary">{t("perPerson")}</span>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-background-tertiary rounded-lg">
              <span className="text-foreground-secondary">{t("duration")}:</span>
              <span className="font-medium">
                {t("durationValue", { duration: course.duration })}
              </span>
            </div>
            {(course.minPeople !== null || course.maxPeople !== null) && (
              <div className="flex items-center gap-3 p-3 bg-background-tertiary rounded-lg">
                <span className="text-foreground-secondary">{t("groupSize")}:</span>
                <span className="font-medium">
                  {course.minPeople !== null && course.maxPeople !== null
                    ? t("peopleRange", { min: course.minPeople, max: course.maxPeople })
                    : course.minPeople !== null
                      ? t("minPeopleVal", { count: course.minPeople })
                      : course.maxPeople !== null
                        ? t("maxPeopleVal", { count: course.maxPeople })
                        : null}
                </span>
              </div>
            )}
          </div>

          {course.includes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">{t("includes")}</h3>
              <ul className="space-y-2">
                {course.includes.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-foreground-secondary">
                    <span className="w-1.5 h-1.5 bg-gold-400 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Link
            href="/reservation"
            className="inline-block mt-8 bg-gold-500 hover:bg-gold-600 text-background font-semibold px-6 py-3 rounded-md transition-colors"
          >
            {t("reserveNow")}
          </Link>
        </div>
      </div>
    </main>
  );
}
