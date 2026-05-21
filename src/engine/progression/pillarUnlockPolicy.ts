import type { PillarId } from "@/data/pillars";

/** Islands clickable on `/map` without clearing the prior pillar in order. */
export const QUEST_MAP_DEFAULT_UNLOCKED: readonly PillarId[] = [
  "business",
  "financials"
];

export function isQuestMapDefaultUnlocked(pillarId: PillarId): boolean {
  return QUEST_MAP_DEFAULT_UNLOCKED.includes(pillarId);
}
