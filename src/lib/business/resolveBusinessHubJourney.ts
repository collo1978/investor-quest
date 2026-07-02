import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";

export type BusinessHubJourney = {
  current: BusinessHubQuestCard;
  /** Most recently completed quest — shown as a compact recap. */
  previous: BusinessHubQuestCard | null;
  /** Next quest in the chain — locked preview when not yet unlocked. */
  next: BusinessHubQuestCard | null;
};

/**
 * Resolve the learner's current Business Island focus — not the full quest roster.
 */
export function resolveBusinessHubJourney(
  cards: readonly BusinessHubQuestCard[]
): BusinessHubJourney {
  const sorted = [...cards].sort((a, b) => a.orderNumber - b.orderNumber);
  if (sorted.length === 0) {
    throw new Error("Business hub requires at least one quest card");
  }

  const current =
    sorted.find((c) => c.isPrimaryActive && !c.completed) ??
    sorted.find((c) => !c.completed && !c.locked) ??
    sorted.find((c) => !c.completed) ??
    sorted[sorted.length - 1];

  const idx = sorted.findIndex((c) => c.slug === current.slug);
  const prior = idx > 0 ? sorted[idx - 1]! : null;
  const previous = prior?.completed ? prior : null;
  const next = idx < sorted.length - 1 ? sorted[idx + 1]! : null;

  return { current, previous, next };
}
