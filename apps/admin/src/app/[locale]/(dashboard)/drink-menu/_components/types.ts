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
  sortOrder: string;
  alcoholPercent: string;
  volume: string;
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
  categoryId: "",
  imageUrl: "",
  isPopular: false,
  status: "DRAFT",
  sortOrder: "0",
  alcoholPercent: "",
  volume: "",
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
