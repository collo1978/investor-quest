import type { UserActivityEventType } from "@/lib/analytics/eventTypes";
import { TIER_PRESETS } from "@/lib/analytics/tiers";
import type {
  AnalyticsDashboardFilters,
  AnalyticsDashboardPayload,
  UserActivityEventRow
} from "@/lib/analytics/types";

function sinceMs(range: AnalyticsDashboardFilters["dateRange"]): number {
  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();
  if (range === "7d") return now - 7 * day;
  if (range === "90d") return now - 90 * day;
  return now - 30 * day;
}

function timeBucket(hour: number): keyof AnalyticsDashboardPayload["timeOfDay"] {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "lateNight";
}

const PEAK_COPY: Record<
  keyof Omit<AnalyticsDashboardPayload["timeOfDay"], "peakLabel">,
  string
> = {
  morning: "Most users complete quests in the morning before school or work.",
  afternoon: "Afternoon sessions spike when users research during lunch breaks.",
  evening:
    "Most users complete quests in the evening after market close.",
  lateNight: "Late-night learners show focused deep-dive behavior."
};

export function buildDashboardFromRows(
  rows: UserActivityEventRow[],
  filters: AnalyticsDashboardFilters,
  source: "supabase" | "demo"
): AnalyticsDashboardPayload {
  const since = sinceMs(filters.dateRange);

  const filtered = rows.filter((r) => {
    const t = new Date(r.created_at).getTime();
    if (t < since) return false;
    if (filters.partnerId !== "all" && r.partner_id !== filters.partnerId)
      return false;
    if (
      filters.companyTicker !== "all" &&
      r.company_ticker !== filters.companyTicker
    )
      return false;
    if (filters.pillar !== "all" && r.pillar !== filters.pillar) return false;
    if (filters.eventType !== "all" && r.event_type !== filters.eventType)
      return false;
    return true;
  });

  const users = new Set(
    filtered.map((r) => r.user_id).filter(Boolean) as string[]
  );

  const cardsRead = filtered.filter(
    (r) => r.event_type === "user_marked_card_read"
  ).length;

  const xpTotal = filtered
    .filter((r) => r.event_type === "user_earned_xp")
    .reduce((a, r) => a + (r.xp_amount ?? 0), 0);

  const badgesEarned = filtered.filter(
    (r) => r.event_type === "user_earned_badge"
  ).length;

  const companyCounts = new Map<string, number>();
  const pillarCounts = new Map<string, number>();
  for (const r of filtered) {
    if (r.company_ticker) {
      companyCounts.set(
        r.company_ticker,
        (companyCounts.get(r.company_ticker) ?? 0) + 1
      );
    }
    if (r.pillar) {
      pillarCounts.set(r.pillar, (pillarCounts.get(r.pillar) ?? 0) + 1);
    }
  }

  const topEntry = (m: Map<string, number>, fallback: string) => {
    let best = fallback;
    let max = 0;
    for (const [k, v] of m) {
      if (v > max) {
        max = v;
        best = k;
      }
    }
    return best;
  };

  const timeOfDay = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    lateNight: 0,
    peakLabel: PEAK_COPY.evening
  };

  for (const r of filtered) {
    const h = new Date(r.created_at).getHours();
    const bucket = timeBucket(h);
    if (bucket !== "peakLabel") timeOfDay[bucket] += 1;
  }

  const peakKey = (
    ["morning", "afternoon", "evening", "lateNight"] as const
  ).reduce((a, b) => (timeOfDay[a] >= timeOfDay[b] ? a : b));
  timeOfDay.peakLabel = PEAK_COPY[peakKey];

  const funnel = {
    questStarted: filtered.filter((r) => r.event_type === "user_started_quest")
      .length,
    cardsRead,
    quizCompleted: filtered.filter(
      (r) => r.event_type === "user_completed_quiz"
    ).length,
    badgeEarned: badgesEarned,
    returnVisit: filtered.filter((r) =>
      ["user_started_quest", "user_marked_card_read"].includes(r.event_type)
    ).length
  };

  const recentActivity = [...filtered]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 24)
    .map((r) => ({
      id: r.id,
      createdAt: r.created_at,
      eventType: r.event_type as UserActivityEventType,
      companyTicker: r.company_ticker,
      companyName: r.company_name,
      pillar: r.pillar,
      questId: r.quest_id,
      cardId: r.card_id,
      xpAmount: r.xp_amount ?? 0
    }));

  return {
    source,
    features: TIER_PRESETS.basic,
    partnerTier: "basic",
    partnerName: null,
    metrics: {
      totalUsers: users.size,
      totalEvents: filtered.length,
      cardsRead,
      xpTotal,
      badgesEarned,
      mostActiveCompany: topEntry(companyCounts, "AAPL"),
      mostActivePillar: topEntry(pillarCounts, "business")
    },
    timeOfDay,
    funnel,
    recentActivity
  };
}
