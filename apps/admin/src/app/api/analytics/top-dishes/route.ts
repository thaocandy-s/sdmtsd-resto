import { createTopListRoute } from "@/lib/analytics";

// GET /api/analytics/top-dishes?days=N - Top viewed dishes
export const GET = createTopListRoute("topDishes");
