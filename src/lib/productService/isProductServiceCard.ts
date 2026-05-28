import type { PillarId } from "@/data/pillars";
import { CONTROLLED_DEMO_MODE } from "@/lib/demo/controlledDemo";

/** Quest sub-cards that should show the product/services visual as the main answer. */
export function isProductServiceCard(
  pillarId: PillarId,
  questSlug: string,
  cardId: string | undefined,
  investorQuestion: string
): boolean {
  // NVIDIA demo uses curated plain-English copy — not SEC product tables.
  if (CONTROLLED_DEMO_MODE) return false;

  if (pillarId === "business" && questSlug === "why-buying" && cardId === "card-2") {
    return true;
  }
  const q = investorQuestion.toLowerCase();
  return (
    /product|service/.test(q) &&
    /sell|offer|provide|revenue|what does/.test(q)
  );
}
