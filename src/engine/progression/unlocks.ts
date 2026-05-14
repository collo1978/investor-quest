/**
 * Engine — pillar/island unlock rules.
 *
 * Islands = pillars on the WorldMap. When every quest in a pillar is
 * complete, the next pillar in PILLAR_ORDER is unlocked.
 */

import { PILLAR_ORDER, type PillarId } from "@/data/pillars";
import { pillarQuestCount } from "@/data/quests/library";
import type { PillarState } from "@/engine/progression/state";

export function isPillarComplete(
  pillarStates: Record<PillarId, PillarState>,
  pillarId: PillarId
): boolean {
  const ps = pillarStates[pillarId];
  if (!ps) return false;
  const total = pillarQuestCount(pillarId);
  return total > 0 && ps.completedQuestSlugs.length >= total;
}

export function allPillarsComplete(
  pillarStates: Record<PillarId, PillarState>
): boolean {
  return PILLAR_ORDER.every((pid) => isPillarComplete(pillarStates, pid));
}

export function pillarCompletionPct(
  pillarStates: Record<PillarId, PillarState>,
  pillarId: PillarId
): number {
  const ps = pillarStates[pillarId];
  if (!ps) return 0;
  const total = pillarQuestCount(pillarId);
  if (total <= 0) return 0;
  return Math.max(
    0,
    Math.min(100, (ps.completedQuestSlugs.length / total) * 100)
  );
}

/**
 * Pure: returns the next pillar that should be newly unlocked when
 * `completedPillar` has just been finished. `null` if nothing to unlock.
 */
export function nextUnlockablePillar(
  pillarStates: Record<PillarId, PillarState>,
  completedPillar: PillarId
): PillarId | null {
  const idx = PILLAR_ORDER.indexOf(completedPillar);
  if (idx < 0) return null;
  const next = PILLAR_ORDER[idx + 1];
  if (!next) return null;
  if (pillarStates[next]?.unlocked) return null;
  return next;
}

export function applyPillarUnlock(
  pillarStates: Record<PillarId, PillarState>,
  pillarId: PillarId
): Record<PillarId, PillarState> {
  return {
    ...pillarStates,
    [pillarId]: {
      ...pillarStates[pillarId],
      unlocked: true,
      unlockedAt: pillarStates[pillarId]?.unlockedAt ?? Date.now()
    }
  };
}
