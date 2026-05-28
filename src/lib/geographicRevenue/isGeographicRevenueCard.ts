import type { PillarId } from "@/data/pillars";
import { CONTROLLED_DEMO_MODE } from "@/lib/demo/controlledDemo";

/** Quest sub-cards that should show the geographic revenue map as the main visual. */
export function isGeographicRevenueCard(
  pillarId: PillarId,
  questSlug: string,
  cardId: string | undefined,
  investorQuestion: string
): boolean {
  if (CONTROLLED_DEMO_MODE) return false;

  if (pillarId === "business" && questSlug === "why-buying" && cardId === "card-1") {
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
