import type { PillarId } from "@/data/pillars";
import { XP_ISLAND_COMPLETION } from "@/engine/progression/xpEconomy";
import { TEN_K_ROOKIE_CHALLENGE_XP } from "@/data/quests/tenKRookieFinalChallenge";

/** Match cinematic Schools map canvas footprint. */
export const DRAGONBOX_MAP_NATURAL = {
  width: 1672,
  height: 941
} as const;

export const DRAGONBOX_MAP_TITLE = "NVIDIA 10-K";

export type DragonBoxSignPlacement = "below" | "above" | "left" | "right";

export type DragonBoxIslandMeta = {
  id: PillarId;
  label: string;
  subtitle: string;
  land: string;
  landEdge: string;
  path: string;
  glow: string;
  xpReward: number;
  x: number;
  y: number;
  signPlacement: DragonBoxSignPlacement;
};

export type DragonBoxHubMeta = {
  label: string;
  subtitle: string;
  accent: string;
  accentEdge: string;
  glow: string;
  xpReward: number;
  x: number;
  y: number;
};

export const DRAGONBOX_MAP_ISLANDS: readonly DragonBoxIslandMeta[] = [
  {
    id: "business",
    label: "Business",
    subtitle: "How do they make money?",
    land: "#fffbeb",
    landEdge: "#f59e0b",
    path: "#fbbf24",
    glow: "rgba(251,191,36,0.35)",
    xpReward: XP_ISLAND_COMPLETION,
    x: 13,
    y: 8,
    signPlacement: "below"
  },
  {
    id: "forces",
    label: "Risks",
    subtitle: "What are the threats?",
    land: "#fff1f2",
    landEdge: "#f43f5e",
    path: "#fb7185",
    glow: "rgba(244,63,94,0.32)",
    xpReward: XP_ISLAND_COMPLETION,
    x: 87,
    y: 8,
    signPlacement: "below"
  },
  {
    id: "financials",
    label: "Financial",
    subtitle: "Are they financially strong?",
    land: "#ecfdf5",
    landEdge: "#10b981",
    path: "#34d399",
    glow: "rgba(52,211,153,0.32)",
    xpReward: XP_ISLAND_COMPLETION,
    x: 12,
    y: 54,
    signPlacement: "below"
  },
  {
    id: "management",
    label: "Management",
    subtitle: "Would you trust them?",
    land: "#eff6ff",
    landEdge: "#3b82f6",
    path: "#60a5fa",
    glow: "rgba(96,165,250,0.32)",
    xpReward: XP_ISLAND_COMPLETION,
    x: 88,
    y: 54,
    signPlacement: "below"
  }
] as const;

export const DRAGONBOX_MAP_HUB: DragonBoxHubMeta = {
  label: "10K Hub",
  subtitle: "Final challenge",
  accent: "#f5f3ff",
  accentEdge: "#8b5cf6",
  glow: "rgba(139,92,246,0.38)",
  xpReward: TEN_K_ROOKIE_CHALLENGE_XP,
  x: 50,
  y: 42
};

export const DRAGONBOX_MAP_PATHS: readonly { islandId: PillarId; d: string }[] = [
  { islandId: "business", d: "M50 49 C42 40 30 28 20 20" },
  { islandId: "forces", d: "M50 49 C58 40 70 28 80 20" },
  { islandId: "financials", d: "M50 49 C42 58 30 68 20 74" },
  { islandId: "management", d: "M50 49 C58 58 70 68 80 74" }
] as const;

export const DRAGONBOX_LANDMARK_PLACEMENTS = {
  business: { x: 0.12, y: 0.07, scale: 1 },
  forces: { x: 0.67, y: 0.06, scale: 1 },
  financials: { x: 0.1, y: 0.56, scale: 1 },
  management: { x: 0.66, y: 0.54, scale: 1 },
  hub: { x: 0.5, y: 0.47, scale: 0.92 }
} as const;

export function dragonBoxIslandById(id: PillarId): DragonBoxIslandMeta {
  const island = DRAGONBOX_MAP_ISLANDS.find((i) => i.id === id);
  if (!island) throw new Error(`Unknown DragonBox island: ${id}`);
  return island;
}
