// Re-export the shared Prisma singleton (@resto-hub/db) so existing
// "@/lib/prisma" imports keep working without touching every call site.
export { prisma } from "@resto-hub/db";
