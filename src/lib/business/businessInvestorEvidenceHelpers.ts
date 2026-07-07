import type { CompanyId } from "@/data/companies";
import {
  resolveInvestorEvidenceCards,
  type BusinessInvestorEvidenceCardDef
} from "@/lib/business/businessInvestorEvidenceCards";
import type { InvestorPrincipleId } from "@/lib/business/businessInvestorFramework";
import {
  readBusinessInvestorFrameworkState,
  type BusinessInvestorFrameworkStoredState
} from "@/lib/business/businessInvestorFrameworkStorage";

export function evidenceRatingsForPrincipleCards(
  principleId: InvestorPrincipleId,
  stored: BusinessInvestorFrameworkStoredState
): ReadonlySet<string> {
  const prefix = `${principleId}#`;
  const rated = new Set<string>();
  for (const [key] of Object.entries(stored.evidenceRatings)) {
    if (!key.startsWith(prefix)) continue;
    rated.add(key.slice(prefix.length));
  }
  return rated;
}

export function isPrincipleEvidenceComplete(
  companyId: CompanyId,
  principleId: InvestorPrincipleId,
  stored?: BusinessInvestorFrameworkStoredState
): boolean {
  const state = stored ?? readBusinessInvestorFrameworkState(companyId);
  const cards = resolveInvestorEvidenceCards(companyId, principleId);
  if (cards.length === 0) return false;
  const rated = evidenceRatingsForPrincipleCards(principleId, state);
  return cards.every((card) => rated.has(card.id));
}

export function nextPrincipleEvidenceCard(
  companyId: CompanyId,
  principleId: InvestorPrincipleId,
  stored?: BusinessInvestorFrameworkStoredState
): BusinessInvestorEvidenceCardDef | null {
  const state = stored ?? readBusinessInvestorFrameworkState(companyId);
  const rated = evidenceRatingsForPrincipleCards(principleId, state);
  const cards = resolveInvestorEvidenceCards(companyId, principleId);
  return cards.find((card) => !rated.has(card.id)) ?? null;
}

export function principleEvidenceProgress(
  companyId: CompanyId,
  principleId: InvestorPrincipleId,
  stored?: BusinessInvestorFrameworkStoredState
): { completed: number; total: number } {
  const state = stored ?? readBusinessInvestorFrameworkState(companyId);
  const cards = resolveInvestorEvidenceCards(companyId, principleId);
  const rated = evidenceRatingsForPrincipleCards(principleId, state);
  return {
    completed: cards.filter((card) => rated.has(card.id)).length,
    total: cards.length
  };
}
