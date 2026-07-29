import { z } from "zod";

// Shared Zod schemas for admin content mutations (menu / drink / buffet).
// Route handlers use safeParse and return 400 with field errors on failure.

const contentStatus = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

// Accepts numbers or numeric strings; empty string / null become null.
const optionalInt = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : v),
  z.coerce.number().int().nullable()
);

const optionalFloat = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : v),
  z.coerce.number().nullable()
);

// Optional explicit position for ordered content (Advanced form field).
// sortOrder itself is system-managed; clients request a position instead and
// the ordering service (lib/ordering.ts) computes/normalizes sortOrder.
export const positionValue = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().int().optional()
);

// System-wide consumption tax rate, stored as a percent (0–100) in Setting.
export const taxRateSchema = z.object({
  taxRate: z.coerce.number().min(0).max(100),
});

export const foodCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200),
  description: z.string().max(5000).nullish(),
  price: z.coerce.number().int().min(0),
  originalPrice: optionalInt,
  categoryId: z.string().min(1),
  imageUrl: z.string().max(1000).nullish(),
  images: z.array(z.string().max(1000)).max(20).optional(),
  isPopular: z.boolean().optional(),
  isRecommended: z.boolean().optional(),
  ingredients: z.string().max(2000).nullish(),
  calories: optionalInt,
  position: positionValue,
  status: contentStatus.optional(),
});

export const foodUpdateSchema = foodCreateSchema.partial();

export const drinkCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200),
  description: z.string().max(5000).nullish(),
  price: z.coerce.number().int().min(0),
  originalPrice: optionalInt,
  categoryId: z.string().min(1),
  imageUrl: z.string().max(1000).nullish(),
  images: z.array(z.string().max(1000)).max(20).optional(),
  isPopular: z.boolean().optional(),
  isRecommended: z.boolean().optional(),
  alcoholPercent: optionalFloat,
  volume: z.string().max(50).nullish(),
  position: positionValue,
  status: contentStatus.optional(),
});

export const drinkUpdateSchema = drinkCreateSchema.partial();

export const buffetCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200),
  description: z.string().max(5000).nullish(),
  price: z.coerce.number().int().min(0),
  duration: z.coerce.number().int().min(1),
  minPeople: optionalInt,
  maxPeople: optionalInt,
  includes: z.array(z.string().max(500)).max(100).optional(),
  isAllMenu: z.boolean().optional(),
  notes: z.string().max(5000).nullish(),
  imageUrl: z.string().max(1000).nullish(),
  images: z.array(z.string().max(1000)).max(20).optional(),
  isPopular: z.boolean().optional(),
  position: positionValue,
  status: contentStatus.optional(),
});

export const buffetUpdateSchema = buffetCreateSchema.partial();
