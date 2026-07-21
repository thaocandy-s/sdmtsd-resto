export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: { foods: number };
}

export interface Food {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isPopular: boolean;
  isRecommended: boolean;
  category: Category;
}

export interface GroupedCategory {
  category: Category;
  foods: Food[];
}
