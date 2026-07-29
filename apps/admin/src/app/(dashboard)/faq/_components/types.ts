export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isPublished: boolean;
  category: { id: string; name: string } | null;
}

export interface FaqCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
}

// Forms no longer expose sortOrder directly. `position` is an optional
// Advanced-only field (string so the input can be cleared); empty = append.
export type FaqForm = {
  question: string;
  answer: string;
  position: string;
  isPublished: boolean;
  categoryId: string;
};

export type CatForm = {
  name: string;
  slug: string;
  description: string;
  position: string;
};

export const emptyFaq: FaqForm = {
  question: "",
  answer: "",
  position: "",
  isPublished: true,
  categoryId: "",
};

export const emptyCat: CatForm = {
  name: "",
  slug: "",
  description: "",
  position: "",
};
