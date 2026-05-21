import type { AnalyticsEventName } from "@/platform/types";

/** Canonical analytics event catalog — ingest layer maps raw events here */
export const ANALYTICS_EVENT_CATALOG: {
  name: AnalyticsEventName;
  description: string;
}[] = [
  { name: "login", description: "Authenticated session start" },
  {
    name: "session_active_daily",
    description: "User counted active for DAU"
  },
  {
    name: "session_active_monthly",
    description: "User counted active for MAU"
  },
  { name: "quest_started", description: "Quest flow opened" },
  { name: "quest_completed", description: "Quest marked complete" },
  { name: "xp_earned", description: "XP delta applied" },
  { name: "level_up", description: "Level band crossed" },
  { name: "badge_unlocked", description: "Badge awarded" },
  { name: "quiz_started", description: "Quiz session started" },
  { name: "quiz_completed", description: "Quiz submitted" },
  { name: "quiz_score", description: "Normalized quiz score captured" },
  { name: "company_researched", description: "Company context engaged" },
  { name: "sector_viewed", description: "Sector lens opened" },
  { name: "module_used", description: "Licensed module entry" },
  { name: "reward_unlocked", description: "Non-XP reward granted" },
  { name: "streak_tick", description: "Streak counter advanced" },
  {
    name: "retention_signal",
    description: "Heuristic churn / revive signal"
  },
  {
    name: "partner_engagement_pulse",
    description: "Org-level heartbeat for dashboards"
  }
];
