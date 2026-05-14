"use client";

/**
 * Typed React hooks layered on top of `useGame()` + engine selectors.
 *
 * Components should prefer these focused hooks (e.g. `useIslandViews()`)
 * over reaching into `useGame().raw` everywhere — it keeps re-render
 * scope small and makes intent explicit.
 *
 * All hooks are pure derivations of the canonical engine state held by
 * `GameProvider`.
 */

import { useMemo } from "react";
import { useGame } from "@/components/GameProvider";
import { type CompanyId, companyById } from "@/data/companies";
import { type PillarId } from "@/data/pillars";
import { findQuestDefinition } from "@/data/quests/library";
import {
  getActiveCompanyProgress,
  getActiveQuestPointer,
  getCampaignViews,
  getCompletedQuestCount,
  getIslandViews,
  getLevelProgress,
  getNextPillarUnlock,
  getPillarQuestViews,
  getPillarReadingProgress,
  getPillarViews,
  getQuestProgressPct,
  getReadingProgress,
  getResumeTarget,
  getUnlockedIslandCount,
  isAllPillarsCompleteFor,
  isCompanyUnlocked,
  isQuestRead,
  levelProgress as levelProgressForXp,
  type ActiveQuestPointer,
  type CampaignView,
  type IslandView,
  type LevelProgress,
  type PillarView,
  type QuestView,
  type ReadingProgress
} from "@/engine";

/** Current player progress for the active company. */
export function useActiveProgress() {
  const { raw } = useGame();
  return useMemo(() => getActiveCompanyProgress(raw), [raw]);
}

/** Level / XP progress for the active company. */
export function useLevelProgress(): LevelProgress {
  const { raw } = useGame();
  return useMemo(() => getLevelProgress(raw), [raw]);
}

/** Direct XP value (for HUD-style readouts). */
export function useXp(): { xp: number; level: number } {
  const { state } = useGame();
  return { xp: state.xp, level: state.level };
}

/** Pillar view rows (locked/unlocked + completion %). */
export function usePillarViews(): PillarView[] {
  const { raw } = useGame();
  return useMemo(() => getPillarViews(raw), [raw]);
}

/** Full island view-model for the WorldMap (metadata + progression). */
export function useIslandViews(): IslandView[] {
  const { raw } = useGame();
  return useMemo(() => getIslandViews(raw), [raw]);
}

/** Quest views for a single pillar. */
export function usePillarQuestViews(pillarId: PillarId): QuestView[] {
  const { raw } = useGame();
  return useMemo(() => getPillarQuestViews(raw, pillarId), [raw, pillarId]);
}

/** Single quest view (engine-derived completion + unlock + work). */
export function useQuestView(pillarId: PillarId, slug: string): QuestView | null {
  const views = usePillarQuestViews(pillarId);
  return useMemo(
    () => views.find((v) => v.quest.slug === slug) ?? null,
    [views, slug]
  );
}

/** Quest progress % (0..100), honoring the quest's completion rule. */
export function useQuestProgressPct(
  pillarId: PillarId,
  slug: string
): number {
  const view = useQuestView(pillarId, slug);
  return useMemo(() => getQuestProgressPct(view), [view]);
}

/** Pointer to the currently active quest (per the active company). */
export function useActiveQuest(): ActiveQuestPointer {
  const { raw } = useGame();
  return useMemo(() => getActiveQuestPointer(raw), [raw]);
}

/** Research consistency streak (calendar returns — habit / badges only, no XP). */
export function useStreak(): { streak: number; lastDay: string | null } {
  const { state } = useGame();
  return state.streaks.research;
}

/** All calendar streak channels for the active company. */
export function useStreaks() {
  const { state } = useGame();
  return state.streaks;
}

/** Badges earned for the active company. */
export function useBadges() {
  const { state } = useGame();
  return state.badges;
}

/** Count of completed quests across all pillars for the active company. */
export function useCompletedQuestCount(): number {
  const { raw } = useGame();
  return useMemo(() => getCompletedQuestCount(raw), [raw]);
}

/** Count of unlocked pillars (islands) for the active company. */
export function useUnlockedIslandCount(): number {
  const { raw } = useGame();
  return useMemo(() => getUnlockedIslandCount(raw), [raw]);
}

/** Is the active company's thesis fully assembled? */
export function useAllPillarsComplete(): boolean {
  const { raw } = useGame();
  return useMemo(() => isAllPillarsCompleteFor(raw), [raw]);
}

/** The next pillar that would be unlockable, or null. */
export function useNextPillarUnlock(): PillarId | null {
  const { raw } = useGame();
  return useMemo(() => getNextPillarUnlock(raw), [raw]);
}

/** Resume helper: which (pillarId, slug) the player should jump back into. */
export function useResumeTarget() {
  const { raw } = useGame();
  return useMemo(() => getResumeTarget(raw), [raw]);
}

/** Top-level campaigns (companies) with locked/unlocked + activity summary. */
export function useCampaignViews(): CampaignView[] {
  const { raw } = useGame();
  return useMemo(() => getCampaignViews(raw), [raw]);
}

/** Whether a specific company is currently unlocked. */
export function useIsCompanyUnlocked(companyId: CompanyId): boolean {
  const { raw } = useGame();
  return useMemo(() => isCompanyUnlocked(raw, companyId), [raw, companyId]);
}

/** Active company metadata (name, ticker, tagline). */
export function useActiveCompany() {
  const { state } = useGame();
  return useMemo(() => companyById(state.activeCompanyId), [state.activeCompanyId]);
}

// ---------------------------------------------------------------------------
// Reading progress hooks ("Mark as Read" tracking — no XP).
// ---------------------------------------------------------------------------

/** Whether a specific quest's content card has been marked as read. */
export function useIsQuestRead(pillarId: PillarId, slug: string): boolean {
  const { raw } = useGame();
  return useMemo(() => isQuestRead(raw, pillarId, slug), [raw, pillarId, slug]);
}

/** Reading progress (read / total / pct) for a single pillar. */
export function usePillarReadingProgress(pillarId: PillarId): ReadingProgress {
  const { raw } = useGame();
  return useMemo(
    () => getPillarReadingProgress(raw, pillarId),
    [raw, pillarId]
  );
}

/** Reading progress (read / total / pct) across all pillars. */
export function useReadingProgress(): ReadingProgress {
  const { raw } = useGame();
  return useMemo(() => getReadingProgress(raw), [raw]);
}

// Re-export the engine-level XP curve for components that want to
// preview levels without subscribing to context.
export { levelProgressForXp };
// Re-export quest lookup so non-engine consumers can find a definition.
export { findQuestDefinition };
