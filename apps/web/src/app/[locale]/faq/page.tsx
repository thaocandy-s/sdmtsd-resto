"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

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
  const [expandedId, setExpandedId] = useState<string | null>(null);
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

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-jp font-bold text-gold-400 mb-4">{t("title")}</h1>
      <p className="text-foreground-secondary mb-8">{t("subtitle")}</p>

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full h-12 rounded-md border border-border bg-background-secondary px-4 text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-gold-500"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedCategory("")}
          className={`px-4 py-2 rounded-full text-sm transition-colors ${
            !selectedCategory
              ? "bg-gold-500 text-background"
              : "bg-background-secondary text-foreground-secondary hover:bg-background-tertiary"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              selectedCategory === cat.slug
                ? "bg-gold-500 text-background"
                : "bg-background-secondary text-foreground-secondary hover:bg-background-tertiary"
            }`}
          >
            {cat.name} ({cat._count.faqs})
          </button>
        ))}
      </div>

      {/* FAQ Accordion */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-background-secondary border border-border rounded-lg p-4">
              <div className="h-4 bg-background-tertiary rounded animate-pulse w-3/4" />
            </div>
          ))}
        </div>
      ) : faqs.length === 0 ? (
        <p className="text-center text-foreground-secondary py-12">No FAQs found</p>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-background-secondary border border-border rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleExpand(faq.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-background-tertiary/50 transition-colors"
              >
                <span className="font-medium text-foreground pr-4">{faq.question}</span>
                <span
                  className={`text-gold-400 transition-transform ${
                    expandedId === faq.id ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>
              {expandedId === faq.id && (
                <div className="px-6 pb-4">
                  <div className="pt-4 border-t border-border">
                    <p className="text-foreground-secondary whitespace-pre-wrap">{faq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
