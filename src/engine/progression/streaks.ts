/**
 * Engine — calendar-day streaks (multiple independent tracks).
 *
 * `lastDay` is stored as YYYY-MM-DD (UTC date string from `todayYmd`).
 * `tickStreak` bumps +1 if today is the day after lastDay, resets to 1 if a
 * gap occurred, and is a no-op if lastDay already equals today.
 *
 * Kinds:
 * - `research` — campaign return / consistency (habit only; `tick-streak` +
 *   `research` — no XP).
 * - `quiz` — consecutive calendar days with at least one passed quiz
 *   (understanding); advanced only from quiz clears in the reducer, not via
 *   `tick-streak`.
 */

export type StreakState = {
  streak: number;
  lastDay: string | null; // YYYY-MM-DD
};

/** All streak channels saved per company (extend here for new tracks). */
export const STREAK_KINDS = ["research", "quiz"] as const;
export type StreakKind = (typeof STREAK_KINDS)[number];

export type CompanyStreaks = Record<StreakKind, StreakState>;

export function emptyStreaks(): CompanyStreaks {
  const empty: StreakState = { streak: 0, lastDay: null };
  return {
    research: { ...empty },
    quiz: { ...empty }
  };
}

/** Short labels for HUD / profile (full product copy lives in UI strings). */
export const STREAK_LABELS: Record<StreakKind, string> = {
  research: "Research consistency",
  quiz: "Quiz streak"
};

export function todayYmd(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function yesterdayYmd(date: Date = new Date()): string {
  const y = new Date(date);
  y.setDate(date.getDate() - 1);
  return y.toISOString().slice(0, 10);
}

export type StreakUpdate = {
  next: StreakState;
  /** `true` if the streak changed (UI cue for toast). */
  changed: boolean;
};

export function tickStreak(prev: StreakState, now: Date = new Date()): StreakUpdate {
  const today = todayYmd(now);
  const yesterday = yesterdayYmd(now);

  if (prev.lastDay === today) {
    return { next: prev, changed: false };
  }

  const nextStreak = prev.lastDay === yesterday ? prev.streak + 1 : 1;
  return {
    next: { streak: nextStreak, lastDay: today },
    changed: true
  };
}
