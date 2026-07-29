export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
  googlePlaceId: string | null;
  googleMapQuery: string | null;
  openingHours: Record<string, string> | null;
  holidays: string[] | null;
  socialLinks: Record<string, string> | null;
  isActive: boolean;
}

export interface RestaurantFormData {
  name: string;
  slug: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  latitude: string;
  longitude: string;
  googlePlaceId: string;
  googleMapQuery: string;
  openingHours: Record<string, string>;
  holidays: string;
  socialLinks: Record<string, string>;
  isActive: boolean;
}
