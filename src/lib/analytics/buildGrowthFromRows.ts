import { sectorFromTicker } from "@/lib/analytics/sectorFromTicker";
import type {
  GrowthAnalyticsPayload,
  GrowthBreakdownRow,
  GrowthCharts,
  GrowthSummaryMetrics
} from "@/lib/analytics/growthTypes";
import type {
  AnalyticsDashboardFilters,
  UserActivityEventRow,
  UserSessionRow
} from "@/lib/analytics/types";
import { listPartners } from "@/platform/partners/partnerRegistry";

const DAY_MS = 24 * 60 * 60 * 1000;

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function sinceMs(range: AnalyticsDashboardFilters["dateRange"]): number {
  const now = Date.now();
  if (range === "7d") return now - 7 * DAY_MS;
  if (range === "90d") return now - 90 * DAY_MS;
  return now - 30 * DAY_MS;
}

function rangeDayKeys(range: AnalyticsDashboardFilters["dateRange"]): string[] {
  const days =
    range === "7d" ? 7 : range === "90d" ? 90 : 30;
  const keys: string[] = [];
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end.getTime() - i * DAY_MS);
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}

function filterEvents(
  rows: UserActivityEventRow[],
  filters: AnalyticsDashboardFilters,
  since: number
): UserActivityEventRow[] {
  return rows.filter((r) => {
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
}

function filterSessions(
  rows: UserSessionRow[],
  filters: AnalyticsDashboardFilters,
  since: number
): UserSessionRow[] {
  return rows.filter((s) => {
    const t = new Date(s.session_start).getTime();
    if (t < since) return false;
    if (filters.partnerId !== "all" && s.partner_id !== filters.partnerId)
      return false;
    return true;
  });
}

function breakdownBy(
  rows: UserActivityEventRow[],
  keyFn: (r: UserActivityEventRow) => string,
  labelFn?: (id: string) => string
): GrowthBreakdownRow[] {
  const usersByKey = new Map<string, Set<string>>();
  for (const r of rows) {
    if (!r.user_id) continue;
    const key = keyFn(r);
    if (!key || key === "Unknown") continue;
    if (!usersByKey.has(key)) usersByKey.set(key, new Set());
    usersByKey.get(key)!.add(r.user_id);
  }
  return [...usersByKey.entries()]
    .map(([id, set]) => ({
      id,
      label: labelFn ? labelFn(id) : id,
      users: set.size
    }))
    .sort((a, b) => b.users - a.users);
}

function pct(n: number, d: number): number {
  if (d <= 0) return 0;
  return Math.round((n / d) * 1000) / 10;
}

function computeRetention(
  firstSeen: Map<string, string>,
  activityByUserDay: Map<string, Set<string>>
): Pick<GrowthSummaryMetrics, "retentionD1" | "retentionD7" | "retentionD30"> {
  let d1Num = 0;
  let d1Den = 0;
  let d7Num = 0;
  let d7Den = 0;
  let d30Num = 0;
  let d30Den = 0;

  for (const [userId, cohortDay] of firstSeen) {
    const days = activityByUserDay.get(userId);
    if (!days?.has(cohortDay)) continue;

    const cohortMs = new Date(`${cohortDay}T00:00:00Z`).getTime();
    const hasOffset = (offset: number) => {
      const target = new Date(cohortMs + offset * DAY_MS)
        .toISOString()
        .slice(0, 10);
      return days.has(target);
    };

    d1Den += 1;
    if (hasOffset(1)) d1Num += 1;

    d7Den += 1;
    if (hasOffset(7)) d7Num += 1;

    d30Den += 1;
    if (hasOffset(30)) d30Num += 1;
  }

  return {
    retentionD1: pct(d1Num, d1Den),
    retentionD7: pct(d7Num, d7Den),
    retentionD30: pct(d30Num, d30Den)
  };
}

function buildCharts(
  events: UserActivityEventRow[],
  dayKeys: string[],
  firstSeenGlobal: Map<string, string>
): GrowthCharts {
  const usersByDay = new Map<string, Set<string>>();
  const newByDay = new Map<string, number>();
  const eventsByDay = new Map<string, number>();
  const questsByDay = new Map<string, number>();
  const xpByDay = new Map<string, number>();

  for (const d of dayKeys) {
    usersByDay.set(d, new Set());
    newByDay.set(d, 0);
    eventsByDay.set(d, 0);
    questsByDay.set(d, 0);
    xpByDay.set(d, 0);
  }

  for (const r of events) {
    const d = dayKey(r.created_at);
    if (!usersByDay.has(d)) continue;
    if (r.user_id) usersByDay.get(d)!.add(r.user_id);
    eventsByDay.set(d, (eventsByDay.get(d) ?? 0) + 1);
    if (
      r.event_type === "user_completed_quiz" ||
      r.event_type === "user_completed_pillar"
    ) {
      questsByDay.set(d, (questsByDay.get(d) ?? 0) + 1);
    }
    if (r.event_type === "user_earned_xp") {
      xpByDay.set(d, (xpByDay.get(d) ?? 0) + (r.xp_amount ?? 0));
    }
  }

  const usersInFiltered = new Set(
    events.map((r) => r.user_id).filter(Boolean) as string[]
  );
  for (const [userId, first] of firstSeenGlobal) {
    if (newByDay.has(first) && usersInFiltered.has(userId)) {
      newByDay.set(first, (newByDay.get(first) ?? 0) + 1);
    }
  }

  const cumulative = new Set<string>();
  const userGrowth = dayKeys.map((date) => {
    for (const uid of usersByDay.get(date) ?? []) cumulative.add(uid);
    return {
      date,
      cumulativeUsers: cumulative.size,
      newUsers: newByDay.get(date) ?? 0
    };
  });

  const activeUserTrend = dayKeys.map((date, idx) => {
    const dau = usersByDay.get(date)?.size ?? 0;
    const windowStart = Math.max(0, idx - 6);
    const wauSet = new Set<string>();
    for (let i = windowStart; i <= idx; i++) {
      const k = dayKeys[i]!;
      for (const u of usersByDay.get(k) ?? []) wauSet.add(u);
    }
    return { date, dau, wau: wauSet.size };
  });

  const engagementTrend = dayKeys.map((date) => ({
    date,
    events: eventsByDay.get(date) ?? 0,
    questsCompleted: questsByDay.get(date) ?? 0,
    xpEarned: xpByDay.get(date) ?? 0
  }));

  const activityByUserDay = new Map<string, Set<string>>();
  for (const r of events) {
    if (!r.user_id) continue;
    const d = dayKey(r.created_at);
    if (!activityByUserDay.has(r.user_id))
      activityByUserDay.set(r.user_id, new Set());
    activityByUserDay.get(r.user_id)!.add(d);
  }

  const retentionCurve = Array.from({ length: 15 }, (_, day) => {
    let cohort = 0;
    let retained = 0;
    for (const [userId, cohortDay] of firstSeenGlobal) {
      const days = activityByUserDay.get(userId);
      if (!days?.has(cohortDay)) continue;
      cohort += 1;
      const cohortMs = new Date(`${cohortDay}T00:00:00Z`).getTime();
      const target = new Date(cohortMs + day * DAY_MS)
        .toISOString()
        .slice(0, 10);
      if (days.has(target)) retained += 1;
    }
    return { day, rate: pct(retained, cohort) };
  });

  return {
    userGrowth,
    retentionCurve,
    activeUserTrend,
    engagementTrend
  };
}

export function buildGrowthFromRows(
  events: UserActivityEventRow[],
  sessions: UserSessionRow[],
  filters: AnalyticsDashboardFilters,
  source: "supabase" | "demo"
): GrowthAnalyticsPayload {
  const since = sinceMs(filters.dateRange);
  const dayKeys = rangeDayKeys(filters.dateRange);
  const filtered = filterEvents(events, filters, since);
  const filteredSessions = filterSessions(sessions, filters, since);

  const allUserIds = new Set(
    events.map((r) => r.user_id).filter(Boolean) as string[]
  );
  const activeUserIds = new Set(
    filtered.map((r) => r.user_id).filter(Boolean) as string[]
  );

  const firstSeenGlobal = new Map<string, string>();
  for (const r of events) {
    if (!r.user_id) continue;
    const d = dayKey(r.created_at);
    const prev = firstSeenGlobal.get(r.user_id);
    if (!prev || d < prev) firstSeenGlobal.set(r.user_id, d);
  }

  const rangeStart = dayKeys[0]!;
  const rangeEnd = dayKeys[dayKeys.length - 1]!;
  let newUsers = 0;
  let returningUsers = 0;
  const daysPerUser = new Map<string, Set<string>>();

  for (const r of filtered) {
    if (!r.user_id) continue;
    if (!daysPerUser.has(r.user_id)) daysPerUser.set(r.user_id, new Set());
    daysPerUser.get(r.user_id)!.add(dayKey(r.created_at));
  }

  for (const [userId, first] of firstSeenGlobal) {
    if (!activeUserIds.has(userId)) continue;
    if (first >= rangeStart && first <= rangeEnd) newUsers += 1;
    const days = daysPerUser.get(userId);
    if (days && days.size >= 2) returningUsers += 1;
  }

  const lastDay = rangeEnd;
  const wauStart = dayKeys[Math.max(0, dayKeys.length - 7)]!;
  const mauStart = dayKeys[Math.max(0, dayKeys.length - 30)]!;

  const usersOnDay = (from: string, to: string) => {
    const set = new Set<string>();
    for (const r of filtered) {
      if (!r.user_id) continue;
      const d = dayKey(r.created_at);
      if (d >= from && d <= to) set.add(r.user_id);
    }
    return set;
  };

  const dau = usersOnDay(lastDay, lastDay).size;
  const wau = usersOnDay(wauStart, lastDay).size;
  const mau = usersOnDay(mauStart, lastDay).size;

  const activityByUserDay = new Map<string, Set<string>>();
  for (const r of events) {
    if (!r.user_id) continue;
    const d = dayKey(r.created_at);
    if (!activityByUserDay.has(r.user_id))
      activityByUserDay.set(r.user_id, new Set());
    activityByUserDay.get(r.user_id)!.add(d);
  }

  const retention = computeRetention(firstSeenGlobal, activityByUserDay);

  const durations = filteredSessions
    .map((s) => s.duration_seconds)
    .filter((d): d is number => typeof d === "number" && d > 0);
  const avgSessionDurationSeconds =
    durations.length > 0
      ? Math.round(
          durations.reduce((a, b) => a + b, 0) / durations.length
        )
      : 0;

  const questCompletions = filtered.filter((r) =>
    ["user_completed_quiz", "user_completed_pillar"].includes(r.event_type)
  ).length;
  const xpTotal = filtered
    .filter((r) => r.event_type === "user_earned_xp")
    .reduce((a, r) => a + (r.xp_amount ?? 0), 0);
  const denom = Math.max(1, activeUserIds.size);

  const partnerLabels = new Map(
    listPartners().map((p) => [p.id, p.branding.partnerName])
  );

  const summary: GrowthSummaryMetrics = {
    totalUsers: allUserIds.size,
    activeUsers: activeUserIds.size,
    dau,
    wau,
    mau,
    newUsers,
    returningUsers,
    ...retention,
    avgSessionDurationSeconds,
    avgQuestsCompleted: Math.round((questCompletions / denom) * 10) / 10,
    avgXpEarned: Math.round(xpTotal / denom)
  };

  const breakdown = {
    byPartner: breakdownBy(
      filtered,
      (r) => r.partner_id ?? "unknown",
      (id) => partnerLabels.get(id) ?? id
    ),
    byCompany: breakdownBy(filtered, (r) => r.company_ticker ?? "Unknown"),
    bySector: breakdownBy(filtered, (r) => sectorFromTicker(r.company_ticker))
  };

  const charts = buildCharts(filtered, dayKeys, firstSeenGlobal);

  return { source, summary, breakdown, charts };
}
