import type { PillarId } from "@/data/pillars";

/** Demo / schools / bank desktop map — Business island only. */
export function isQuestMapBusinessOnlyPlayable(
  pillarId: PillarId,
  _engineUnlocked: boolean
): boolean {
  return pillarId === "business";
}
