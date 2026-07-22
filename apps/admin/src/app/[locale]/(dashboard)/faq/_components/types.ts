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

export type FaqForm = {
  question: string;
  answer: string;
  sortOrder: number;
  isPublished: boolean;
  categoryId: string;
};

export type CatForm = {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
};

export const emptyFaq: FaqForm = {
  question: "",
  answer: "",
  sortOrder: 0,
  isPublished: true,
  categoryId: "",
};

export const emptyCat: CatForm = {
  name: "",
  slug: "",
  description: "",
  sortOrder: 0,
};
