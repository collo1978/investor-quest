import type { PillarId } from "@/data/pillars";
import { XP_ISLAND_COMPLETION } from "@/engine/progression/xpEconomy";
import { TEN_K_ROOKIE_CHALLENGE_XP } from "@/data/quests/tenKRookieFinalChallenge";

/** Match cinematic Schools map canvas footprint. */
export const ROBLOX_MAP_NATURAL = {
  width: 1672,
  height: 941
} as const;

export const ROBLOX_MAP_TITLE = "NVIDIA 10-K WORLD";

export type RobloxSignPlacement = "below" | "above" | "left" | "right";

export type RobloxIslandMeta = {
  id: PillarId;
  emoji: string;
  label: string;
  subtitle: string;
  land: string;
  landEdge: string;
  path: string;
  glow: string;
  xpReward: number;
  x: number;
  y: number;
  signPlacement: RobloxSignPlacement;
};

export type RobloxHubMeta = {
  emoji: string;
  label: string;
  subtitle: string;
  accent: string;
  accentEdge: string;
  glow: string;
  xpReward: number;
  x: number;
  y: number;
};

export const ROBLOX_MAP_ISLANDS: readonly RobloxIslandMeta[] = [
  {
    id: "business",
    emoji: "🏢",
    label: "Business District",
    subtitle: "How do they make money?",
    land: "#fde047",
    landEdge: "#ca8a04",
    path: "#facc15",
    glow: "rgba(250,204,21,0.5)",
    xpReward: XP_ISLAND_COMPLETION,
    x: 13,
    y: 8,
    signPlacement: "below"
  },
  {
    id: "forces",
    emoji: "🚨",
    label: "Risk Zone",
    subtitle: "What are the threats?",
    land: "#f87171",
    landEdge: "#dc2626",
    path: "#ef4444",
    glow: "rgba(239,68,68,0.48)",
    xpReward: XP_ISLAND_COMPLETION,
    x: 87,
    y: 8,
    signPlacement: "below"
  },
  {
    id: "financials",
    emoji: "💰",
    label: "Financial Vault",
    subtitle: "Are they financially strong?",
    land: "#4ade80",
    landEdge: "#16a34a",
    path: "#22c55e",
    glow: "rgba(34,197,94,0.48)",
    xpReward: XP_ISLAND_COMPLETION,
    x: 12,
    y: 54,
    signPlacement: "below"
  },
  {
    id: "management",
    emoji: "👑",
    label: "Management Castle",
    subtitle: "Would you trust them?",
    land: "#60a5fa",
    landEdge: "#2563eb",
    path: "#3b82f6",
    glow: "rgba(59,130,246,0.48)",
    xpReward: XP_ISLAND_COMPLETION,
    x: 88,
    y: 54,
    signPlacement: "below"
  }
] as const;

export const ROBLOX_MAP_HUB: RobloxHubMeta = {
  emoji: "🛡️",
  label: "10K Hub",
  subtitle: "Main spawn · Final challenge",
  accent: "#c4b5fd",
  accentEdge: "#7c3aed",
  glow: "rgba(124,58,237,0.52)",
  xpReward: TEN_K_ROOKIE_CHALLENGE_XP,
  x: 50,
  y: 42
};

export const ROBLOX_MAP_ROADS: readonly { islandId: PillarId; d: string }[] = [
  { islandId: "business", d: "M50 49 C42 40 30 28 20 20" },
  { islandId: "forces", d: "M50 49 C58 40 70 28 80 20" },
  { islandId: "financials", d: "M50 49 C42 58 30 68 20 74" },
  { islandId: "management", d: "M50 49 C58 58 70 68 80 74" }
] as const;

export const ROBLOX_LANDMARK_PLACEMENTS = {
  business: { x: 0.1, y: 0.06, scale: 1.05 },
  forces: { x: 0.66, y: 0.05, scale: 1.05 },
  financials: { x: 0.09, y: 0.55, scale: 1.08 },
  management: { x: 0.65, y: 0.53, scale: 1.08 },
  hub: { x: 0.5, y: 0.46, scale: 0.95 }
} as const;

export function robloxIslandById(id: PillarId): RobloxIslandMeta {
  const island = ROBLOX_MAP_ISLANDS.find((i) => i.id === id);
  if (!island) throw new Error(`Unknown Roblox island: ${id}`);
  return island;
}
