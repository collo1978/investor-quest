/** Canonical user activity events — maps to `user_activity_events.event_type`. */
export const USER_ACTIVITY_EVENT_TYPES = [
  "user_started_quest",
  "user_opened_card",
  "user_marked_card_read",
  "user_unlocked_quest",
  "user_completed_pillar",
  "user_completed_quiz",
  "user_earned_xp",
  "user_earned_badge",
  "user_completed_company_report",
  "user_updated_conviction"
] as const;

export type UserActivityEventType = (typeof USER_ACTIVITY_EVENT_TYPES)[number];

export function isUserActivityEventType(
  value: string
): value is UserActivityEventType {
  return (USER_ACTIVITY_EVENT_TYPES as readonly string[]).includes(value);
}

export const EVENT_TYPE_ICONS: Record<UserActivityEventType, string> = {
  user_started_quest: "🚀",
  user_opened_card: "📖",
  user_marked_card_read: "✅",
  user_unlocked_quest: "🔓",
  user_completed_pillar: "🏛️",
  user_completed_quiz: "🧠",
  user_earned_xp: "⚡",
  user_earned_badge: "🛡️",
  user_completed_company_report: "🏆",
  user_updated_conviction: "🎯"
};

export const EVENT_TYPE_LABELS: Record<UserActivityEventType, string> = {
  user_started_quest: "Quest started",
  user_opened_card: "Card opened",
  user_marked_card_read: "Card marked read",
  user_unlocked_quest: "Quest unlocked",
  user_completed_pillar: "Pillar completed",
  user_completed_quiz: "Quiz completed",
  user_earned_xp: "XP earned",
  user_earned_badge: "Badge earned",
  user_completed_company_report: "Company report completed",
  user_updated_conviction: "Conviction updated"
};

/** Future tier tags — stored in metadata for partner packaging. */
export type AnalyticsTierTag = "basic" | "pro" | "enterprise";
