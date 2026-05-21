import type { UserActivityEventType } from "@/lib/analytics/eventTypes";
import type { AnalyticsFeatureFlags, AnalyticsTierId } from "@/lib/analytics/tiers";

export type TrackUserEventInput = {
  userId?: string | null;
  partnerId?: string | null;
  companyTicker?: string | null;
  companyName?: string | null;
  pillar?: string | null;
  questId?: string | null;
  cardId?: string | null;
  eventType: UserActivityEventType;
  xpAmount?: number;
  badgeName?: string | null;
  convictionStatus?: string | null;
  metadata?: Record<string, unknown>;
};

export type UserActivityEventRow = {
  id: string;
  user_id: string | null;
  partner_id: string | null;
  company_ticker: string | null;
  company_name: string | null;
  pillar: string | null;
  quest_id: string | null;
  card_id: string | null;
  event_type: UserActivityEventType;
  xp_amount: number;
  badge_name: string | null;
  conviction_status: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type UserSessionRow = {
  id: string;
  user_id: string | null;
  partner_id: string | null;
  session_start: string;
  session_end: string | null;
  duration_seconds: number | null;
  companies_viewed: string[];
  pillars_viewed: string[];
  total_events: number;
  created_at: string;
};

export type AnalyticsDashboardFilters = {
  partnerId: string;
  companyTicker: string;
  pillar: string;
  eventType: string;
  dateRange: "7d" | "30d" | "90d";
};

export type AnalyticsDashboardPayload = {
  source: "supabase" | "demo";
  /** Resolved feature flags for the filtered partner (or full access for admin/all). */
  features: AnalyticsFeatureFlags;
  partnerTier: AnalyticsTierId;
  partnerName: string | null;
  metrics: {
    totalUsers: number;
    totalEvents: number;
    cardsRead: number;
    xpTotal: number;
    badgesEarned: number;
    mostActiveCompany: string;
    mostActivePillar: string;
  };
  timeOfDay: {
    morning: number;
    afternoon: number;
    evening: number;
    lateNight: number;
    peakLabel: string;
  };
  funnel: {
    questStarted: number;
    cardsRead: number;
    quizCompleted: number;
    badgeEarned: number;
    returnVisit: number;
  };
  recentActivity: {
    id: string;
    createdAt: string;
    eventType: UserActivityEventType;
    companyTicker: string | null;
    companyName: string | null;
    pillar: string | null;
    questId: string | null;
    cardId: string | null;
    xpAmount: number;
  }[];
};
