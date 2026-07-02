import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";

/** Display order — each quest completion masters one investing principle. */
export const MASTER_INVESTING_PRINCIPLES = [
  {
    id: "value-proposition",
    label: "Value Proposition",
    shortLabel: "Value",
    questSlug: "what-they-do"
  },
  {
    id: "competitive-advantage",
    label: "Competitive Advantage",
    shortLabel: "Comp Adv",
    questSlug: "why-they-stay"
  },
  {
    id: "customers-markets",
    label: "Customers & Markets",
    shortLabel: "Customers",
    questSlug: "how-it-works"
  },
  {
    id: "revenue-model",
    label: "Revenue Model",
    shortLabel: "Revenue",
    questSlug: "why-buying"
  },
  {
    id: "growth-drivers",
    label: "Growth Drivers",
    shortLabel: "Growth",
    questSlug: "everyday-life"
  },
  {
    id: "industry-position",
    label: "Industry Position",
    shortLabel: "Industry",
    questSlug: "competition"
  },
  {
    id: "business-quality",
    label: "Business Quality",
    shortLabel: "Quality",
    questSlug: "who-competes"
  }
] as const;

export type MasterInvestingPrinciple = (typeof MASTER_INVESTING_PRINCIPLES)[number];

export type MasterInvestingPrincipleState = MasterInvestingPrinciple & {
  mastered: boolean;
};

export function resolveMasterInvestingPrinciples(
  cards: readonly BusinessHubQuestCard[]
): MasterInvestingPrincipleState[] {
  const completedSlugs = new Set(
    cards.filter((card) => card.completed).map((card) => card.slug)
  );

  return MASTER_INVESTING_PRINCIPLES.map((principle) => ({
    ...principle,
    mastered: completedSlugs.has(principle.questSlug)
  }));
}

export function countMasteredPrinciples(
  cards: readonly BusinessHubQuestCard[]
): number {
  return resolveMasterInvestingPrinciples(cards).filter((p) => p.mastered).length;
}

/** Highest-order completed quest — gets the spotlight row on the panel. */
export function resolveLatestMasteredQuestSlug(
  cards: readonly BusinessHubQuestCard[]
): string | null {
  const completed = cards.filter((card) => card.completed);
  if (completed.length === 0) return null;

  return completed.reduce((latest, card) =>
    card.orderNumber > latest.orderNumber ? card : latest
  ).slug;
}

/** Next principle the learner is working toward (first incomplete in ladder order). */
export function resolveNextPrincipleToMaster(
  cards: readonly BusinessHubQuestCard[]
): MasterInvestingPrincipleState | null {
  return resolveMasterInvestingPrinciples(cards).find((p) => !p.mastered) ?? null;
}

/** Most recently mastered principle for the island academy sign spotlight. */
export function resolveLatestMasteredPrinciple(
  cards: readonly BusinessHubQuestCard[]
): MasterInvestingPrincipleState | null {
  const slug = resolveLatestMasteredQuestSlug(cards);
  if (!slug) return null;
  return (
    resolveMasterInvestingPrinciples(cards).find((p) => p.questSlug === slug) ??
    null
  );
}
