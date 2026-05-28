import type { BehavioralMetricCategory, BehavioralMetricDefinition } from "@/platform/gamification/behavioralDesign/analytics/types";

/**
 * Canonical metric catalog — ingest layer maps raw events / DB aggregates here.
 * Framework bindings reference these ids only (never ad-hoc strings in UI).
 */
export const BEHAVIORAL_METRIC_CATALOG: BehavioralMetricDefinition[] = [
  // —— Engagement ——
  {
    id: "dau",
    label: "Daily active users",
    category: "engagement",
    unit: "count",
    description: "Unique users with session_active_daily in window.",
    analyticsEvent: "session_active_daily",
    aggregation: "count_distinct_users",
    status: "placeholder"
  },
  {
    id: "mau",
    label: "Monthly active users",
    category: "engagement",
    unit: "count",
    description: "Unique users with session_active_monthly in window.",
    analyticsEvent: "session_active_monthly",
    aggregation: "count_distinct_users",
    status: "placeholder"
  },
  {
    id: "avg_session_depth_minutes",
    label: "Avg session depth",
    category: "engagement",
    unit: "minutes",
    description: "Mean active minutes per session.",
    aggregation: "avg",
    status: "placeholder"
  },
  {
    id: "return_frequency_7d",
    label: "Return frequency (7d)",
    category: "engagement",
    unit: "ratio",
    description: "Share of users with 2+ sessions in 7 days.",
    aggregation: "ratio",
    status: "placeholder"
  },

  // —— Retention ——
  {
    id: "d1_retention",
    label: "Day-1 retention",
    category: "retention",
    unit: "percent",
    description: "Users returning day after first session.",
    analyticsEvent: "retention_signal",
    aggregation: "cohort_ratio",
    status: "placeholder"
  },
  {
    id: "d7_retention",
    label: "Day-7 retention",
    category: "retention",
    unit: "percent",
    description: "Users active 7 days after first session.",
    aggregation: "cohort_ratio",
    status: "placeholder"
  },
  {
    id: "churn_risk_score",
    label: "Churn risk index",
    category: "retention",
    unit: "score",
    description: "Heuristic churn signal from retention_signal events.",
    analyticsEvent: "retention_signal",
    aggregation: "avg",
    status: "placeholder"
  },

  // —— Progression ——
  {
    id: "quest_completion_rate",
    label: "Quest completion rate",
    category: "progression",
    unit: "percent",
    description: "completed / started quests.",
    analyticsEvent: "quest_completed",
    aggregation: "ratio",
    status: "placeholder"
  },
  {
    id: "pillar_completion_rate",
    label: "Pillar completion rate",
    category: "progression",
    unit: "percent",
    description: "Users completing at least one full pillar.",
    aggregation: "ratio",
    status: "placeholder"
  },
  {
    id: "onboarding_completion_rate",
    label: "Onboarding completion",
    category: "progression",
    unit: "percent",
    description: "Users finishing onboarding funnel.",
    aggregation: "ratio",
    status: "placeholder"
  },
  {
    id: "xp_per_active_user",
    label: "XP per active user",
    category: "progression",
    unit: "count",
    description: "Mean XP earned per DAU.",
    analyticsEvent: "xp_earned",
    aggregation: "avg_per_user",
    status: "placeholder"
  },

  // —— Quest & quiz ——
  {
    id: "quiz_pass_rate",
    label: "Quiz pass rate",
    category: "quiz_performance",
    unit: "percent",
    description: "Quizzes passed on first or second attempt.",
    analyticsEvent: "quiz_completed",
    aggregation: "ratio",
    status: "placeholder"
  },
  {
    id: "quiz_dropoff_rate",
    label: "Quiz drop-off rate",
    category: "quiz_performance",
    unit: "percent",
    description: "quiz_started without quiz_completed.",
    aggregation: "ratio",
    status: "placeholder"
  },
  {
    id: "card_read_completion",
    label: "Card read completion",
    category: "quest_flow",
    unit: "percent",
    description: "Cards marked read vs cards shown.",
    aggregation: "ratio",
    status: "placeholder"
  },

  // —— Exploration ——
  {
    id: "companies_explored_per_user",
    label: "Companies explored",
    category: "exploration",
    unit: "count",
    description: "Distinct companies researched per active user.",
    analyticsEvent: "company_researched",
    aggregation: "avg_per_user",
    status: "placeholder"
  },
  {
    id: "map_node_click_rate",
    label: "Map node engagement",
    category: "exploration",
    unit: "percent",
    description: "Map opens leading to quest starts.",
    aggregation: "ratio",
    status: "placeholder"
  },

  // —— Streaks & habits ——
  {
    id: "streak_adoption_rate",
    label: "Streak adoption",
    category: "streaks",
    unit: "percent",
    description: "Active users with streak_tick in last 14d.",
    analyticsEvent: "streak_tick",
    aggregation: "ratio",
    status: "placeholder"
  },
  {
    id: "streak_break_rate",
    label: "Streak break rate",
    category: "streaks",
    unit: "percent",
    description: "Users losing streak after 3+ days.",
    aggregation: "ratio",
    status: "placeholder"
  },

  // —— Motivation proxies ——
  {
    id: "badge_unlock_velocity",
    label: "Badge unlock velocity",
    category: "motivation",
    unit: "count",
    description: "Badges per 100 active users per week.",
    analyticsEvent: "badge_unlocked",
    aggregation: "rate",
    status: "placeholder"
  },
  {
    id: "level_up_velocity",
    label: "Level-up velocity",
    category: "motivation",
    unit: "count",
    description: "Level-ups per 100 active users per week.",
    analyticsEvent: "level_up",
    aggregation: "rate",
    status: "placeholder"
  },
  {
    id: "financials_quest_friction_index",
    label: "Financials friction index",
    category: "friction",
    unit: "score",
    description: "Drop-off + time-on-task composite for financials pillar.",
    aggregation: "composite",
    status: "placeholder"
  },
  {
    id: "cta_ignore_rate",
    label: "Primary CTA ignore rate",
    category: "friction",
    unit: "percent",
    description: "Sessions with no quest start after map view.",
    aggregation: "ratio",
    status: "placeholder"
  }
];

export const METRIC_BY_ID = Object.fromEntries(
  BEHAVIORAL_METRIC_CATALOG.map((m) => [m.id, m])
) as Record<string, BehavioralMetricDefinition>;

export const METRICS_BY_CATEGORY = BEHAVIORAL_METRIC_CATALOG.reduce(
  (acc, m) => {
    const list = acc[m.category] ?? [];
    list.push(m);
    acc[m.category] = list;
    return acc;
  },
  {} as Record<BehavioralMetricCategory, BehavioralMetricDefinition[]>
);
