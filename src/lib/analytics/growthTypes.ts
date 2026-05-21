import type { AnalyticsDashboardFilters } from "@/lib/analytics/types";

/** Platform growth + SaaS health metrics (investor / operator dashboards). */
export type GrowthAnalyticsPayload = {
  source: "supabase" | "demo";
  summary: GrowthSummaryMetrics;
  breakdown: GrowthBreakdown;
  charts: GrowthCharts;
};

export type GrowthSummaryMetrics = {
  totalUsers: number;
  activeUsers: number;
  dau: number;
  wau: number;
  mau: number;
  newUsers: number;
  returningUsers: number;
  /** 0–100 */
  retentionD1: number;
  retentionD7: number;
  retentionD30: number;
  avgSessionDurationSeconds: number;
  avgQuestsCompleted: number;
  avgXpEarned: number;
};

export type GrowthBreakdownRow = {
  id: string;
  label: string;
  users: number;
};

export type GrowthBreakdown = {
  byPartner: GrowthBreakdownRow[];
  byCompany: GrowthBreakdownRow[];
  bySector: GrowthBreakdownRow[];
};

export type GrowthCharts = {
  userGrowth: GrowthUserGrowthPoint[];
  retentionCurve: GrowthRetentionPoint[];
  activeUserTrend: GrowthActiveTrendPoint[];
  engagementTrend: GrowthEngagementPoint[];
};

export type GrowthUserGrowthPoint = {
  date: string;
  cumulativeUsers: number;
  newUsers: number;
};

export type GrowthRetentionPoint = {
  day: number;
  rate: number;
};

export type GrowthActiveTrendPoint = {
  date: string;
  dau: number;
  wau: number;
};

export type GrowthEngagementPoint = {
  date: string;
  events: number;
  questsCompleted: number;
  xpEarned: number;
};

export type GrowthAnalyticsFilters = AnalyticsDashboardFilters;
