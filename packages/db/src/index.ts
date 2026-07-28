import { PrismaClient } from "@prisma/client";

// Prisma defaults the pool to num_cpus*2+1 connections with a 10s timeout,
// which starves static generation on small build machines (1 CPU on Vercel
// = 3 connections for ~140 ISR pages against a remote region → P2024).
// Raise the limits unless the URL already pins them explicitly.
function buildDatasourceUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", "10");
    }
    if (!url.searchParams.has("pool_timeout")) {
      url.searchParams.set("pool_timeout", "30");
    }
    return url.toString();
  } catch {
    return raw;
  }
}

// Shared Prisma singleton — reused across apps to avoid duplicated clients
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl: buildDatasourceUrl() });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
