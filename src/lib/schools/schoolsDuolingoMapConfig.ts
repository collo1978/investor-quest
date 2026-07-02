import type { PillarId } from "@/data/pillars";
import { XP_ISLAND_COMPLETION } from "@/engine/progression/xpEconomy";
import { TEN_K_ROOKIE_CHALLENGE_XP } from "@/data/quests/tenKRookieFinalChallenge";

export const DUOLINGO_MAP_TITLE = "NVIDIA 10-K QUEST";

export type DuolingoMapPillarNode = {
  kind: "pillar";
  id: PillarId;
  emoji: string;
  label: string;
  subtitle: string;
  accent: string;
  accentSoft: string;
  xpReward: number;
};

export type DuolingoMapFinalNode = {
  kind: "final";
  id: "final-challenge";
  emoji: string;
  label: string;
  subtitle: string;
  accent: string;
  accentSoft: string;
  xpReward: number;
};

export type DuolingoMapNode = DuolingoMapPillarNode | DuolingoMapFinalNode;

/** Vertical quest path — pillar order matches the Schools 10-K curriculum. */
export const DUOLINGO_MAP_NODES: readonly DuolingoMapNode[] = [
  {
    kind: "pillar",
    id: "business",
    emoji: "🏢",
    label: "BUSINESS",
    subtitle: "How do they make money?",
    accent: "#f59e0b",
    accentSoft: "rgba(245,158,11,0.18)",
    xpReward: XP_ISLAND_COMPLETION
  },
  {
    kind: "pillar",
    id: "forces",
    emoji: "🚨",
    label: "RISKS",
    subtitle: "What are the threats?",
    accent: "#ef4444",
    accentSoft: "rgba(239,68,68,0.18)",
    xpReward: XP_ISLAND_COMPLETION
  },
  {
    kind: "pillar",
    id: "financials",
    emoji: "💰",
    label: "FINANCIAL",
    subtitle: "Are they financially strong?",
    accent: "#22c55e",
    accentSoft: "rgba(34,197,94,0.18)",
    xpReward: XP_ISLAND_COMPLETION
  },
  {
    kind: "pillar",
    id: "management",
    emoji: "👑",
    label: "MANAGEMENT",
    subtitle: "Would you trust them?",
    accent: "#3b82f6",
    accentSoft: "rgba(59,130,246,0.18)",
    xpReward: XP_ISLAND_COMPLETION
  },
  {
    kind: "final",
    id: "final-challenge",
    emoji: "🏆",
    label: "FINAL CHALLENGE",
    subtitle: "Prove your 10-K mastery",
    accent: "#a855f7",
    accentSoft: "rgba(168,85,247,0.22)",
    xpReward: TEN_K_ROOKIE_CHALLENGE_XP
  }
] as const;

/** Pillar zones only — final challenge lives in the center hub. */
export const DUOLINGO_BOARD_PILLARS = DUOLINGO_MAP_NODES.filter(
  (n): n is DuolingoMapPillarNode => n.kind === "pillar"
);

export const DUOLINGO_BOARD_HUB = DUOLINGO_MAP_NODES.find(
  (n): n is DuolingoMapFinalNode => n.kind === "final"
)!;

/** Percent positions on the flat 2D board (matches quadrant island layout). */
export type DuolingoBoardZoneLayout = {
  id: PillarId;
  x: number;
  y: number;
  /** Simple landmark SVG variant key. */
  landmark: "office" | "warning" | "coins" | "crown";
};

export const DUOLINGO_BOARD_ZONE_LAYOUT: readonly DuolingoBoardZoneLayout[] = [
  { id: "business", x: 22, y: 24, landmark: "office" },
  { id: "forces", x: 78, y: 24, landmark: "warning" },
  { id: "financials", x: 22, y: 76, landmark: "coins" },
  { id: "management", x: 78, y: 76, landmark: "crown" }
] as const;

export const DUOLINGO_BOARD_HUB_POSITION = { x: 50, y: 50 } as const;
