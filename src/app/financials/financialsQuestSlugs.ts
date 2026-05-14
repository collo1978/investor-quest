/**
 * Financials island quest slugs — single source for `/financials/[section]`
 * routes and the island hotspot layer. Never derive from array index at
 * click time; always pass the slug string through.
 */
export const FINANCIALS_QUEST_SLUGS = [
  "growth",
  "profitability",
  "expenses",
  "cash",
  "financial-strength"
] as const;

export type FinancialsQuestSlug = (typeof FINANCIALS_QUEST_SLUGS)[number];

export function isFinancialsQuestSlug(value: string): value is FinancialsQuestSlug {
  return (FINANCIALS_QUEST_SLUGS as readonly string[]).includes(value);
}

export function financialsQuestPath(slug: FinancialsQuestSlug): string {
  return `/financials/${slug}`;
}
