import type { QuestType } from "@/data/quests/types";

export const FINANCIALS_HUB_ICON_GLYPHS: Record<string, string> = {
  growth: "↗",
  profitability: "◎",
  expenses: "⊟",
  cash: "◈",
  "financial-strength": "⛨",
  strength: "⛨",
  vault: "▣",
  chart: "▤",
  revenue: "◎",
  valuation: "◇",
  snapshot: "◆"
};

export function resolveFinancialsHubIconGlyph(
  hubIcon: string | null | undefined,
  questType: QuestType
): string {
  if (hubIcon && FINANCIALS_HUB_ICON_GLYPHS[hubIcon]) {
    return FINANCIALS_HUB_ICON_GLYPHS[hubIcon]!;
  }
  return FINANCIALS_HUB_ICON_GLYPHS[questType] ?? "◆";
}
