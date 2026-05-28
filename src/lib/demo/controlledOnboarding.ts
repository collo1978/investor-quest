import { companyById } from "@/data/companies";
import { CONTROLLED_DEMO_COMPANY_ID } from "@/lib/demo/controlledDemo";
import { DEMO_COMPANIES } from "@/lib/onboarding/seedData";
import type { RecommendedCompanyCard } from "@/lib/onboarding/types";

/**
 * Recognizable brands for onboarding theater (swipe + spin).
 * Gameplay after onboarding remains NVIDIA-only via controlled demo gates.
 */
export const CONTROLLED_DEMO_ONBOARDING_SHOWCASE_IDS = [
  "aapl",
  "tsla",
  "msft",
  "nke",
  "dis",
  "spot",
  "ea",
  "rblx",
  "pltr",
  "nvda"
] as const;

const PRESENTATION_ALIASES: Record<
  string,
  { displayName: string; ticker: string; sector: string; industry: string }
> = {
  spot: {
    displayName: "Spotify",
    ticker: "SPOT",
    sector: "Communication Services",
    industry: "Audio streaming"
  }
};

function onboardingRowToCard(
  id: string,
  score: number,
  matchingInterests: string[] = []
): RecommendedCompanyCard | null {
  const row = DEMO_COMPANIES.find((c) => c.id === id);
  if (!row) {
    if (id === CONTROLLED_DEMO_COMPANY_ID) {
      const c = companyById(CONTROLLED_DEMO_COMPANY_ID);
      return {
        id: c.id,
        logo: c.logoSrc,
        companyName: c.name,
        ticker: c.ticker,
        sector: c.sector,
        industry: "Semiconductors",
        matchingInterests: ["ai", "tech"],
        score
      };
    }
    return null;
  }
  const alias = PRESENTATION_ALIASES[id];
  return {
    id: row.id,
    logo: row.logoUrl,
    companyName: alias?.displayName ?? row.displayName,
    ticker: alias?.ticker ?? row.ticker,
    sector: alias?.sector ?? row.sector,
    industry: alias?.industry ?? row.industry,
    matchingInterests,
    score
  };
}

/** Full swipe deck — varied logos, NVIDIA included but not exclusive. */
export function buildControlledDemoOnboardingShowcase(
  interestIds: string[] = []
): RecommendedCompanyCard[] {
  const interestSet = new Set(interestIds);
  return CONTROLLED_DEMO_ONBOARDING_SHOWCASE_IDS.map((id, index) => {
    const baseScore = CONTROLLED_DEMO_ONBOARDING_SHOWCASE_IDS.length - index;
    const boosted =
      id === CONTROLLED_DEMO_COMPANY_ID && interestSet.has("ai") ? baseScore + 4 : baseScore;
    const interests =
      id === CONTROLLED_DEMO_COMPANY_ID
        ? ["ai", "tech"].filter((t) => interestSet.has(t) || interestSet.size === 0)
        : interestIds.slice(0, 2);
    return onboardingRowToCard(id, boosted, interests);
  }).filter((c): c is RecommendedCompanyCard => c !== null);
}

export function getControlledDemoOnboardingCompanyCard(): RecommendedCompanyCard {
  return onboardingRowToCard(CONTROLLED_DEMO_COMPANY_ID, 100, ["ai", "tech"])!;
}

/** Merge API matches into the showcase so step 2/3 feel broad, not NVIDIA-only. */
export function mergeRecommendationsForControlledDemo(
  apiCards: RecommendedCompanyCard[],
  interestIds: string[] = []
): RecommendedCompanyCard[] {
  const byId = new Map<string, RecommendedCompanyCard>();
  for (const card of buildControlledDemoOnboardingShowcase(interestIds)) {
    byId.set(card.id, card);
  }
  for (const card of apiCards) {
    if (
      !(CONTROLLED_DEMO_ONBOARDING_SHOWCASE_IDS as readonly string[]).includes(
        card.id as (typeof CONTROLLED_DEMO_ONBOARDING_SHOWCASE_IDS)[number]
      ) &&
      card.id !== CONTROLLED_DEMO_COMPANY_ID
    ) {
      continue;
    }
    const existing = byId.get(card.id);
    const base = existing ?? onboardingRowToCard(card.id, card.score ?? 1);
    if (!base) continue;
    byId.set(card.id, {
      ...base,
      ...card,
      score: Math.max(card.score ?? 0, existing?.score ?? 0, 1)
    });
  }
  if (!byId.has(CONTROLLED_DEMO_COMPANY_ID)) {
    byId.set(CONTROLLED_DEMO_COMPANY_ID, getControlledDemoOnboardingCompanyCard());
  }
  return [...byId.values()].sort((a, b) => b.score - a.score);
}

/** Spin board: up to 9 recognizable companies; winner selection still forces NVIDIA. */
export function buildControlledDemoQuestMatchPool(
  recommendedCards: RecommendedCompanyCard[]
): RecommendedCompanyCard[] {
  const merged = mergeRecommendationsForControlledDemo(recommendedCards);
  const pool = shuffleOnboardingDeck(merged);
  const slice = pool.slice(0, 9);
  if (!slice.some((c) => c.id === CONTROLLED_DEMO_COMPANY_ID)) {
    slice[slice.length - 1] = getControlledDemoOnboardingCompanyCard();
  }
  return slice.length >= 6 ? slice : buildControlledDemoOnboardingShowcase().slice(0, 9);
}

export function shuffleOnboardingDeck<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}
