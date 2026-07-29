export interface DailyStat {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  homeViews: number;
  menuViews: number;
  drinkViews: number;
  buffetViews: number;
  beerArtViews: number;
  challengeViews: number;
  touristViews: number;
  infoViews: number;
  faqViews: number;
  contactViews: number;
  reservationViews: number;
  reservationClicks: number;
  contactClicks: number;
}

export interface SectionBreakdown {
  section: string;
  views: number;
}

export interface AnalyticsSummary {
  totalPageViews: number;
  uniqueVisitors: number;
  reservationClicks: number;
  contactClicks: number;
  changePercent: number;
  prevPageViews: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  sectionBreakdown: SectionBreakdown[];
  dailyData: DailyStat[];
}
