import { MediaCoverageCategory } from "@prisma/client";

export interface MediaCoverageArticle {
  id: string;
  publishedAt: string;
  mediaName: string;
  title: string;
  description: string | null;
  imageUrl: string;
  externalUrl: string;
  category: MediaCoverageCategory;
  isFeatured: boolean;
}

export interface MediaOutlet {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
}

export const CATEGORY_VALUES = Object.values(MediaCoverageCategory);
