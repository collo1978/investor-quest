/**
 * Engine — XP & investor rank.
 *
 * Rank is driven by the canonical ladder in `data/progression/investorLadder.ts`.
 */

import {
  INVESTOR_RUNGS,
  investorLadderProgress,
  investorRankFromXp
} from "@/data/progression/investorLadder";

export function computeLevel(xp: number): number {
  return investorRankFromXp(xp);
}

/**
 * XP band for the current rank (1-based level = rank on ladder).
 */
export function levelBand(level: number): { start: number; end: number } {
  const rank = Math.max(1, Math.min(INVESTOR_RUNGS.length, level));
  const i = rank - 1;
  const start = INVESTOR_RUNGS[i].xp;
  const end = INVESTOR_RUNGS[i + 1]?.xp ?? start;
  return { start, end };
}

export type LevelProgress = {
  level: number;
  inLevel: number;
  needed: number;
  pct: number;
  nextXp: number;
};

export function levelProgress(xp: number): LevelProgress {
  const p = investorLadderProgress(xp);
  const start = p.floorXp;
  const needed =
    p.ceilingXp === null ? 1 : Math.max(1, p.ceilingXp - start);
  const inLevel = Math.max(0, xp - start);
  const pct =
    p.ceilingXp === null
      ? 100
      : Math.max(0, Math.min(100, (inLevel / needed) * 100));
  const last = INVESTOR_RUNGS[INVESTOR_RUNGS.length - 1];
  return {
    level: p.rank,
    inLevel,
    needed,
    pct,
    nextXp: p.ceilingXp ?? last.xp
  };
}
