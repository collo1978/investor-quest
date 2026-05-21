import { buildGrowthFromRows } from "@/lib/analytics/buildGrowthFromRows";
import type { GrowthAnalyticsPayload } from "@/lib/analytics/growthTypes";
import type {
  AnalyticsDashboardFilters,
  UserActivityEventRow,
  UserSessionRow
} from "@/lib/analytics/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function demoSessions(): UserSessionRow[] {
  const users = [
    "demo-user-casual-explorer",
    "demo-user-consistent-learner",
    "demo-user-deep-research",
    "demo-user-high-conviction",
    "demo-user-streak-builder"
  ];
  const rows: UserSessionRow[] = [];
  const now = Date.now();
  for (let s = 0; s < 48; s++) {
    const start = new Date(now - s * 18 * 3_600_000);
    const duration = 600 + (s % 40) * 60;
    rows.push({
      id: `demo-session-${s}`,
      user_id: users[s % users.length]!,
      partner_id:
        s % 3 === 0 ? "demo-apex-clearing" : "demo-riverside-academy",
      session_start: start.toISOString(),
      session_end: new Date(start.getTime() + duration * 1000).toISOString(),
      duration_seconds: duration,
      companies_viewed: ["AAPL", "NVDA"],
      pillars_viewed: ["business", "forces"],
      total_events: 8 + (s % 20),
      created_at: start.toISOString()
    });
  }
  return rows;
}

function demoEvents(): UserActivityEventRow[] {
  const users = [
    "demo-user-casual-explorer",
    "demo-user-consistent-learner",
    "demo-user-deep-research",
    "demo-user-high-conviction",
    "demo-user-streak-builder"
  ];
  const companies = [
    { ticker: "AAPL", name: "Apple" },
    { ticker: "NVDA", name: "NVIDIA" },
    { ticker: "TSLA", name: "Tesla" },
    { ticker: "AMZN", name: "Amazon" },
    { ticker: "META", name: "Meta" }
  ];
  const pillars = ["business", "forces", "financials", "management"] as const;
  const types = [
    "user_started_quest",
    "user_opened_card",
    "user_marked_card_read",
    "user_completed_quiz",
    "user_earned_xp",
    "user_earned_badge",
    "user_completed_pillar",
    "user_updated_conviction"
  ] as const;

  const rows: UserActivityEventRow[] = [];
  const now = Date.now();

  for (let i = 0; i < 480; i++) {
    const user = users[i % users.length]!;
    const co = companies[i % companies.length]!;
    const pillar = pillars[i % pillars.length]!;
    const eventType = types[i % types.length]!;
    const created = new Date(now - i * 4 * 3_600_000);
    created.setUTCHours((17 + (i % 5)) % 24, (i * 7) % 60, 0, 0);

    rows.push({
      id: `demo-growth-${i}`,
      user_id: user,
      partner_id:
        i % 3 === 0
          ? "demo-apex-clearing"
          : i % 3 === 1
            ? "demo-northstar-bank"
            : "demo-riverside-academy",
      company_ticker: co.ticker,
      company_name: co.name,
      pillar,
      quest_id: `${pillar}-quest-${(i % 5) + 1}`,
      card_id: i % 4 === 0 ? `card-${(i % 3) + 1}` : null,
      event_type: eventType,
      xp_amount: eventType === "user_earned_xp" ? 40 + (i % 80) : 0,
      badge_name: eventType === "user_earned_badge" ? "first_quiz_pass" : null,
      conviction_status:
        eventType === "user_updated_conviction" ? "submitted" : null,
      metadata: { demo: true },
      created_at: created.toISOString()
    });
  }
  return rows;
}

export async function fetchGrowthAnalytics(
  filters: AnalyticsDashboardFilters
): Promise<GrowthAnalyticsPayload> {
  const events = demoEvents();
  const sessions = demoSessions();

  if (!isSupabaseConfigured()) {
    return buildGrowthFromRows(events, sessions, filters, "demo");
  }

  try {
    const supabase = await createSupabaseServerClient();
    const since = new Date();
    if (filters.dateRange === "7d") since.setDate(since.getDate() - 7);
    else if (filters.dateRange === "90d") since.setDate(since.getDate() - 90);
    else since.setDate(since.getDate() - 30);

    let eventQuery = supabase
      .from("user_activity_events")
      .select("*")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true })
      .limit(5000);

    if (filters.partnerId !== "all") {
      eventQuery = eventQuery.eq("partner_id", filters.partnerId);
    }

    let sessionQuery = supabase
      .from("user_sessions")
      .select("*")
      .gte("session_start", since.toISOString())
      .limit(500);

    if (filters.partnerId !== "all") {
      sessionQuery = sessionQuery.eq("partner_id", filters.partnerId);
    }

    const [eventRes, sessionRes] = await Promise.all([
      eventQuery,
      sessionQuery
    ]);

    if (eventRes.error) throw eventRes.error;
    if (sessionRes.error) throw sessionRes.error;

    const eventRows = (eventRes.data ?? []) as UserActivityEventRow[];
    const sessionRows = (sessionRes.data ?? []) as UserSessionRow[];

    if (eventRows.length === 0) {
      return buildGrowthFromRows(events, sessions, filters, "demo");
    }

    return buildGrowthFromRows(
      eventRows,
      sessionRows.length > 0 ? sessionRows : sessions,
      filters,
      "supabase"
    );
  } catch {
    return buildGrowthFromRows(events, sessions, filters, "demo");
  }
}
