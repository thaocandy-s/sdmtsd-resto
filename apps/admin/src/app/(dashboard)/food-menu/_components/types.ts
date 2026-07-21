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
  status: "DRAFT",
  sortOrder: "0",
};

export const emptyCategoryForm: CategoryFormData = {
  name: "",
  slug: "",
  description: "",
  sortOrder: "0",
};

export const toSlug = (str: string) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
};
