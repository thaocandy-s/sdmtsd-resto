"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import Link from "next/link";

interface BuffetCourse {
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

  const formatPrice = (price: number) => `¥${price.toLocaleString()}`;

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-jp font-bold text-gold-400 mb-4">{t("title")}</h1>
      <p className="text-foreground-secondary mb-8">{t("subtitle")}</p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-background-secondary border border-border rounded-lg p-6">
              <div className="h-40 bg-background-tertiary rounded animate-pulse mb-4" />
              <div className="h-5 bg-background-tertiary rounded animate-pulse mb-2" />
              <div className="h-3 bg-background-tertiary rounded animate-pulse w-1/2" />
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <p className="text-center text-foreground-secondary py-12">No buffet courses available</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
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
                    No image
                  </div>
                )}
                {course.isPopular && (
                  <span className="absolute top-2 right-2 px-2 py-1 bg-gold-500 text-background text-xs rounded">
                    Popular
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
                  <span className="text-2xl font-bold text-gold-400">
                    {formatPrice(course.price)}
                  </span>
                  <span className="text-sm text-foreground-secondary">{course.duration} min</span>
                </div>
                {(course.minPeople || course.maxPeople) && (
                  <p className="text-xs text-foreground-tertiary mb-3">
                    {course.minPeople && course.maxPeople
                      ? `${course.minPeople}-${course.maxPeople} people`
                      : course.minPeople
                        ? `Min ${course.minPeople} people`
                        : `Max ${course.maxPeople} people`}
                  </p>
                )}
                {course.includes.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {course.includes.slice(0, 3).map((item) => (
                      <span
                        key={item}
                        className="px-2 py-0.5 bg-gold-500/10 text-gold-400 text-xs rounded"
                      >
                        {item}
                      </span>
                    ))}
                    {course.includes.length > 3 && (
                      <span className="px-2 py-0.5 text-foreground-tertiary text-xs">
                        +{course.includes.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
