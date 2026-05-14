/**
 * Legacy compatibility shim.
 *
 * The canonical engine lives under `@/engine`. This file re-exports the
 * subset of the engine API that older modules already import from
 * `@/lib/gameState`. New code should import from `@/engine` directly.
 */

import { DEFAULT_COMPANY_ID } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import { findQuestDefinition } from "@/data/quests/library";
import {
  applyPillarUnlock,
  isPillarComplete as enginePillarComplete,
  nextUnlockablePillar,
  type CompanyProgress
} from "@/engine";

export type {
  GameState,
  CompanyProgress,
  PillarState,
  QuestWork,
  OnboardingState,
  QuizProgress,
  BoardProgress,
  TerminalProgress,
  LevelProgress,
  BadgeId,
  BadgeDef
} from "@/engine";

export {
  STATE_VERSION,
  STORAGE_KEY,
  computeLevel,
  levelBand,
  levelProgress,
  initialState,
  initialCompanyProgress,
  emptyPillarStates,
  questWorkKey,
  loadState,
  saveState,
  clearSavedState,
  BADGES,
  detectNewBadges,
  todayYmd,
  yesterdayYmd,
  tickStreak,
  pillarCompletionPct,
  allPillarsComplete,
  reduce,
  type GameAction,
  type RewardEvent,
  type ReduceResult
} from "@/engine";

/** Legacy adapter — accepts a `CompanyProgress` rather than a pillarStates map. */
export function isPillarComplete(
  progress: CompanyProgress,
  pillarId: PillarId
): boolean {
  return enginePillarComplete(progress.pillars, pillarId);
}

/** Legacy adapter — returns a new progress with the next pillar unlocked, if any. */
export function unlockNextPillar(
  progress: CompanyProgress,
  completedPillar: PillarId
): CompanyProgress {
  const next = nextUnlockablePillar(progress.pillars, completedPillar);
  if (!next) return progress;
  return { ...progress, pillars: applyPillarUnlock(progress.pillars, next) };
}

/**
 * Legacy adapter for `questXp(pillarId, slug)`.
 * Resolves against the default company; new code should look up by
 * `findQuestDefinition(companyId, pillarId, slug)`.
 */
export function questXp(pillarId: PillarId, slug: string): number {
  const q = findQuestDefinition(DEFAULT_COMPANY_ID, pillarId, slug);
  return q?.rewardXp ?? 0;
}
