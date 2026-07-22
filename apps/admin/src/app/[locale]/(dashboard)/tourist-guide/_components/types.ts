export interface Place {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  images: string[];
  category: { id: string; name: string } | null;
  isPublished: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
}

export type PlaceForm = {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  images: string[];
  categoryId: string;
  address: string;
  latitude: string;
  longitude: string;
  isPublished: boolean;
};

export type CatForm = {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
};

export const emptyPlace: PlaceForm = {
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  imageUrl: "",
  images: [],
  categoryId: "",
  address: "",
  latitude: "",
  longitude: "",
  isPublished: false,
};

export const emptyCat: CatForm = {
  name: "",
  slug: "",
  description: "",
  sortOrder: 0,
};
