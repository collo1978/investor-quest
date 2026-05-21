import type {
  AnalyticsAggregateRow,
  AnalyticsFilterState,
  DashboardSegment,
  PartnerType
} from "@/platform/types";
import { listPartners } from "@/platform/partners/partnerRegistry";
import { PACKAGE_TIERS } from "@/platform/packages/packageDefinitions";

/** Deterministic demo aggregates — replace with API slice */
export function buildDemoAnalyticsSlice(
  segment: DashboardSegment,
  filters: AnalyticsFilterState
): {
  headline: string;
  rows: AnalyticsAggregateRow[];
  filtersApplied: AnalyticsFilterState;
} {
  const partners = listPartners();
  const partner =
    filters.partnerId === "all"
      ? null
      : partners.find((p) => p.id === filters.partnerId) ?? null;

  const tierKey =
    filters.packageTier === "all"
      ? (partner?.licence.packageTierId ?? "pro")
      : filters.packageTier;

  const tier = PACKAGE_TIERS[tierKey];

  const base: AnalyticsAggregateRow[] = [
    { event: "login", count: 12840 + (segment === "broker" ? 4000 : 0) },
    { event: "session_active_daily", count: 1820 },
    { event: "session_active_monthly", count: 9600 },
    { event: "quest_started", count: 5420 },
    { event: "quest_completed", count: 2180 },
    { event: "xp_earned", count: 186_000 },
    { event: "level_up", count: 420 },
    { event: "badge_unlocked", count: 880 },
    { event: "quiz_completed", count: 3120 },
    { event: "quiz_score", count: 2980, dimension: "avg 78%" },
    { event: "company_researched", count: 6400 },
    { event: "sector_viewed", count: 1200 },
    { event: "module_used", count: 9100 },
    { event: "reward_unlocked", count: segment === "broker" ? 540 : 120 },
    { event: "streak_tick", count: 2400 },
    { event: "retention_signal", count: 360 },
    { event: "partner_engagement_pulse", count: 42 }
  ];

  const headlineParts = [
    segment === "school"
      ? "Student learning velocity"
      : segment === "bank"
        ? "Financial education engagement"
        : "Investor engagement + retention",
    partner ? ` · ${partner.branding.partnerName}` : " · All partners",
    ` · Tier ${tier.displayName}`,
    ` · Window ${filters.dateRange}`
  ];

  return {
    headline: headlineParts.join(""),
    rows: base,
    filtersApplied: { ...filters }
  };
}

export function defaultAnalyticsFilters(
  partnerType: PartnerType
): AnalyticsFilterState {
  const partners = listPartners();
  const defaultPartner = partners.find((p) => p.type === partnerType);
  return {
    partnerId: defaultPartner?.id ?? partners[0]?.id ?? "demo-riverside-academy",
    userType: "all",
    dateRange: "30d",
    companyId: "all",
    sector: "all",
    moduleId: "all",
    packageTier: "all"
  };
}

export type PartnerEngagementSnapshot = {
  partnerId: string;
  dau: number;
  mau: number;
  questCompletionRate: number;
  avgQuizScore: number;
  xpPerActive: number;
};

export function demoPartnerSnapshots(): PartnerEngagementSnapshot[] {
  return listPartners().map((p, i) => ({
    partnerId: p.id,
    dau: 400 + i * 120,
    mau: 3200 + i * 400,
    questCompletionRate: 0.42 + i * 0.05,
    avgQuizScore: 0.74 + i * 0.02,
    xpPerActive: 420 + i * 30
  }));
}
