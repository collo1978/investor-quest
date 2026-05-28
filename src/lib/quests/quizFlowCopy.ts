/**
 * Unified player-facing quiz flow copy — all pillars and quest shells.
 *
 * Flow: Read cards → island-style checkpoint → quiz → XP/progress
 * Island-specific unlock/intro/CTA: `@/lib/quests/islandQuizStyle` (rules brain).
 * (Island conviction pulse is a separate map feature — not quiz CTA copy.)
 */

import {
  CONTINUE_LABEL,
  START_QUIZ_LABEL
} from "@/lib/quests/gameActionCopy";

/** Primary CTA to begin the section quiz. */
export const START_QUIZ_CTA = START_QUIZ_LABEL;

/** After all cards are read — opens the section summary before the quiz. */
export const CONTINUE_TO_QUIZ_SUMMARY_CTA = CONTINUE_LABEL;

/** @deprecated Use `islandQuizUnlockedHeadline(pillarId)` from islandQuizStyle. */
export const QUIZ_UNLOCKED_HEADLINE = "Quiz Unlocked";

/** @deprecated Use `islandQuizReadyIntro(pillarId, required, total)` from islandQuizStyle. */
export function quizReadyIntro(requiredCorrect: number, total: number): string {
  return `Quick challenge — get ${requiredCorrect} of ${total} right to earn XP and keep moving on the trail.`;
}
export const QUIZ_PAGER_READY_LABEL = START_QUIZ_CTA;

export const QUIZ_PAGER_READY_TOOLTIP =
  "Test your understanding — open the quiz";

export function quizPagerLockTooltip(missingCardCount: number): string {
  return missingCardCount > 0
    ? `Mark ${missingCardCount} more card${missingCardCount === 1 ? "" : "s"} as read to unlock the quiz`
    : "Complete all cards to unlock the quiz";
}
