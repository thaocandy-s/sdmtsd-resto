export interface TourPlace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  websiteUrl: string | null;
  phone: string | null;
  imageUrl: string | null;
  images: string[];
  openingHours: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}
