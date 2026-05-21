import type { HubQuestVisualState } from "@/lib/quests/resolveHubVisualState";

export type HubCardPrimaryPick = {
  locked: boolean;
  visualState: HubQuestVisualState;
  orderNumber: number;
};

/** Marks the lowest-order unlocked, in-progress hub slot as the “do this next” card. */
export function assignHubPrimaryActive<T extends HubCardPrimaryPick>(
  cards: readonly T[]
): T[] {
  const primary = cards
    .filter((c) => !c.locked && c.visualState === "active")
    .sort((a, b) => a.orderNumber - b.orderNumber)[0];

  if (!primary) return [...cards];

  return cards.map((c) => ({
    ...c,
    isPrimaryActive: !c.locked && c.orderNumber === primary.orderNumber
  })) as T[];
}
