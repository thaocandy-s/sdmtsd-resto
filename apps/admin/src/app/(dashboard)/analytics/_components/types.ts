import type { AnalyticsTopItem } from "@resto-hub/types";

export type { AnalyticsTopItem };

export interface AnalyticsOverview {
  visitors: number;
  pageViews: number;
  prevVisitors: number;
  prevPageViews: number;
  changePercent: number;
}

export interface DailyPoint {
  date: string;
  visitors: number;
  pageViews: number;
}
