/**
 * Quest marker anchors on the zoomed Business Island — viewport % on grass only.
 * Avoids the HQ building cluster (~46–58% × ~30–44%).
 */
export type BusinessIslandQuestMarkerSlot = {
  orderNumber: number;
  left: string;
  top: string;
};

export const BUSINESS_ISLAND_QUEST_MARKER_SLOTS: readonly BusinessIslandQuestMarkerSlot[] =
  [
    { orderNumber: 1, left: "33%", top: "52%" },
    { orderNumber: 2, left: "26%", top: "63%" },
    { orderNumber: 3, left: "70%", top: "54%" },
    { orderNumber: 4, left: "67%", top: "67%" },
    { orderNumber: 5, left: "30%", top: "72%" },
    { orderNumber: 6, left: "56%", top: "74%" },
    { orderNumber: 7, left: "62%", top: "78%" }
  ] as const;

export const BUSINESS_ISLAND_QUEST_MARKER_SLOTS_MOBILE: readonly BusinessIslandQuestMarkerSlot[] =
  [
    { orderNumber: 1, left: "32%", top: "50%" },
    { orderNumber: 2, left: "24%", top: "60%" },
    { orderNumber: 3, left: "72%", top: "52%" },
    { orderNumber: 4, left: "68%", top: "64%" },
    { orderNumber: 5, left: "28%", top: "68%" },
    { orderNumber: 6, left: "54%", top: "70%" },
    { orderNumber: 7, left: "60%", top: "74%" }
  ] as const;

export function resolveBusinessIslandQuestMarkerSlot(
  orderNumber: number,
  mobile = false
): BusinessIslandQuestMarkerSlot | undefined {
  const slots = mobile
    ? BUSINESS_ISLAND_QUEST_MARKER_SLOTS_MOBILE
    : BUSINESS_ISLAND_QUEST_MARKER_SLOTS;
  return slots.find((slot) => slot.orderNumber === orderNumber);
}
