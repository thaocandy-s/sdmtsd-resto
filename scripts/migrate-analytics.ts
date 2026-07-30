import { PrismaClient } from "@prisma/client";

// One-off migration: DailyStatistic/PageView -> analytics_daily/analytics_events.
//
// Run BEFORE `pnpm db:push` so historical daily counters survive the refactor:
//   npx tsx scripts/migrate-analytics.ts
//
// Steps (all idempotent):
//   1. Create the new tables (exact DDL Prisma would generate for the schema).
//   2. Copy DailyStatistic history (date, uniqueVisitors -> visitors, pageViews).
//   3. Drop the legacy DailyStatistic and PageView tables.
// Raw PageView rows are debugging logs and are intentionally not migrated.

const prisma = new PrismaClient();

async function tableExists(name: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT to_regclass(${`"${name}"`}) IS NOT NULL AS exists
  `;
  return rows[0]?.exists ?? false;
}

async function main() {
  console.log("Creating analytics_daily / analytics_events tables...");

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "analytics_daily" (
      "id" TEXT NOT NULL,
      "date" DATE NOT NULL,
      "visitors" INTEGER NOT NULL DEFAULT 0,
      "pageViews" INTEGER NOT NULL DEFAULT 0,
      "topCategories" JSONB NOT NULL DEFAULT '[]',
      "topDishes" JSONB NOT NULL DEFAULT '[]',
      "topCountries" JSONB NOT NULL DEFAULT '[]',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "analytics_daily_pkey" PRIMARY KEY ("id")
    )
  `);
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "analytics_daily_date_key" ON "analytics_daily"("date")`
  );

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "analytics_events" (
      "id" TEXT NOT NULL,
      "event" TEXT NOT NULL,
      "path" TEXT,
      "entityType" TEXT,
      "slug" TEXT,
      "country" TEXT,
      "isNewVisitor" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
    )
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "analytics_events_createdAt_idx" ON "analytics_events"("createdAt")`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "analytics_events_event_createdAt_idx" ON "analytics_events"("event", "createdAt")`
  );

  if (await tableExists("DailyStatistic")) {
    console.log("Copying DailyStatistic history into analytics_daily...");
    const copied = await prisma.$executeRawUnsafe(`
      INSERT INTO "analytics_daily" ("id", "date", "visitors", "pageViews", "createdAt", "updatedAt")
      SELECT "id", "date", "uniqueVisitors", "pageViews", "createdAt", "updatedAt"
      FROM "DailyStatistic"
      ON CONFLICT ("date") DO NOTHING
    `);
    console.log(`Copied ${copied} daily rows.`);

    await prisma.$executeRawUnsafe(`DROP TABLE "DailyStatistic"`);
    console.log("Dropped DailyStatistic.");
  } else {
    console.log("DailyStatistic not found — nothing to copy.");
  }

  if (await tableExists("PageView")) {
    await prisma.$executeRawUnsafe(`DROP TABLE "PageView"`);
    console.log("Dropped PageView (raw logs are not migrated).");
  }

  console.log("Done. Now run `pnpm db:push` to sync the rest of the schema.");
}

main()
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
