import { cache } from "react";
import { prisma } from "@/lib/prisma";

// Deduped per-render lookup of the active restaurant record.
// Safe to call from layout, generateMetadata, and pages in the same request.
export const getRestaurant = cache(async () => {
  return prisma.restaurant.findFirst({
    where: { isActive: true },
  });
});
