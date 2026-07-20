export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: { drinks: number };
}

export interface Drink {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isPopular: boolean;
  alcoholPercent: number | null;
  volume: string | null;
  category: Category;
}

export interface GroupedCategory {
  category: Category;
  drinks: Drink[];
}
