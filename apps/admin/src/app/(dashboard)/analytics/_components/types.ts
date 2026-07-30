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

// Everything currently displayed on the dashboard, gathered for CSV/PDF export
export interface AnalyticsReport {
  days: number;
  startDate: string; // ISO date (range start, inclusive)
  endDate: string; // ISO date (range end / today, inclusive)
  overview?: AnalyticsOverview;
  daily: DailyPoint[];
  topCategories: AnalyticsTopItem[];
  topDishes: AnalyticsTopItem[];
  topCountries: AnalyticsTopItem[];
}

// Localized labels passed into the pure report builders (keeps them i18n-free)
export interface ReportLabels {
  title: string;
  subtitle: string;
  dateRange: string;
  generatedAt: string;
  visitors: string;
  pageViews: string;
  vsPreviousPeriod: string;
  dailyTrend: string;
  topCategories: string;
  topDishes: string;
  topCountries: string;
  date: string;
  metric: string;
  value: string;
  change: string;
  rank: string;
  name: string;
  views: string;
  share: string;
  country: string;
  noData: string;
}
