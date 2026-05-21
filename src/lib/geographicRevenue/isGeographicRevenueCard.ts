import type { PillarId } from "@/data/pillars";

/** Quest sub-cards that should show the geographic revenue map as the main visual. */
export function isGeographicRevenueCard(
  pillarId: PillarId,
  questSlug: string,
  cardId: string | undefined,
  investorQuestion: string
): boolean {
  if (pillarId === "business" && questSlug === "revenue" && cardId === "card-2") {
    return true;
  }
  if (pillarId === "financials" && questSlug === "growth" && cardId === "card-3") {
    return true;
  }
  const q = investorQuestion.toLowerCase();
  return (
    /geographic|region/.test(q) &&
    /revenue|market|sell|breakdown/.test(q)
  );
}
