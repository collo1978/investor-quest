/**
 * Investor Quest — canonical title ladder (XP thresholds).
 * Single source for profile tower + engine `computeLevel` / `levelProgress`.
 *
 * Visual order: ELITE at top → BEGINNER at bottom (climb toward mastery).
 */

export type InvestorTierId =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "EXPERT"
  | "ELITE";

export type InvestorRung = {
  /** XP required to *reach* this title (cumulative threshold). */
  xp: number;
  title: string;
  tier: InvestorTierId;
};

/** Ascending XP order (index 0 = career start / bottom of tower). */
export const INVESTOR_RUNGS: readonly InvestorRung[] = [
  { xp: 0, title: "Rookie Investor", tier: "BEGINNER" },
  { xp: 1_000, title: "Curious Analyst", tier: "BEGINNER" },
  { xp: 3_000, title: "Market Explorer", tier: "INTERMEDIATE" },
  { xp: 7_500, title: "Insight Builder", tier: "INTERMEDIATE" },
  { xp: 15_000, title: "Company Analyst", tier: "ADVANCED" },
  { xp: 25_000, title: "Valuation Strategist", tier: "ADVANCED" },
  { xp: 40_000, title: "Portfolio Architect", tier: "EXPERT" },
  { xp: 60_000, title: "Wall St Operator", tier: "EXPERT" },
  { xp: 85_000, title: "Market Master", tier: "ELITE" },
  { xp: 120_000, title: "Wall St Warrior", tier: "ELITE" }
] as const;

/** Tier groups for UI (bottom → top within each group matches rung order). */
export const INVESTOR_TIER_GROUPS: ReadonlyArray<{
  id: InvestorTierId;
  label: string;
  rungs: readonly InvestorRung[];
}> = (() => {
  const map = new Map<InvestorTierId, InvestorRung[]>();
  for (const r of INVESTOR_RUNGS) {
    const arr = map.get(r.tier) ?? [];
    arr.push(r);
    map.set(r.tier, arr);
  }
  const order: InvestorTierId[] = [
    "BEGINNER",
    "INTERMEDIATE",
    "ADVANCED",
    "EXPERT",
    "ELITE"
  ];
  return order.map((id) => ({
    id,
    label: id,
    rungs: map.get(id) ?? []
  }));
})();

/** Highest 1-based rank (1 … rungs.length) for this XP total. */
export function investorRankFromXp(xp: number): number {
  let rank = 1;
  for (let i = 0; i < INVESTOR_RUNGS.length; i++) {
    if (xp >= INVESTOR_RUNGS[i].xp) rank = i + 1;
  }
  return rank;
}

export function investorTitleFromXp(xp: number): string {
  const rank = investorRankFromXp(xp);
  return INVESTOR_RUNGS[rank - 1]?.title ?? INVESTOR_RUNGS[0].title;
}

export type InvestorLadderProgress = {
  rank: number;
  title: string;
  tier: InvestorTierId;
  /** XP at current rung floor. */
  floorXp: number;
  /** XP at next rung (null if maxed). */
  ceilingXp: number | null;
  inBand: number;
  bandSize: number;
  pct: number;
};

export function investorLadderProgress(xp: number): InvestorLadderProgress {
  const rank = investorRankFromXp(xp);
  const idx = Math.max(0, rank - 1);
  const cur = INVESTOR_RUNGS[idx] ?? INVESTOR_RUNGS[0];
  const next = INVESTOR_RUNGS[idx + 1];
  const floorXp = cur.xp;
  const ceilingXp = next ? next.xp : null;
  const bandSize =
    ceilingXp === null ? 1 : Math.max(1, ceilingXp - floorXp);
  const inBand = Math.max(0, xp - floorXp);
  const pct =
    ceilingXp === null
      ? 100
      : Math.max(0, Math.min(100, (inBand / bandSize) * 100));
  return {
    rank,
    title: cur.title,
    tier: cur.tier,
    floorXp,
    ceilingXp,
    inBand,
    bandSize,
    pct
  };
}
