import type { PillarId } from "@/data/pillars";
import { XP_ISLAND_COMPLETION } from "@/engine/progression/xpEconomy";
import { TEN_K_ROOKIE_CHALLENGE_XP } from "@/data/quests/tenKRookieFinalChallenge";

/** Match cinematic Schools map canvas (`new-map.png`). */
export const CARTOON_MAP_NATURAL = {
  width: 1672,
  height: 941
} as const;

export const CARTOON_MAP_TITLE = "NVIDIA 10-K WORLD";

export type CartoonLandmarkKind = "office" | "radar" | "vault" | "castle";

export type CartoonSignPlacement = "below" | "above" | "left" | "right";

export type CartoonIslandMeta = {
  id: PillarId;
  emoji: string;
  label: string;
  subtitle: string;
  land: string;
  landEdge: string;
  path: string;
  xpReward: number;
  landmark: CartoonLandmarkKind;
  x: number;
  y: number;
  signPlacement: CartoonSignPlacement;
};

export type CartoonHubMeta = {
  emoji: string;
  label: string;
  subtitle: string;
  accent: string;
  accentEdge: string;
  xpReward: number;
  x: number;
  y: number;
};

export const CARTOON_MAP_ISLANDS: readonly CartoonIslandMeta[] = [
  {
    id: "business",
    emoji: "🏢",
    label: "Business Island",
    subtitle: "How do they make money?",
    land: "#fde68a",
    landEdge: "#d97706",
    path: "#f59e0b",
    xpReward: XP_ISLAND_COMPLETION,
    landmark: "office",
    x: 13,
    y: 8,
    signPlacement: "below"
  },
  {
    id: "forces",
    emoji: "🚨",
    label: "Risk Island",
    subtitle: "What are the threats?",
    land: "#fecaca",
    landEdge: "#dc2626",
    path: "#ef4444",
    xpReward: XP_ISLAND_COMPLETION,
    landmark: "radar",
    x: 87,
    y: 8,
    signPlacement: "below"
  },
  {
    id: "financials",
    emoji: "💰",
    label: "Financial Island",
    subtitle: "Are they financially strong?",
    land: "#bbf7d0",
    landEdge: "#16a34a",
    path: "#22c55e",
    xpReward: XP_ISLAND_COMPLETION,
    landmark: "vault",
    x: 12,
    y: 54,
    signPlacement: "below"
  },
  {
    id: "management",
    emoji: "👑",
    label: "Management Island",
    subtitle: "Would you trust them?",
    land: "#bfdbfe",
    landEdge: "#2563eb",
    path: "#3b82f6",
    xpReward: XP_ISLAND_COMPLETION,
    landmark: "castle",
    x: 88,
    y: 54,
    signPlacement: "below"
  }
] as const;

export const CARTOON_MAP_HUB: CartoonHubMeta = {
  emoji: "🛡️",
  label: "10K Hub",
  subtitle: "Final Challenge",
  accent: "#ddd6fe",
  accentEdge: "#7c3aed",
  xpReward: TEN_K_ROOKIE_CHALLENGE_XP,
  x: 50,
  y: 42
};

/** Dirt roads from hub to each region (viewBox 0 0 100 100). */
export const CARTOON_MAP_ROADS: readonly {
  islandId: PillarId;
  d: string;
}[] = [
  { islandId: "business", d: "M50 49 C42 40 30 28 20 20" },
  { islandId: "forces", d: "M50 49 C58 40 70 28 80 20" },
  { islandId: "financials", d: "M50 49 C42 58 30 68 20 74" },
  { islandId: "management", d: "M50 49 C58 58 70 68 80 74" }
] as const;

export function cartoonIslandById(id: PillarId): CartoonIslandMeta {
  const island = CARTOON_MAP_ISLANDS.find((i) => i.id === id);
  if (!island) throw new Error(`Unknown cartoon island: ${id}`);
  return island;
}
