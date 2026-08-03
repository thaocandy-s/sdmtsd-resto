import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { OrderableModule } from "@/lib/ordering-types";

export type { OrderableModule };

// Shared ordering service for every admin module with a manual sortOrder.
// sortOrder is a system-managed field: new items are appended, explicit
// positions shift neighbours, and every mutation ends with a normalization
// pass that keeps sortOrder a gapless 1...N sequence per scope (category).
//
// All operations run inside a serializable transaction to prevent race
// conditions between concurrent reorders.

interface OrderableConfig {
  /** Prisma delegate name on the client, e.g. prisma.heroBanner */
  delegate: string;
  /** Field ordering is scoped to (independent order per category) */
  scopeField?: "categoryId";
  /** Model uses soft delete via deletedAt */
  softDelete?: boolean;
  /** Permission module/action checked by the reorder endpoint */
  permissionModule: string;
}

export const ORDERABLE_MODELS: Record<OrderableModule, OrderableConfig> = {
  banner: { delegate: "heroBanner", permissionModule: "home" },
  event: { delegate: "event", permissionModule: "home" },
  food: { delegate: "food", scopeField: "categoryId", softDelete: true, permissionModule: "menu" },
  "food-category": { delegate: "foodCategory", permissionModule: "menu" },
  drink: {
    delegate: "drink",
    scopeField: "categoryId",
    softDelete: true,
    permissionModule: "drink",
  },
  "drink-category": { delegate: "drinkCategory", permissionModule: "drink" },
  buffet: { delegate: "buffetCourse", softDelete: true, permissionModule: "buffet" },
  "beer-art": { delegate: "beerArt", softDelete: true, permissionModule: "beerArt" },
  "katanuki-rule": { delegate: "katanukiRule", permissionModule: "challenge" },
  "katanuki-winner": { delegate: "katanukiWinner", permissionModule: "challenge" },
  // Tourist places are ordered globally across all categories by design.
  "tour-place": {
    delegate: "tourPlace",
    softDelete: true,
    permissionModule: "tourist",
  },
  "tour-category": { delegate: "tourCategory", permissionModule: "tourist" },
  // FAQ questions are ordered globally across all categories by design.
  faq: { delegate: "faq", softDelete: true, permissionModule: "faq" },
  "faq-category": { delegate: "faqCategory", permissionModule: "faq" },
};

type Tx = Prisma.TransactionClient;

// Minimal delegate surface used by the ordering helpers. Access is dynamic
// because each module maps to a different Prisma model.
interface OrderDelegate {
  findMany(args: unknown): Promise<Array<{ id: string; sortOrder: number }>>;
  findUnique(args: unknown): Promise<Record<string, unknown> | null>;
  update(args: unknown): Promise<unknown>;
  updateMany(args: unknown): Promise<{ count: number }>;
  count(args: unknown): Promise<number>;
}

function getDelegate(tx: Tx, module: OrderableModule): OrderDelegate {
  const config = ORDERABLE_MODELS[module];
  return (tx as unknown as Record<string, OrderDelegate>)[config.delegate];
}

function scopeWhere(module: OrderableModule, scopeValue?: string | null): Record<string, unknown> {
  const config = ORDERABLE_MODELS[module];
  const where: Record<string, unknown> = {};
  if (config.scopeField && scopeValue !== undefined) where[config.scopeField] = scopeValue;
  if (config.softDelete) where.deletedAt = null;
  return where;
}

/**
 * Renumber all items in a scope into consecutive integers 1...N.
 * Only writes rows whose sortOrder actually changed.
 */
export async function normalizeSortOrder(
  tx: Tx,
  module: OrderableModule,
  scopeValue?: string | null
): Promise<void> {
  const delegate = getDelegate(tx, module);
  const items = await delegate.findMany({
    where: scopeWhere(module, scopeValue),
    select: { id: true, sortOrder: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
  });

  const updates = items
    .map((item, index) => ({ id: item.id, sortOrder: index + 1 }))
    .filter((next, index) => items[index].sortOrder !== next.sortOrder);

  for (const { id, sortOrder } of updates) {
    await delegate.update({ where: { id }, data: { sortOrder } });
  }
}

/**
 * Compute the sortOrder for a new item and shift neighbours when an explicit
 * position was requested. Must be called inside the same transaction that
 * creates the item.
 *
 * - no position   → append to the end (max + 1)
 * - position <= 0 → insert at the beginning
 * - position > N  → append to the end
 */
export async function resolveInsertPosition(
  tx: Tx,
  module: OrderableModule,
  scopeValue?: string | null,
  position?: number | null
): Promise<number> {
  const delegate = getDelegate(tx, module);
  const where = scopeWhere(module, scopeValue);
  const count = await delegate.count({ where });

  if (position === undefined || position === null) return count + 1;

  const target = Math.min(Math.max(Math.trunc(position), 1), count + 1);
  if (target <= count) {
    // Shift the target slot and everything after it down by one.
    await delegate.updateMany({
      where: { ...where, sortOrder: { gte: target } },
      data: { sortOrder: { increment: 1 } },
    });
  }
  return target;
}

/**
 * Reposition an existing item (explicit position from the Advanced form) and
 * normalize the scope afterwards. Must run inside a transaction.
 */
export async function moveToPosition(
  tx: Tx,
  module: OrderableModule,
  id: string,
  position: number,
  scopeValue?: string | null
): Promise<void> {
  const delegate = getDelegate(tx, module);
  const where = scopeWhere(module, scopeValue);
  const items = await delegate.findMany({
    where,
    select: { id: true, sortOrder: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
  });

  const currentIndex = items.findIndex((item) => item.id === id);
  if (currentIndex === -1) return;

  const targetIndex = Math.min(Math.max(Math.trunc(position), 1), items.length) - 1;
  if (targetIndex === currentIndex) {
    await normalizeSortOrder(tx, module, scopeValue);
    return;
  }

  const reordered = [...items];
  const [moved] = reordered.splice(currentIndex, 1);
  reordered.splice(targetIndex, 0, moved);

  for (let i = 0; i < reordered.length; i++) {
    if (reordered[i].sortOrder !== i + 1) {
      await delegate.update({ where: { id: reordered[i].id }, data: { sortOrder: i + 1 } });
    }
  }
}

/**
 * Create an ordered row. Resolves the insert position (append by default,
 * shifting neighbours for an explicit position), runs the caller's create
 * with the computed sortOrder, then normalizes the scope — all atomically.
 */
export async function createOrdered<T>(
  module: OrderableModule,
  scopeValue: string | null | undefined,
  position: number | null | undefined,
  create: (tx: Tx, sortOrder: number) => Promise<T>
): Promise<T> {
  return runOrderingTransaction(async (tx) => {
    const sortOrder = await resolveInsertPosition(tx, module, scopeValue, position);
    const row = await create(tx, sortOrder);
    await normalizeSortOrder(tx, module, scopeValue);
    return row;
  });
}

/**
 * Update an ordered row while keeping sortOrder system-managed.
 * - When the scope (category) changes, the item is appended to the end of the
 *   destination scope unless an explicit position is given, and both the old
 *   and new scopes are normalized.
 * - When only an explicit position is given, the item is moved within its
 *   scope and the scope is renumbered.
 * The caller's `update` receives the sortOrder to persist (undefined = leave
 * sortOrder untouched; positioning is applied afterwards).
 */
export async function updateOrdered<T>(
  module: OrderableModule,
  id: string,
  opts: {
    previousScope?: string | null;
    nextScope?: string | null;
    position?: number | null;
  },
  update: (tx: Tx, sortOrder: number | undefined) => Promise<T>
): Promise<T> {
  const { previousScope, nextScope, position } = opts;
  const scopeChanged =
    previousScope !== undefined && nextScope !== undefined && previousScope !== nextScope;

  return runOrderingTransaction(async (tx) => {
    let sortOrder: number | undefined;
    if (scopeChanged) {
      sortOrder = await resolveInsertPosition(tx, module, nextScope, position ?? null);
    }

    const row = await update(tx, sortOrder);

    if (scopeChanged) {
      await normalizeSortOrder(tx, module, previousScope);
      await normalizeSortOrder(tx, module, nextScope);
    } else if (position !== undefined && position !== null) {
      await moveToPosition(tx, module, id, position, nextScope ?? previousScope);
    }

    return row;
  });
}

/**
 * Apply a full drag & drop ordering: orderedIds is the complete new order of
 * one scope. Validates that the ids exactly match the scope contents, then
 * renumbers 1...N inside a serializable transaction.
 */
export async function reorderItems(
  module: OrderableModule,
  orderedIds: string[],
  scopeValue?: string | null
): Promise<void> {
  await runOrderingTransaction(async (tx) => {
    const delegate = getDelegate(tx, module);
    const where = scopeWhere(module, scopeValue);
    const existing = await delegate.findMany({ where, select: { id: true, sortOrder: true } });

    const existingIds = new Set(existing.map((item) => item.id));
    const uniqueOrdered = new Set(orderedIds);
    if (
      uniqueOrdered.size !== orderedIds.length ||
      existing.length !== orderedIds.length ||
      orderedIds.some((id) => !existingIds.has(id))
    ) {
      throw new OrderingConflictError(
        "Ordered ids do not match the current items. Refresh and try again."
      );
    }

    const currentById = new Map(existing.map((item) => [item.id, item.sortOrder]));
    for (let i = 0; i < orderedIds.length; i++) {
      if (currentById.get(orderedIds[i]) !== i + 1) {
        await delegate.update({ where: { id: orderedIds[i] }, data: { sortOrder: i + 1 } });
      }
    }
  });
}

/** Normalize a scope in its own transaction (after deletes / scope moves). */
export async function normalizeScope(
  module: OrderableModule,
  scopeValue?: string | null
): Promise<void> {
  await runOrderingTransaction((tx) => normalizeSortOrder(tx, module, scopeValue));
}

/** Raised when the client's view of the list is stale. Maps to HTTP 409. */
export class OrderingConflictError extends Error {}

const SERIALIZATION_FAILURE_CODES = new Set(["P2034"]);

/**
 * Run an ordering mutation inside a serializable transaction, retrying once
 * when Postgres aborts it due to a concurrent write.
 */
export async function runOrderingTransaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await prisma.$transaction(fn, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      const retriable =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        SERIALIZATION_FAILURE_CODES.has(error.code) &&
        attempt < 2;
      if (!retriable) throw error;
    }
  }
}
