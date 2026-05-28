import type { PillarId } from "@/data/pillars";
import { CONTROLLED_DEMO_MODE } from "@/lib/demo/controlledDemo";

/** Islands clickable on `/map` without clearing the prior pillar in order. */
export const QUEST_MAP_DEFAULT_UNLOCKED: readonly PillarId[] =
  CONTROLLED_DEMO_MODE
    ? ["business", "financials", "forces", "management"]
    : ["business", "financials"];

export function isQuestMapDefaultUnlocked(pillarId: PillarId): boolean {
  return QUEST_MAP_DEFAULT_UNLOCKED.includes(pillarId);
}
