export interface Buffet {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  duration: number;
  minPeople: number | null;
  maxPeople: number | null;
  includes: string[];
  imageUrl: string | null;
  isPopular: boolean;
  sortOrder: number;
  status: string;
}

export interface MenuItemOption {
  id: string;
  name: string;
  type: "food" | "drink";
}

export type BuffetFormData = {
  name: string;
  slug: string;
  description: string;
  price: string;
  duration: string;
  minPeople: string;
  maxPeople: string;
  includes: string;
  imageUrl: string;
  isPopular: boolean;
  sortOrder: string;
  status: string;
};

export const emptyBuffetForm: BuffetFormData = {
  name: "",
  slug: "",
  description: "",
  price: "",
  duration: "",
  minPeople: "",
  maxPeople: "",
  includes: "",
  imageUrl: "",
  isPopular: false,
  sortOrder: "0",
  status: "DRAFT",
};
