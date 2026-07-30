import { createTopListRoute } from "@/lib/analytics";

// GET /api/analytics/top-countries?days=N - Visitors by country
export const GET = createTopListRoute("topCountries");
