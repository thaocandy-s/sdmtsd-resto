"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { BuffetCourse, BuffetCourseCard } from "./components/buffet-course-card";
import { BuffetListSkeleton } from "./components/buffet-skeleton";

export default function BuffetPage() {
  const t = useTranslations("buffet");
  const tc = useTranslations("common");
  const [courses, setCourses] = useState<BuffetCourse[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const limit = 6; // Grid-friendly size limit (divisible by 1, 2, 3 columns)

  useEffect(() => {
    setLoading(true);
    fetch(`/api/buffet?page=${page}&limit=${limit}`)
      .then((r) => r.json())
      .then((res) => {
        setCourses(res.data || []);
        if (res.meta) {
          setTotalPages(res.meta.totalPages || 1);
          setTotalCourses(res.meta.total || 0);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-jp font-bold text-gold-400 mb-4">{t("title")}</h1>
      <p className="text-foreground-secondary mb-8">{t("subtitle")}</p>

      {loading ? (
        <BuffetListSkeleton />
      ) : courses.length === 0 ? (
        <p className="text-center text-foreground-secondary py-12">{t("noCourses")}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <BuffetCourseCard key={course.id} course={course} />
            ))}
          </div>

          {!loading && totalPages > 1 && (
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
      )}
    </main>
  );
}
