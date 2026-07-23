"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { FaqSearch } from "./_components/FaqSearch";
import { FaqFilter } from "./_components/FaqFilter";
import { FaqAccordion } from "./_components/FaqAccordion";

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface FaqCategory {
  id: string;
  name: string;
  slug: string;
  _count: { faqs: number };
}

export default function FaqPage() {
  const t = useTranslations("faq");
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/faq").then((r) => r.json()),
      fetch("/api/faq/categories").then((r) => r.json()),
    ])
      .then(([faqsData, categoriesData]) => {
        setFaqs(faqsData.data || []);
        setCategories(categoriesData.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (search) params.set("search", search);

    fetch(`/api/faq?${params}`)
      .then((r) => r.json())
      .then((data) => setFaqs(data.data || []))
      .catch(console.error);
  }, [selectedCategory, search]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-jp font-bold text-gold-400 mb-4">{t("title")}</h1>
      <p className="text-foreground-secondary mb-8">{t("subtitle")}</p>

      {/* Search */}
      <FaqSearch value={search} onChange={setSearch} />

      {/* Category Filter */}
      <FaqFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* FAQ Accordion */}
      <FaqAccordion faqs={faqs} loading={loading} />
    </main>
  );
}
