export interface Food {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  imageUrl: string | null;
  isPopular: boolean;
  isRecommended: boolean;
  ingredients: string | null;
  calories: number | null;
  status: string;
  sortOrder: number;
  category: { id: string; name: string };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  _count?: { foods: number };
}

export type FormData = {
  name: string;
  slug: string;
  description: string;
  price: string;
  originalPrice: string;
  categoryId: string;
  imageUrl: string;
  isPopular: boolean;
  isRecommended: boolean;
  ingredients: string;
  calories: string;
  status: string;
  sortOrder: string;
};

export type CategoryFormData = {
  name: string;
  slug: string;
  description: string;
  sortOrder: string;
};

export const emptyForm: FormData = {
  name: "",
  slug: "",
  description: "",
  price: "",
  originalPrice: "",
  categoryId: "",
  imageUrl: "",
  isPopular: false,
  isRecommended: false,
  ingredients: "",
  calories: "",
  status: "DRAFT",
  sortOrder: "0",
};

export const emptyCategoryForm: CategoryFormData = {
  name: "",
  slug: "",
  description: "",
  sortOrder: "0",
};

import { toSlug } from "@resto-hub/utils";

export { toSlug };
