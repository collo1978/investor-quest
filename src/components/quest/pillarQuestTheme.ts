import type { PillarId } from "@/data/pillars";

import { FINANCIALS_ISLAND } from "@/components/quest/financialsIslandColors";
import { FORCES_ISLAND } from "@/components/quest/forcesIslandColors";

/** Premium Q/A quest card + island reading chrome per pillar. */
export type PillarQuestTheme = {
  hi: string;
  lo: string;
  light?: string;
  glow: string;
  glowSoft: string;
  border: string;
  borderSoft: string;
  rim: string;
  whyHi: string;
  whyGlow: string;
  whyWash: string;
  badgeText: string;
  markReadPulse: string;
  /** Single-hue neon rim (financials artwork) vs jewel multi-stop (business). */
  cardChrome?: "neon" | "jewel";
};

const BUSINESS_THEME: PillarQuestTheme = {
  hi: "#F5C547",
  lo: "#E6A92F",
  glow: "rgba(245, 197, 71, 0.24)",
  glowSoft: "rgba(245, 197, 71, 0.06)",
  border: "rgba(245, 197, 71, 0.32)",
  borderSoft: "rgba(245, 197, 71, 0.18)",
  rim: "rgba(255, 232, 160, 0.38)",
  whyHi: "#C4B5FD",
  whyGlow: "rgba(168, 85, 247, 0.42)",
  whyWash: "rgba(168, 85, 247, 0.12)",
  badgeText: "rgba(14, 12, 8, 0.92)",
  markReadPulse: "rgba(245,197,71,0.14)",
  cardChrome: "jewel"
};

const FINANCIALS_THEME: PillarQuestTheme = {
  hi: FINANCIALS_ISLAND.hi,
  lo: FINANCIALS_ISLAND.mid,
  light: FINANCIALS_ISLAND.light,
  glow: FINANCIALS_ISLAND.glow,
  glowSoft: FINANCIALS_ISLAND.glowSoft,
  border: FINANCIALS_ISLAND.border,
  borderSoft: FINANCIALS_ISLAND.borderSoft,
  rim: FINANCIALS_ISLAND.light,
  whyHi: FINANCIALS_ISLAND.hi,
  whyGlow: FINANCIALS_ISLAND.glow,
  whyWash: FINANCIALS_ISLAND.wash,
  badgeText: FINANCIALS_ISLAND.badgeText,
  markReadPulse: FINANCIALS_ISLAND.markReadPulse,
  cardChrome: "neon"
};

/** Matches `ForcesPageClient` island art — storm red + orange why panel. */
const FORCES_THEME: PillarQuestTheme = {
  hi: FORCES_ISLAND.hi,
  lo: FORCES_ISLAND.mid,
  light: FORCES_ISLAND.light,
  glow: FORCES_ISLAND.glow,
  glowSoft: FORCES_ISLAND.glowSoft,
  border: FORCES_ISLAND.border,
  borderSoft: FORCES_ISLAND.borderSoft,
  rim: FORCES_ISLAND.light,
  whyHi: FORCES_ISLAND.whyHi,
  whyGlow: FORCES_ISLAND.whyGlow,
  whyWash: FORCES_ISLAND.whyWash,
  badgeText: FORCES_ISLAND.badgeText,
  markReadPulse: FORCES_ISLAND.markReadPulse,
  cardChrome: "jewel"
};

/** Matches `ManagementPageClient` hotspot glow — violet / purple. */
const MANAGEMENT_THEME: PillarQuestTheme = {
  hi: "#C4B5FD",
  lo: "#8B5CF6",
  glow: "rgba(168, 85, 247, 0.48)",
  glowSoft: "rgba(168, 85, 247, 0.10)",
  border: "rgba(168, 85, 247, 0.40)",
  borderSoft: "rgba(139, 92, 246, 0.22)",
  rim: "rgba(216, 180, 254, 0.55)",
  whyHi: "#E9D5FF",
  whyGlow: "rgba(139, 92, 246, 0.42)",
  whyWash: "rgba(139, 92, 246, 0.12)",
  badgeText: "rgba(12, 8, 22, 0.94)",
  markReadPulse: "rgba(168, 85, 247, 0.14)",
  cardChrome: "jewel"
};

const THEMES: Partial<Record<PillarId, PillarQuestTheme>> = {
  business: BUSINESS_THEME,
  forces: FORCES_THEME,
  financials: FINANCIALS_THEME,
  management: MANAGEMENT_THEME
};

export const PILLAR_QUEST_CARD_PILLARS: readonly PillarId[] = [
  "business",
  "forces",
  "financials",
  "management"
];

export function usesPillarQuestCardTemplate(pillarId: PillarId): boolean {
  return PILLAR_QUEST_CARD_PILLARS.includes(pillarId);
}

export function getPillarQuestTheme(pillarId: PillarId): PillarQuestTheme {
  return THEMES[pillarId] ?? BUSINESS_THEME;
}
