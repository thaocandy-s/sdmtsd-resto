export interface Food {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  imageUrl: string | null;
  images: string[];
  isPopular: boolean;
  isRecommended: boolean;
  allergens: string[];
  ingredients: string | null;
  calories: number | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface RelatedFood {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  price: number;
}
