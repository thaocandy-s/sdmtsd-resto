"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { BuffetCourse, BuffetCourseCard } from "./buffet-course-card";

interface BuffetListProps {
  courses: BuffetCourse[];
  taxRate: number;
}

export function BuffetList({ courses, taxRate }: BuffetListProps) {
  const t = useTranslations("buffet");
  const tc = useTranslations("common");

  // Client-side pagination over the server-provided payload (no refetch)
  const [page, setPage] = useState(1);
  const limit = 6; // Grid-friendly size limit (divisible by 1, 2, 3 columns)
  const totalCourses = courses.length;
  const totalPages = Math.max(1, Math.ceil(totalCourses / limit));
  const visibleCourses = courses.slice((page - 1) * limit, page * limit);

  if (courses.length === 0) {
    return <p className="text-center text-foreground-secondary py-12">{t("noCourses")}</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleCourses.map((course) => (
          <BuffetCourseCard key={course.id} course={course} taxRate={taxRate} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 bg-background-secondary border border-border rounded-xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md max-w-2xl mx-auto">
          <div className="text-sm text-foreground-secondary font-medium">
            {tc("showingPage", {
              page,
              totalPages,
              total: totalCourses,
            })}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setPage(Math.max(page - 1, 1))}
              disabled={page === 1}
              className="flex-1 sm:flex-none px-4 py-2 min-h-[44px] sm:min-h-0 border border-border rounded-lg text-sm font-semibold text-foreground-secondary hover:text-gold-400 hover:border-gold-500/40 hover:bg-background-tertiary disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center cursor-pointer"
            >
              &larr; {tc("previous")}
            </button>
            <button
              onClick={() => setPage(Math.min(page + 1, totalPages))}
              disabled={page === totalPages}
              className="flex-1 sm:flex-none px-4 py-2 min-h-[44px] sm:min-h-0 border border-border rounded-lg text-sm font-semibold text-foreground-secondary hover:text-gold-400 hover:border-gold-500/40 hover:bg-background-tertiary disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center cursor-pointer"
            >
              {tc("next")} &rarr;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
