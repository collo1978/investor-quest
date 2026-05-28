import { CONTROLLED_DEMO_COMPANY_ID, CONTROLLED_DEMO_MODE } from "@/lib/demo/controlledDemo";
import {
  CONTROLLED_DEMO_ONBOARDING_SHOWCASE_IDS,
  getControlledDemoOnboardingCompanyCard
} from "@/lib/demo/controlledOnboarding";
import { DEMO_COMPANIES } from "@/lib/onboarding/seedData";
import type { RecommendedCompanyCard } from "@/lib/onboarding/types";

/** Default board when no interests were selected or API returns no matches. */
export const QUEST_MATCH_FALLBACK_IDS = CONTROLLED_DEMO_MODE
  ? CONTROLLED_DEMO_ONBOARDING_SHOWCASE_IDS
  : (["aapl", "nvda", "nke"] as const);

export function buildQuestMatchFallbackCards(): RecommendedCompanyCard[] {
  return QUEST_MATCH_FALLBACK_IDS.map((id, index) => {
    const row = DEMO_COMPANIES.find((c) => c.id === id);
    if (!row) {
      return {
        id,
        logo: `/logos/companies/${id}.svg`,
        companyName: id.toUpperCase(),
        ticker: id.toUpperCase(),
        sector: ". ",
        industry: ". ",
        matchingInterests: [],
        score: QUEST_MATCH_FALLBACK_IDS.length - index
      };
    }
    return {
      id: row.id,
      logo: row.logoUrl,
      companyName: row.displayName,
      ticker: row.ticker,
      sector: row.sector,
      industry: row.industry,
      matchingInterests: [],
      score: QUEST_MATCH_FALLBACK_IDS.length - index
    };
  });
}

/** Pick a winner from the pool, slight bias toward higher scores, still feels random. */
export function pickQuestMatchWinner(
  pool: readonly RecommendedCompanyCard[]
): RecommendedCompanyCard {
  if (CONTROLLED_DEMO_MODE) {
    const nvda = pool.find((c) => c.id === CONTROLLED_DEMO_COMPANY_ID);
    return nvda ?? getControlledDemoOnboardingCompanyCard();
  }
  if (pool.length === 0) return buildQuestMatchFallbackCards()[0]!;
  const sorted = [...pool].sort((a, b) => b.score - a.score);
  const candidates = sorted.slice(0, Math.min(3, sorted.length));
  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx] ?? sorted[0]!;
}