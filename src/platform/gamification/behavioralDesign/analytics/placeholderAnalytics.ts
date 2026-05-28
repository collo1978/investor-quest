import { BEHAVIORAL_METRIC_CATALOG } from "@/platform/gamification/behavioralDesign/analytics/metricCatalog";
import type { BehavioralAnalyticsSnapshot, MetricValue } from "@/platform/gamification/behavioralDesign/analytics/types";

/** Simulated platform metrics until warehouse / Supabase aggregates connect. */
export function buildPlaceholderAnalyticsSnapshot(
  windowDays = 28
): BehavioralAnalyticsSnapshot {
  const simulated: Record<string, { value: number; previous?: number }> = {
    dau: { value: 1240, previous: 1180 },
    mau: { value: 4800, previous: 4650 },
    avg_session_depth_minutes: { value: 14.2, previous: 13.8 },
    return_frequency_7d: { value: 0.34, previous: 0.31 },
    d1_retention: { value: 0.52, previous: 0.48 },
    d7_retention: { value: 0.28, previous: 0.26 },
    churn_risk_score: { value: 0.22, previous: 0.24 },
    quest_completion_rate: { value: 0.61, previous: 0.58 },
    pillar_completion_rate: { value: 0.24, previous: 0.21 },
    onboarding_completion_rate: { value: 0.71, previous: 0.68 },
    xp_per_active_user: { value: 420, previous: 395 },
    quiz_pass_rate: { value: 0.74, previous: 0.72 },
    quiz_dropoff_rate: { value: 0.18, previous: 0.2 },
    card_read_completion: { value: 0.82, previous: 0.79 },
    companies_explored_per_user: { value: 2.4, previous: 2.1 },
    map_node_click_rate: { value: 0.67, previous: 0.64 },
    streak_adoption_rate: { value: 0.29, previous: 0.27 },
    streak_break_rate: { value: 0.41, previous: 0.43 },
    badge_unlock_velocity: { value: 12, previous: 11 },
    level_up_velocity: { value: 8, previous: 7 },
    financials_quest_friction_index: { value: 62, previous: 58 },
    cta_ignore_rate: { value: 0.23, previous: 0.25 }
  };

  const metrics: MetricValue[] = BEHAVIORAL_METRIC_CATALOG.map((def) => {
    const s = simulated[def.id];
    return {
      metricId: def.id,
      value: s?.value ?? null,
      previousValue: s?.previous ?? null,
      windowLabel: `Last ${windowDays} days`,
      status: "placeholder",
      sampledAt: new Date().toISOString()
    };
  });

  return {
    version: 1,
    scope: "platform",
    scopeId: null,
    windowDays,
    generatedAt: new Date().toISOString(),
    source: "placeholder",
    metrics,
    dataDisclaimer:
      "Simulated cohort metrics for architecture preview. Connect analytics warehouse to replace with live data."
  };
}

export function formatMetricValue(
  metricId: string,
  value: number | null
): string {
  if (value == null) return "—";
  const def = BEHAVIORAL_METRIC_CATALOG.find((m) => m.id === metricId);
  if (!def) return String(value);
  if (def.unit === "percent" || def.unit === "ratio") {
    return `${Math.round(value * (value <= 1 ? 100 : 1))}%`;
  }
  if (def.unit === "minutes") return `${value.toFixed(1)} min`;
  return String(Math.round(value));
}

export function metricTrend(
  current: number | null,
  previous: number | null | undefined
): "up" | "down" | "flat" | undefined {
  if (current == null || previous == null || previous === undefined) return undefined;
  const delta = current - previous;
  if (Math.abs(delta) < 0.01) return "flat";
  return delta > 0 ? "up" : "down";
}
