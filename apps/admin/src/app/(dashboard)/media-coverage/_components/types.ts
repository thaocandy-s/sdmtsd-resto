import { MediaCoverageCategory } from "@prisma/client";

export interface MediaCoverage {
  id: string;
  publishedAt: string;
  mediaName: string;
  title: string;
  description: string | null;
  imageUrl: string;
  externalUrl: string;
  category: MediaCoverageCategory;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
}

export interface MediaOutlet {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}

export type ArticleFormData = {
  publishedAt: string;
  mediaName: string;
  title: string;
  description: string;
  imageUrl: string;
  externalUrl: string;
  category: MediaCoverageCategory | "";
  isFeatured: boolean;
  isPublished: boolean;
  position: string;
};

export type OutletFormData = {
  name: string;
  logoUrl: string;
  websiteUrl: string;
  isActive: boolean;
  position: string;
};

export const emptyArticleForm: ArticleFormData = {
  publishedAt: new Date().toISOString().slice(0, 10),
  mediaName: "",
  title: "",
  description: "",
  imageUrl: "",
  externalUrl: "",
  category: "",
  isFeatured: false,
  isPublished: false,
  position: "",
};

export const emptyOutletForm: OutletFormData = {
  name: "",
  logoUrl: "",
  websiteUrl: "",
  isActive: true,
  position: "",
};

export const CATEGORY_OPTIONS = Object.values(MediaCoverageCategory);
