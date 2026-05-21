import type { QuestType } from "@/data/quests/types";

export const MANAGEMENT_HUB_ICON_GLYPHS: Record<string, string> = {
  leadership: "⌬",
  board: "◇",
  compensation: "◎",
  capital: "◈",
  governance: "⛨",
  strength: "▣",
  summary: "★",
  "board-leadership": "⌬",
  "executive-compensation": "◎",
  "capital-allocation": "◈",
  "governance-control": "⛨",
  "management-summary": "★",
  chart: "▤",
  snapshot: "◆"
};

export function resolveManagementHubIconGlyph(
  hubIcon: string | null | undefined,
  questType: QuestType
): string {
  if (hubIcon && MANAGEMENT_HUB_ICON_GLYPHS[hubIcon]) {
    return MANAGEMENT_HUB_ICON_GLYPHS[hubIcon]!;
  }
  return MANAGEMENT_HUB_ICON_GLYPHS[questType] ?? "⌬";
}
