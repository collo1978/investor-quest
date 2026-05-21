import type { PillarId } from "@/data/pillars";

/** Quest sub-cards that should show the product/services visual as the main answer. */
export function isProductServiceCard(
  pillarId: PillarId,
  questSlug: string,
  cardId: string | undefined,
  investorQuestion: string
): boolean {
  if (pillarId === "business" && questSlug === "revenue" && cardId === "card-1") {
    return true;
  }
  const q = investorQuestion.toLowerCase();
  return (
    /product|service/.test(q) &&
    /sell|offer|provide|revenue|what does/.test(q)
  );
}
