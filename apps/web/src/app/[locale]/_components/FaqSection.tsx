"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { AnimatedSection } from "@/shared/components/animated-section";

interface Faq {
  id: string;
  question: string;
  answer: string;
}

interface FaqSectionProps {
  faqs: Faq[];
  loading?: boolean;
}

export function FaqSection({ faqs, loading = false }: FaqSectionProps) {
  const t = useTranslations("home");
  const tc = useTranslations("common");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  return (
    <AnimatedSection className="py-20 px-4 max-w-4xl mx-auto">
      <h2 className="text-3xl font-jp font-bold text-gold-400 text-center mb-12">
        {t("faqPreview")}
      </h2>
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-background-secondary border border-border rounded-lg p-4">
              <div className="h-4 bg-background-tertiary rounded w-3/4 animate-pulse" />
            </div>
          ))}
        </div>
      ) : faqs.length === 0 ? (
        <p className="text-center text-foreground-secondary py-8">{t("noFaqs")}</p>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-background-secondary border border-border rounded-lg overflow-hidden hover:border-gold-500/30 transition-colors"
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="font-medium text-foreground pr-4">{faq.question}</span>
                <span
                  className={`text-gold-400 text-xl transition-transform ${
                    expandedFaqId === faq.id ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>
              {expandedFaqId === faq.id && (
                <div className="px-4 pb-4 text-foreground-secondary">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="text-center mt-8">
        <Link href="/faq" className="text-gold-400 hover:text-gold-300 font-medium">
          {tc("viewAll")} &rarr;
        </Link>
      </div>
    </AnimatedSection>
  );
}
