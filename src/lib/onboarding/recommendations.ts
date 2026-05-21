import {
  DEMO_COMPANIES,
  DEMO_COMPANY_INTEREST_TAGS,
  DEMO_INTERESTS
} from "@/lib/onboarding/seedData";
import type {
  CompanyInterestTag,
  InterestTagSource,
  OnboardingCompanyRecord,
  OnboardingRecommendationsResult,
  RecommendedCompanyCard
} from "@/lib/onboarding/types";

const TAG_WEIGHT: Record<InterestTagSource, number> = {
  metadata: 3,
  seed: 2,
  item1_business: 1
};

export function normalizeInterestSlugs(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  return [
    ...new Set(
      raw
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    )
  ];
}

function scoreTag(tagSource: InterestTagSource): number {
  return TAG_WEIGHT[tagSource] ?? 1;
}

/** Rank companies by metadata-first tag matches (metadata > seed > Item 1 hints). */
export function buildRecommendations(
  interestSlugs: string[],
  companies: readonly OnboardingCompanyRecord[],
  tags: readonly CompanyInterestTag[],
  options?: { limit?: number }
): RecommendedCompanyCard[] {
  const selected = new Set(interestSlugs);
  if (selected.size === 0) return [];

  const companyById = new Map(companies.map((c) => [c.id, c]));
  const scores = new Map<
    string,
    { score: number; matching: Set<string>; sources: Set<InterestTagSource> }
  >();

  for (const tag of tags) {
    if (!selected.has(tag.interestId)) continue;
    const company = companyById.get(tag.companyId);
    if (!company) continue;

    const entry = scores.get(tag.companyId) ?? {
      score: 0,
      matching: new Set<string>(),
      sources: new Set<InterestTagSource>()
    };
    entry.score += scoreTag(tag.tagSource);
    entry.matching.add(tag.interestId);
    entry.sources.add(tag.tagSource);
    scores.set(tag.companyId, entry);
  }

  const cards: RecommendedCompanyCard[] = [];

  for (const [companyId, { score, matching }] of scores) {
    const company = companyById.get(companyId);
    if (!company) continue;
    cards.push({
      id: company.id,
      logo: company.logoUrl,
      companyName: company.displayName,
      ticker: company.ticker,
      sector: company.sector,
      industry: company.industry,
      matchingInterests: [...matching].sort(),
      score
    });
  }

  cards.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.companyName.localeCompare(b.companyName);
  });

  const limit = options?.limit ?? 12;
  return cards.slice(0, limit);
}

export function buildDemoRecommendations(
  interestSlugs: string[],
  limit?: number
): OnboardingRecommendationsResult {
  const interests = normalizeInterestSlugs(interestSlugs.join(","));
  const companies = buildRecommendations(
    interests,
    DEMO_COMPANIES,
    DEMO_COMPANY_INTEREST_TAGS,
    { limit }
  );
  return { source: "demo", interests, companies };
}

export function listDemoInterests() {
  return [...DEMO_INTERESTS].sort((a, b) => a.sortOrder - b.sortOrder);
}
