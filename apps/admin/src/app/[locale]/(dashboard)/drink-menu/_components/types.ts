export interface Drink {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isPopular: boolean;
  status: string;
  category: { id: string; name: string };
  alcoholPercent?: number | null;
  volume?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  _count?: { drinks: number };
}

export type FormData = {
  name: string;
  slug: string;
  description: string;
  price: string;
  categoryId: string;
  imageUrl: string;
  isPopular: boolean;
  status: string;
  position: string;
  alcoholPercent: string;
  volume: string;
};

export type CategoryFormData = {
  name: string;
  slug: string;
  description: string;
  position: string;
};

export const emptyForm: FormData = {
  name: "",
  slug: "",
  description: "",
  price: "",
  categoryId: "",
  imageUrl: "",
  isPopular: false,
  status: "DRAFT",
  position: "",
  alcoholPercent: "",
  volume: "",
};

export const emptyCategoryForm: CategoryFormData = {
  name: "",
  slug: "",
  description: "",
  position: "",
};

import { toSlug } from "@resto-hub/utils";

export { toSlug };
