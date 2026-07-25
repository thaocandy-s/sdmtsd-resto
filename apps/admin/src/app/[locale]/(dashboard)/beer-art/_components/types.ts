export interface BeerArt {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  customerName: string | null;
  artistName: string | null;
  isPopular: boolean;
  isPublished: boolean;
}

export type FormData = {
  title: string;
  description: string;
  imageUrl: string;
  customerName: string;
  artistName: string;
  isPopular: boolean;
  isPublished: boolean;
};

export const emptyForm: FormData = {
  title: "",
  description: "",
  imageUrl: "",
  customerName: "",
  artistName: "",
  isPopular: false,
  isPublished: false,
};
