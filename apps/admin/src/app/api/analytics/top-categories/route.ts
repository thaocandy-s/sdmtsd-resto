import { createTopListRoute } from "@/lib/analytics";

// GET /api/analytics/top-categories?days=N - Top viewed categories
export const GET = createTopListRoute("topCategories");
