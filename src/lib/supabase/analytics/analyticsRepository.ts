import { buildDashboardFromRows } from "@/lib/analytics/buildDashboardFromRows";
import type {
  AnalyticsDashboardFilters,
  AnalyticsDashboardPayload,
  UserActivityEventRow
} from "@/lib/analytics/types";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/serviceClient";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** Demo rows when Supabase is empty — mirrors SQL seed personas. */
function demoSeedRows(): UserActivityEventRow[] {
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

  for (let i = 0; i < 320; i++) {
    const user = users[i % users.length]!;
    const co = companies[i % companies.length]!;
    const pillar = pillars[i % pillars.length]!;
    const eventType = types[i % types.length]!;
    const hour = (17 + (i % 5)) % 24;
    const created = new Date(now - i * 3_600_000);
    created.setHours(hour, (i * 7) % 60, 0, 0);

    rows.push({
      id: `demo-${i}`,
      user_id: user,
      partner_id: i % 3 === 0 ? "demo-apex-clearing" : "demo-riverside-academy",
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
      metadata: { demo: true, userArchetype: user },
      created_at: created.toISOString()
    });
  }
  return rows;
}

export async function fetchAnalyticsDashboard(
  filters: AnalyticsDashboardFilters
): Promise<AnalyticsDashboardPayload> {
  if (!isSupabaseConfigured()) {
    return buildDashboardFromRows(demoSeedRows(), filters, "demo");
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    const since = new Date();
    if (filters.dateRange === "7d") since.setDate(since.getDate() - 7);
    else if (filters.dateRange === "90d") since.setDate(since.getDate() - 90);
    else since.setDate(since.getDate() - 30);

    let query = supabase
      .from("user_activity_events")
      .select("*")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false })
      .limit(2500);

    if (filters.partnerId !== "all") {
      query = query.eq("partner_id", filters.partnerId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data ?? []) as UserActivityEventRow[];
    if (rows.length === 0) {
      return buildDashboardFromRows(demoSeedRows(), filters, "demo");
    }

    return buildDashboardFromRows(rows, filters, "supabase");
  } catch {
    return buildDashboardFromRows(demoSeedRows(), filters, "demo");
  }
}
