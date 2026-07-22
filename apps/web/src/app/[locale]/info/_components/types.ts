export interface Restaurant {
  id: string;
  name: string;
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
}
