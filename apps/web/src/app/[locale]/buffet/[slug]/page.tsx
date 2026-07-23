"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BuffetCourse } from "../components/buffet-course-card";
import { BuffetDetailContent } from "../components/buffet-detail-content";
import { BuffetDetailSkeleton } from "../components/buffet-skeleton";

export default function BuffetDetailPage() {
  const t = useTranslations("buffet");
  const params = useParams();
  const slug = params.slug as string;
  const [course, setCourse] = useState<BuffetCourse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetch(`/api/buffet/${slug}`)
        .then((r) => r.json())
        .then((data) => setCourse(data.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return <BuffetDetailSkeleton />;
  }

  if (!course) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">{t("notFound")}</h1>
        <Link href="/buffet" className="text-gold-400 hover:text-gold-300">
          {t("backToList")}
        </Link>
      </main>
    );
  }

  return <BuffetDetailContent course={course} />;
}
