/**
 * Analytics SaaS tiers — feature flags per partner.
 *
 * TODO: Stripe subscription → sync `analytics_tier` on webhook.
 * TODO: Usage-based pricing (events ingested / MAU).
 * TODO: Analytics seat limits per licence.
 * TODO: School/student licence packs · broker enterprise contracts.
 * TODO: White-label dashboard domains per partner.
 */

export const ANALYTICS_TIERS = ["basic", "pro", "enterprise"] as const;
export type AnalyticsTierId = (typeof ANALYTICS_TIERS)[number];

export function isAnalyticsTierId(value: string): value is AnalyticsTierId {
  return (ANALYTICS_TIERS as readonly string[]).includes(value);
}

/** Boolean feature flags stored on `partner_analytics_settings`. */
export type AnalyticsFeatureFlags = {
  enable_basic_metrics: boolean;
  enable_time_tracking: boolean;
  enable_retention_tracking: boolean;
  enable_behavior_funnels: boolean;
  enable_heatmaps: boolean;
  enable_ai_insights: boolean;
  enable_conviction_tracking: boolean;
  enable_company_interest_tracking: boolean;
  enable_sector_tracking: boolean;
  enable_cohort_tracking: boolean;
  enable_school_dashboard: boolean;
  enable_broker_dashboard: boolean;
  enable_api_exports: boolean;
  enable_custom_reports: boolean;
};

export type AnalyticsFeatureKey = keyof AnalyticsFeatureFlags;

export type AnalyticsFeatureDefinition = {
  key: AnalyticsFeatureKey;
  label: string;
  description: string;
  minTier: AnalyticsTierId;
  group: "core" | "pro" | "enterprise";
};

export const ANALYTICS_FEATURE_CATALOG: readonly AnalyticsFeatureDefinition[] = [
  {
    key: "enable_basic_metrics",
    label: "Basic metrics",
    description: "Users, quests, XP, badges, recent activity, top company & pillar.",
    minTier: "basic",
    group: "core"
  },
  {
    key: "enable_time_tracking",
    label: "Time-of-day analytics",
    description: "Session timing and peak learning hours.",
    minTier: "pro",
    group: "pro"
  },
  {
    key: "enable_retention_tracking",
    label: "Retention & streaks",
    description: "Return visits, streak signals, habit loops.",
    minTier: "pro",
    group: "pro"
  },
  {
    key: "enable_behavior_funnels",
    label: "Behavior funnels",
    description: "Quest → read → quiz → badge progression funnel.",
    minTier: "pro",
    group: "pro"
  },
  {
    key: "enable_heatmaps",
    label: "Engagement heatmaps",
    description: "Company × pillar intensity grid.",
    minTier: "pro",
    group: "pro"
  },
  {
    key: "enable_company_interest_tracking",
    label: "Company interest",
    description: "Which tickers learners explore most.",
    minTier: "pro",
    group: "pro"
  },
  {
    key: "enable_conviction_tracking",
    label: "Conviction analytics",
    description: "Conviction updates and thesis-building depth.",
    minTier: "pro",
    group: "pro"
  },
  {
    key: "enable_ai_insights",
    label: "AI insights engine",
    description: "ML narratives and behavioral scoring.",
    minTier: "enterprise",
    group: "enterprise"
  },
  {
    key: "enable_sector_tracking",
    label: "Sector mastery",
    description: "Sector-level interest and mastery signals.",
    minTier: "enterprise",
    group: "enterprise"
  },
  {
    key: "enable_cohort_tracking",
    label: "Cohort analysis",
    description: "Class, branch, or campaign cohort comparisons.",
    minTier: "enterprise",
    group: "enterprise"
  },
  {
    key: "enable_school_dashboard",
    label: "School dashboard",
    description: "Instructor and student progression views.",
    minTier: "enterprise",
    group: "enterprise"
  },
  {
    key: "enable_broker_dashboard",
    label: "Broker dashboard",
    description: "Client-quality and engagement scoring for RIAs.",
    minTier: "enterprise",
    group: "enterprise"
  },
  {
    key: "enable_custom_reports",
    label: "Custom reports",
    description: "Branded PDF / scheduled intelligence reports.",
    minTier: "enterprise",
    group: "enterprise"
  },
  {
    key: "enable_api_exports",
    label: "API exports",
    description: "Streaming event export for data warehouses.",
    minTier: "enterprise",
    group: "enterprise"
  }
] as const;

const TIER_RANK: Record<AnalyticsTierId, number> = {
  basic: 0,
  pro: 1,
  enterprise: 2
};

export const TIER_PRESETS: Record<AnalyticsTierId, AnalyticsFeatureFlags> = {
  basic: {
    enable_basic_metrics: true,
    enable_time_tracking: false,
    enable_retention_tracking: false,
    enable_behavior_funnels: false,
    enable_heatmaps: false,
    enable_ai_insights: false,
    enable_conviction_tracking: false,
    enable_company_interest_tracking: false,
    enable_sector_tracking: false,
    enable_cohort_tracking: false,
    enable_school_dashboard: false,
    enable_broker_dashboard: false,
    enable_api_exports: false,
    enable_custom_reports: false
  },
  pro: {
    enable_basic_metrics: true,
    enable_time_tracking: true,
    enable_retention_tracking: true,
    enable_behavior_funnels: true,
    enable_heatmaps: true,
    enable_ai_insights: false,
    enable_conviction_tracking: true,
    enable_company_interest_tracking: true,
    enable_sector_tracking: false,
    enable_cohort_tracking: false,
    enable_school_dashboard: false,
    enable_broker_dashboard: false,
    enable_api_exports: false,
    enable_custom_reports: false
  },
  enterprise: {
    enable_basic_metrics: true,
    enable_time_tracking: true,
    enable_retention_tracking: true,
    enable_behavior_funnels: true,
    enable_heatmaps: true,
    enable_ai_insights: true,
    enable_conviction_tracking: true,
    enable_company_interest_tracking: true,
    enable_sector_tracking: true,
    enable_cohort_tracking: true,
    enable_school_dashboard: true,
    enable_broker_dashboard: true,
    enable_api_exports: true,
    enable_custom_reports: true
  }
};

export const TIER_LABELS: Record<AnalyticsTierId, string> = {
  basic: "Basic",
  pro: "Pro",
  enterprise: "Enterprise"
};

/** Internal admin “all partners” view — full intelligence surface. */
export const ADMIN_FULL_ACCESS_FLAGS: AnalyticsFeatureFlags = TIER_PRESETS.enterprise;

export function tierMeets(minTier: AnalyticsTierId, actual: AnalyticsTierId): boolean {
  return TIER_RANK[actual] >= TIER_RANK[minTier];
}

export function requiredTierForFeature(key: AnalyticsFeatureKey): AnalyticsTierId {
  return (
    ANALYTICS_FEATURE_CATALOG.find((f) => f.key === key)?.minTier ?? "enterprise"
  );
}
