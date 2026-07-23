export interface TourPlace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface TourCategory {
  id: string;
  name: string;
  slug: string;
  _count: { places: number };
}
