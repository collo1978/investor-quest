/**
 * Engine — badge definitions and awarding rules.
 *
 * Badges are earned milestones (separate from level / XP).
 */

import type { PillarId } from "@/data/pillars";

export type BadgeId =
  | "first-quest"
  | "first-pillar"
  | "all-pillars"
  | "streak-3"
  | "streak-7"
  | "quiz-streak-3"
  | "quiz-streak-7"
  | "quiz-streak-30"
  | "quiz-pass"
  | "company-overview-complete"
  | "evidence-collector"
  | "investor-checklist-complete"
  | "level-5"
  | "level-10"
  | "ten-k-rookie";

export type BadgeDef = {
  id: BadgeId;
  title: string;
  detail: string;
};

export const BADGES: Record<BadgeId, BadgeDef> = {
  "first-quest": {
    id: "first-quest",
    title: "First step",
    detail: "Completed your first quest."
  },
  "first-pillar": {
    id: "first-pillar",
    title: "Pillar cleared",
    detail: "Finished every quest in a pillar."
  },
  "all-pillars": {
    id: "all-pillars",
    title: "Full thesis",
    detail: "Cleared all four pillars for a single company."
  },
  "streak-3": {
    id: "streak-3",
    title: "Consistency — 3 days",
    detail: "Returned to the campaign 3 days in a row (habit signal)."
  },
  "streak-7": {
    id: "streak-7",
    title: "Consistency — 7 days",
    detail: "A full week of campaign presence (habit signal)."
  },
  "quiz-streak-3": {
    id: "quiz-streak-3",
    title: "Understanding — 3-day quiz streak",
    detail: "Passed at least one quiz on 3 consecutive calendar days."
  },
  "quiz-streak-7": {
    id: "quiz-streak-7",
    title: "Understanding — 7-day quiz streak",
    detail: "Seven straight days of proven quiz mastery."
  },
  "quiz-streak-30": {
    id: "quiz-streak-30",
    title: "Understanding — 30-day quiz streak",
    detail: "A month of daily proof — Investor Quest rewards understanding."
  },
  "quiz-pass": {
    id: "quiz-pass",
    title: "First Quiz Passed",
    detail: "Passed your first quest quiz."
  },
  "company-overview-complete": {
    id: "company-overview-complete",
    title: "Company Overview Complete",
    detail: "Finished the Company Overview checklist section and quiz."
  },
  "evidence-collector": {
    id: "evidence-collector",
    title: "Evidence Collector",
    detail: "Collected and rated every evidence card for an Investor Principle."
  },
  "investor-checklist-complete": {
    id: "investor-checklist-complete",
    title: "Investor Checklist Complete",
    detail: "Passed every Business Investor Checklist section quiz for a company."
  },
  "level-5": { id: "level-5", title: "Level 5", detail: "Reached level 5." },
  "level-10": {
    id: "level-10",
    title: "Level 10",
    detail: "Reached level 10."
  },
  "ten-k-rookie": {
    id: "ten-k-rookie",
    title: "10-K Rookie",
    detail: "Cleared the full-map final challenge — Business, Forces, Financials, and Management."
  }
};

export type AwardedBadge = {
  id: BadgeId;
  awardedAt: number;
};

/** Pure: returns new badges to award given a state delta. */
export function detectNewBadges(input: {
  alreadyEarned: BadgeId[];
  completedQuestsTotal: number;
  pillarJustCompleted?: PillarId | null;
  allPillarsCompleted?: boolean;
  newLevel?: number;
  /** Research consistency streak (calendar days). */
  newStreak?: number;
  /** Quiz streak — consecutive days with ≥1 passed quiz. */
  newQuizStreak?: number;
  quizPassed?: boolean;
  tenKChallengePassed?: boolean;
}): BadgeId[] {
  const earned = new Set(input.alreadyEarned);
  const out: BadgeId[] = [];

  function maybe(id: BadgeId) {
    if (!earned.has(id)) {
      out.push(id);
      earned.add(id);
    }
  }

  if (input.completedQuestsTotal >= 1) maybe("first-quest");
  if (input.pillarJustCompleted) maybe("first-pillar");
  if (input.allPillarsCompleted) maybe("all-pillars");
  if ((input.newStreak ?? 0) >= 3) maybe("streak-3");
  if ((input.newStreak ?? 0) >= 7) maybe("streak-7");
  if ((input.newQuizStreak ?? 0) >= 3) maybe("quiz-streak-3");
  if ((input.newQuizStreak ?? 0) >= 7) maybe("quiz-streak-7");
  if ((input.newQuizStreak ?? 0) >= 30) maybe("quiz-streak-30");
  if (input.quizPassed) maybe("quiz-pass");
  if ((input.newLevel ?? 0) >= 5) maybe("level-5");
  if ((input.newLevel ?? 0) >= 10) maybe("level-10");
  if (input.tenKChallengePassed) maybe("ten-k-rookie");

  return out;
}
