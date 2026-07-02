import type { PillarId } from "@/data/pillars";
import { XP_ISLAND_COMPLETION } from "@/engine/progression/xpEconomy";
import { TEN_K_ROOKIE_CHALLENGE_XP } from "@/data/quests/tenKRookieFinalChallenge";

export const KHAN_MAP_TITLE = "NVIDIA 10-K";
export const KHAN_MAP_SUBTITLE = "Structured learning journey";

/** Rough minutes per remaining lesson (preview estimate). */
export const KHAN_MINUTES_PER_LESSON = 4;

export type KhanModuleMeta = {
  id: PillarId;
  emoji: string;
  label: string;
  subtitle: string;
  accent: string;
  accentSoft: string;
  xpReward: number;
};

export type KhanFinalMeta = {
  emoji: string;
  label: string;
  subtitle: string;
  accent: string;
  accentSoft: string;
  xpReward: number;
};

export const KHAN_MAP_MODULES: readonly KhanModuleMeta[] = [
  {
    id: "business",
    emoji: "🏢",
    label: "Business",
    subtitle: "How do they make money?",
    accent: "#0d9488",
    accentSoft: "#ccfbf1",
    xpReward: XP_ISLAND_COMPLETION
  },
  {
    id: "forces",
    emoji: "🚨",
    label: "Risks",
    subtitle: "What are the threats?",
    accent: "#e11d48",
    accentSoft: "#ffe4e6",
    xpReward: XP_ISLAND_COMPLETION
  },
  {
    id: "financials",
    emoji: "💰",
    label: "Financial",
    subtitle: "Are they financially strong?",
    accent: "#059669",
    accentSoft: "#d1fae5",
    xpReward: XP_ISLAND_COMPLETION
  },
  {
    id: "management",
    emoji: "👑",
    label: "Management",
    subtitle: "Would you trust them?",
    accent: "#2563eb",
    accentSoft: "#dbeafe",
    xpReward: XP_ISLAND_COMPLETION
  }
] as const;

export const KHAN_FINAL_MODULE: KhanFinalMeta = {
  emoji: "🏆",
  label: "Final Challenge",
  subtitle: "Prove your 10-K mastery across all four pillars",
  accent: "#7c3aed",
  accentSoft: "#ede9fe",
  xpReward: TEN_K_ROOKIE_CHALLENGE_XP
};

export const KHAN_ROOKIE_BADGE = {
  id: "ten-k-rookie" as const,
  label: "10K Rookie Badge",
  detail: "Complete all four modules and the final challenge"
};

export function khanModuleById(id: PillarId): KhanModuleMeta {
  const mod = KHAN_MAP_MODULES.find((m) => m.id === id);
  if (!mod) throw new Error(`Unknown Khan module: ${id}`);
  return mod;
}
