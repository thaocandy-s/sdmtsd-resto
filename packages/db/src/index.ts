import { PrismaClient } from "@prisma/client";

// Shared Prisma singleton — reused across apps to avoid duplicated clients
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
