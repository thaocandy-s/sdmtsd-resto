"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { BuffetCourse, BuffetCourseCard } from "./components/buffet-course-card";
import { BuffetListSkeleton } from "./components/buffet-skeleton";

export default function BuffetPage() {
  const t = useTranslations("buffet");
  const [courses, setCourses] = useState<BuffetCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/buffet")
      .then((r) => r.json())
      .then((data) => setCourses(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-jp font-bold text-gold-400 mb-4">{t("title")}</h1>
      <p className="text-foreground-secondary mb-8">{t("subtitle")}</p>

      {loading ? (
        <BuffetListSkeleton />
      ) : courses.length === 0 ? (
        <p className="text-center text-foreground-secondary py-12">{t("noCourses")}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <BuffetCourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </main>
  );
}
