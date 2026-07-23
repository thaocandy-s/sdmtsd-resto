"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

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

interface FaqAccordionProps {
  faqs: Faq[];
  loading: boolean;
}

export function FaqAccordion({ faqs, loading }: FaqAccordionProps) {
  const t = useTranslations("faq");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-background-secondary border border-border rounded-lg p-4">
            <div className="h-4 bg-background-tertiary rounded animate-pulse w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (faqs.length === 0) {
    return <p className="text-center text-foreground-secondary py-12">{t("noResults")}</p>;
  }

  return (
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
  );
}
