import { z } from "zod";

export const emailSchema = z.string().email("Invalid email address");
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().optional(),
});

export const reservationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: emailSchema,
  phone: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  guests: z.coerce.number().int().min(1).max(20),
  course: z.string().optional(),
  notes: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: emailSchema,
  phone: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ReservationInput = z.infer<typeof reservationSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
