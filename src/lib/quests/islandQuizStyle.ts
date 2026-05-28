/**
 * Island-adaptive quiz UI copy — checkpoints feel different per pillar/section.
 *
 * Flow (unchanged): learn cards → island-style interaction → quiz → XP/progress
 * Source of truth: `ISLAND_QUIZ_RULES` + `BUSINESS_SECTION_QUIZ_RULES`
 */
import type { PillarId } from "@/data/pillars";
import { getQuestQuizRule } from "@/data/contentRules";

function ruleFor(pillarId: PillarId, questSlug?: string) {
  return getQuestQuizRule(pillarId, questSlug);
}

export function islandQuizUnlockedHeadline(
  pillarId: PillarId,
  questSlug?: string
): string {
  return ruleFor(pillarId, questSlug).unlockedHeadline;
}

export function islandQuizReadyIntro(
  pillarId: PillarId,
  requiredCorrect: number,
  total: number,
  questSlug?: string
): string {
  return ruleFor(pillarId, questSlug).readyIntro(requiredCorrect, total);
}

/** Section title + checkpoint kind, e.g. "Revenue · Health check". */
export function islandQuizSectionTitle(
  pillarId: PillarId,
  sectionType?: string,
  questSlug?: string
): string {
  const rule = ruleFor(pillarId, questSlug);
  const type = sectionType?.trim();
  if (!type || type.toLowerCase() === "quiz") return rule.quizKind;
  const head = type.charAt(0).toUpperCase() + type.slice(1);
  return `${head} · ${rule.quizKind}`;
}

export function islandQuizStartCta(
  pillarId: PillarId,
  questSlug?: string
): string {
  return ruleFor(pillarId, questSlug).startCta;
}

export function islandQuizLockedHint(
  pillarId: PillarId,
  questSlug?: string
): string {
  return ruleFor(pillarId, questSlug).lockedHint;
}

export function islandQuizDefaultPassMessage(
  pillarId: PillarId,
  questSlug?: string
): string {
  return ruleFor(pillarId, questSlug).defaultPassMessage;
}

export function islandQuizPlayingFeedback(
  pillarId: PillarId,
  questSlug?: string
): {
  prompt: string;
  correct: string;
  wrong: string;
} {
  return ruleFor(pillarId, questSlug).playingFeedback;
}

/** Status chip on the quiz panel header. */
export function islandQuizStatusLabel(
  pillarId: PillarId,
  phase: "locked" | "ready" | "playing" | "passed" | "failed",
  questSlug?: string
): string {
  const kind = ruleFor(pillarId, questSlug).quizKind;
  switch (phase) {
    case "locked":
      return "Locked";
    case "ready":
      return "Ready";
    case "playing":
      return "In progress";
    case "passed":
      return `${kind} passed`;
    case "failed":
      return "Try again";
    default:
      return "Ready";
  }
}
