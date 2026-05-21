import type { QuestType } from "@/data/quests/types";

/** Map icon keys (Supabase `hub_icon`) to display glyphs. */
export const BUSINESS_HUB_ICON_GLYPHS: Record<string, string> = {
  snapshot: "◆",
  revenue: "◎",
  operations: "⚙",
  advantage: "★",
  industry: "▣",
  compass: "◇",
  coins: "◈",
  gears: "⚙",
  shield: "⛨",
  chart: "▤"
};

export function resolveHubIconGlyph(
  hubIcon: string | null | undefined,
  questType: QuestType
): string {
  if (hubIcon && BUSINESS_HUB_ICON_GLYPHS[hubIcon]) {
    return BUSINESS_HUB_ICON_GLYPHS[hubIcon]!;
  }
  return BUSINESS_HUB_ICON_GLYPHS[questType] ?? "◆";
}
