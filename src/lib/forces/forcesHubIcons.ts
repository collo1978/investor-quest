export const FORCES_HUB_ICON_GLYPHS: Record<string, string> = {
  "positive-inside": "⚡",
  "positive-outside": "↗",
  "negative-inside": "⚠",
  "negative-outside": "☄",
  launch: "🚀",
  lightning: "⚡",
  rocket: "▲",
  inside: "◎",
  outside: "✦",
  risk: "⚠",
  industry: "↗"
};

export function resolveForcesHubIconGlyph(
  hubIcon: string | null | undefined,
  categoryId: string | null | undefined
): string {
  if (hubIcon && FORCES_HUB_ICON_GLYPHS[hubIcon]) {
    return FORCES_HUB_ICON_GLYPHS[hubIcon]!;
  }
  if (categoryId && FORCES_HUB_ICON_GLYPHS[categoryId]) {
    return FORCES_HUB_ICON_GLYPHS[categoryId]!;
  }
  return "⚡";
}
