import type { PillarId } from "@/data/pillars";
import { XP_ISLAND_COMPLETION } from "@/engine/progression/xpEconomy";
import { TEN_K_ROOKIE_CHALLENGE_XP } from "@/data/quests/tenKRookieFinalChallenge";

export const LEGENDS_MAP_NATURAL = {
  width: 1672,
  height: 941
} as const;

export const LEGENDS_MAP_TITLE = "NVIDIA 10-K ADVENTURE";

export type LegendsSignPlacement = "below" | "above" | "left" | "right";

export type LegendsIslandMeta = {
  id: PillarId;
  emoji: string;
  label: string;
  zone: string;
  subtitle: string;
  land: string;
  landEdge: string;
  path: string;
  glow: string;
  xpReward: number;
  x: number;
  y: number;
  signPlacement: LegendsSignPlacement;
};

export type LegendsHubMeta = {
  emoji: string;
  label: string;
  zone: string;
  subtitle: string;
  accent: string;
  accentEdge: string;
  glow: string;
  xpReward: number;
  x: number;
  y: number;
};

export const LEGENDS_MAP_ISLANDS: readonly LegendsIslandMeta[] = [
  {
    id: "business",
    emoji: "🏢",
    label: "Business Region",
    zone: "Corporate City",
    subtitle: "How do they make money?",
    land: "#fcd34d",
    landEdge: "#d97706",
    path: "#fbbf24",
    glow: "rgba(251,191,36,0.55)",
    xpReward: XP_ISLAND_COMPLETION,
    x: 13,
    y: 8,
    signPlacement: "below"
  },
  {
    id: "forces",
    emoji: "🚨",
    label: "Risk Region",
    zone: "Storm Watch",
    subtitle: "What are the threats?",
    land: "#fb7185",
    landEdge: "#e11d48",
    path: "#f43f5e",
    glow: "rgba(244,63,94,0.52)",
    xpReward: XP_ISLAND_COMPLETION,
    x: 87,
    y: 8,
    signPlacement: "below"
  },
  {
    id: "financials",
    emoji: "💰",
    label: "Financial Region",
    zone: "Treasury Isles",
    subtitle: "Are they financially strong?",
    land: "#4ade80",
    landEdge: "#059669",
    path: "#22c55e",
    glow: "rgba(34,197,94,0.52)",
    xpReward: XP_ISLAND_COMPLETION,
    x: 12,
    y: 54,
    signPlacement: "below"
  },
  {
    id: "management",
    emoji: "👑",
    label: "Management Region",
    zone: "Leadership Citadel",
    subtitle: "Would you trust them?",
    land: "#818cf8",
    landEdge: "#4f46e5",
    path: "#6366f1",
    glow: "rgba(99,102,241,0.52)",
    xpReward: XP_ISLAND_COMPLETION,
    x: 88,
    y: 54,
    signPlacement: "below"
  }
] as const;

export const LEGENDS_MAP_HUB: LegendsHubMeta = {
  emoji: "🛡️",
  label: "10K Hub",
  zone: "Command Center",
  subtitle: "Spawn here · Final challenge",
  accent: "#c4b5fd",
  accentEdge: "#7c3aed",
  glow: "rgba(167,139,250,0.58)",
  xpReward: TEN_K_ROOKIE_CHALLENGE_XP,
  x: 50,
  y: 42
};

export const LEGENDS_MAP_BRIDGES: readonly { islandId: PillarId; d: string }[] = [
  { islandId: "business", d: "M50 49 C42 40 30 28 20 20" },
  { islandId: "forces", d: "M50 49 C58 40 70 28 80 20" },
  { islandId: "financials", d: "M50 49 C42 58 30 68 20 74" },
  { islandId: "management", d: "M50 49 C58 58 70 68 80 74" }
] as const;

export const LEGENDS_LANDMARK_PLACEMENTS = {
  business: { x: 0.1, y: 0.05, scale: 1.06 },
  forces: { x: 0.66, y: 0.04, scale: 1.06 },
  financials: { x: 0.09, y: 0.54, scale: 1.08 },
  management: { x: 0.65, y: 0.52, scale: 1.08 },
  hub: { x: 0.5, y: 0.45, scale: 0.98 }
} as const;

export const LEGENDS_FLOATING_ISLANDS = {
  business: { cx: 0.2, cy: 0.2, rx: 0.15, ry: 0.12 },
  forces: { cx: 0.8, cy: 0.19, rx: 0.15, ry: 0.12 },
  financials: { cx: 0.19, cy: 0.72, rx: 0.16, ry: 0.13 },
  management: { cx: 0.81, cy: 0.71, rx: 0.16, ry: 0.13 },
  hub: { cx: 0.5, cy: 0.47, rx: 0.11, ry: 0.1 }
} as const;
