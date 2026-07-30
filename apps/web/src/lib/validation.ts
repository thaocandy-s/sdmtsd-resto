import { z } from "zod";

// Validation schemas for the public write endpoints.

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(50).nullish(),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
});

export const reservationSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(50).nullish(),
  date: z.coerce.date(),
  time: z.string().trim().min(1).max(20),
  guests: z.coerce.number().int().min(1).max(100),
  course: z.string().trim().max(200).nullish(),
  notes: z.string().trim().max(2000).nullish(),
});

export const trackEventSchema = z.object({
  event: z.enum(["page_view", "view_category", "view_dish"]),
  path: z.string().max(500).nullish(),
  locale: z.string().max(10).nullish(),
  entityType: z.enum(["menu", "drink", "buffet"]).nullish(),
  slug: z.string().max(200).nullish(),
  isNewVisitor: z.boolean().nullish(),
});
