import { ContentStatus, ReservationStatus, ContactStatus, RoleName } from "../enums";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  role?: Role;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Role {
  id: string;
  name: RoleName;
  label: string;
  description?: string | null;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  roleId: string;
  module: string;
  action: string;
  createdAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  openingHours?: Record<string, unknown> | null;
  holidays?: Record<string, unknown> | null;
  socialLinks?: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  mobileImageUrl?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FoodCategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  foods?: Food[];
  createdAt: string;
  updatedAt: string;
}

export interface Food {
  id: string;
  categoryId: string;
  category?: FoodCategory;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  originalPrice?: number | null;
  imageUrl?: string | null;
  images: string[];
  isPopular: boolean;
  isRecommended: boolean;
  allergens: string[];
  ingredients?: string | null;
  sortOrder: number;
  status: ContentStatus;
  calories?: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface DrinkCategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  drinks?: Drink[];
  createdAt: string;
  updatedAt: string;
}

export interface Drink {
  id: string;
  categoryId: string;
  category?: DrinkCategory;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  originalPrice?: number | null;
  imageUrl?: string | null;
  images: string[];
  isPopular: boolean;
  isRecommended: boolean;
  alcoholPercent?: number | null;
  volume?: string | null;
  sortOrder: number;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface BuffetCourse {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  duration: number;
  minPeople?: number | null;
  maxPeople?: number | null;
  includes: string[];
  imageUrl?: string | null;
  images: string[];
  isPopular: boolean;
  sortOrder: number;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface BeerArt {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  customerName?: string | null;
  artistName?: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface KatanukiWinner {
  id: string;
  participantName: string;
  imageUrl?: string | null;
  challengeName?: string | null;
  discountAwarded?: string | null;
  completedAt: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KatanukiRule {
  id: string;
  title: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TourCategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  places?: TourPlace[];
  createdAt: string;
  updatedAt: string;
}

export interface TourPlace {
  id: string;
  categoryId: string;
  category?: TourCategory;
  name: string;
  slug: string;
  description?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  websiteUrl?: string | null;
  phone?: string | null;
  imageUrl?: string | null;
  images: string[];
  openingHours?: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface FaqCategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  faqs?: Faq[];
  createdAt: string;
  updatedAt: string;
}

export interface Faq {
  id: string;
  categoryId: string;
  category?: FaqCategory;
  question: string;
  answer: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Reservation {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  date: string;
  time: string;
  guests: number;
  course?: string | null;
  notes?: string | null;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  id: string;
  fileName: string;
  url: string;
  storagePath: string;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
  tags: string[];
  folder?: string | null;
  uploadedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SeoMeta {
  id: string;
  pagePath: string;
  title?: string | null;
  description?: string | null;
  keywords: string[];
  ogImage?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  canonicalUrl?: string | null;
  noIndex: boolean;
  jsonLd?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Setting {
  id: string;
  key: string;
  value: Record<string, unknown>;
  group: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  action: string;
  module: string;
  entityId?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface PageView {
  id: string;
  path: string;
  locale?: string | null;
  userAgent?: string | null;
  referrer?: string | null;
  country?: string | null;
  createdAt: string;
}
