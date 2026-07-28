"use client";

import { useMemo, useState } from "react";
import { FaqSearch } from "./FaqSearch";
import { FaqFilter } from "./FaqFilter";
import { FaqAccordion } from "./FaqAccordion";

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

interface FaqContentProps {
  faqs: Faq[];
  categories: FaqCategory[];
}

export function FaqContent({ faqs, categories }: FaqContentProps) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");

  // Search + category filtering client-side over the server-provided payload (no refetch)
  const visibleFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return faqs.filter((faq) => {
      if (selectedCategory && faq.category?.slug !== selectedCategory) return false;
      if (
        query &&
        !faq.question.toLowerCase().includes(query) &&
        !faq.answer.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [faqs, selectedCategory, search]);

  return (
    <>
      {/* Search */}
      <FaqSearch value={search} onChange={setSearch} />

      {/* Category Filter */}
      <FaqFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* FAQ Accordion */}
      <FaqAccordion faqs={visibleFaqs} loading={false} />
    </>
  );
}
