/**
 * Map-layer design tokens — pillar palettes + visual state union.
 *
 * Keeping these in one place lets `QuestIsland`, `IslandLabel`, and
 * `EnergyPath` agree on colours without duplicating literals.
 */

import type { PillarId } from "@/data/pillars";

export type IslandVisualState =
  | "locked"
  | "unlocked" // open but no cards read yet.
  | "inProgress" // at least one card read, quiz not yet passed.
  | "active" // the player's current island.
  | "completed"; // every quiz in the island passed.

export type IslandPalette = {
  /** Primary accent (rim / glow). */
  hi: string;
  /** Mid-tone (top plateau). */
  mid: string;
  /** Deep base (cliff). */
  deep: string;
  /** Halo color. */
  halo: string;
  /** Reflection shadow color. */
  shadow: string;
  /** Themed accent — drives FX colour (sparks, holos, beams). */
  accent: string;
  /** Bright light colour — drives window lights, lightning, displays. */
  light: string;
  /** Brand atmosphere mood. */
  mood: "warm-gold" | "stormy-red" | "vault-green" | "executive-blue";
};

export const ISLAND_PALETTES: Record<PillarId, IslandPalette> = {
  business: {
    // Apple-style HQ — premium violet glass with warm gold city lights.
    hi: "rgba(216,180,254,0.95)",
    mid: "rgba(139,92,246,0.95)",
    deep: "rgba(76,29,149,0.95)",
    halo: "rgba(139,92,246,0.55)",
    shadow: "rgba(67,30,140,0.55)",
    accent: "rgba(255,200,100,1)", // warm gold sparks
    light: "rgba(255,229,141,1)", // window glow
    mood: "warm-gold"
  },
  forces: {
    // Rocket platform / volatility — magenta storm with red engine fire.
    hi: "rgba(248,113,113,0.95)",
    mid: "rgba(220,38,80,0.95)",
    deep: "rgba(127,29,29,0.95)",
    halo: "rgba(244,114,182,0.55)",
    shadow: "rgba(95,30,60,0.55)",
    accent: "rgba(252,165,40,1)", // fiery orange
    light: "rgba(255,240,200,1)", // lightning white
    mood: "stormy-red"
  },
  financials: {
    // Vault / financial strength — deep teal with green holographic finance.
    hi: "rgba(110,231,183,0.95)",
    mid: "rgba(16,185,129,0.95)",
    deep: "rgba(6,78,59,0.95)",
    halo: "rgba(52,211,153,0.55)",
    shadow: "rgba(10,60,50,0.55)",
    accent: "rgba(125,250,180,1)", // hologram green
    light: "rgba(220,255,236,1)", // pale mint
    mood: "vault-green"
  },
  management: {
    // Boardroom / command center — sleek blue-white executive aesthetic.
    hi: "rgba(186,230,253,0.95)",
    mid: "rgba(96,165,250,0.95)",
    deep: "rgba(30,58,138,0.95)",
    halo: "rgba(125,211,252,0.55)",
    shadow: "rgba(30,40,90,0.55)",
    accent: "rgba(225,240,255,1)", // platinum
    light: "rgba(255,255,255,1)", // pure white beams
    mood: "executive-blue"
  }
};

/** Gold accent used when an island is fully completed (overrides pillar palette). */
export const COMPLETED_PALETTE: IslandPalette = {
  hi: "rgba(255,229,141,1)",
  mid: "rgba(245,197,71,0.95)",
  deep: "rgba(180,130,30,0.95)",
  halo: "rgba(245,197,71,0.65)",
  shadow: "rgba(140,90,20,0.55)",
  accent: "rgba(255,229,141,1)",
  light: "rgba(255,250,220,1)",
  mood: "warm-gold"
};

/** Locked / dim palette used as a desaturated fallback. */
export const LOCKED_PALETTE: IslandPalette = {
  hi: "rgba(216,180,254,0.55)",
  mid: "rgba(110,98,130,0.85)",
  deep: "rgba(55,50,75,0.95)",
  halo: "rgba(139,92,246,0.20)",
  shadow: "rgba(20,18,30,0.6)",
  accent: "rgba(160,160,180,0.6)",
  light: "rgba(200,200,220,0.45)",
  mood: "executive-blue"
};

/** Resolve the right palette for an island given its current state. */
export function paletteFor(
  pillarId: PillarId,
  state: IslandVisualState
): IslandPalette {
  if (state === "locked") return LOCKED_PALETTE;
  if (state === "completed") return COMPLETED_PALETTE;
  return ISLAND_PALETTES[pillarId];
}
