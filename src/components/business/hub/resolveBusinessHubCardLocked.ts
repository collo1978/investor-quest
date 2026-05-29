import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";

/** Same unlock rules as {@link SharedHubQuestMapCard} on the desktop scene. */
export function resolveBusinessHubCardLocked(
  card: BusinessHubQuestCard,
  hubProgressPct: number
): boolean {
  return card.locked || (hubProgressPct === 0 && card.orderNumber > 1);
}

export function pickBusinessHubCarouselIndex(
  cards: readonly BusinessHubQuestCard[],
  hubProgressPct: number
): number {
  const primary = cards.findIndex(
    (c) => !resolveBusinessHubCardLocked(c, hubProgressPct) && c.isPrimaryActive
  );
  if (primary >= 0) return primary;
  const firstOpen = cards.findIndex((c) => !resolveBusinessHubCardLocked(c, hubProgressPct));
  return firstOpen >= 0 ? firstOpen : 0;
}
