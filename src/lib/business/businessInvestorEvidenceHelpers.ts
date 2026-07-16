import type { CompanyId } from "@/data/companies";
import {
  resolveInvestorEvidenceCards,
  type BusinessInvestorEvidenceCardDef
} from "@/lib/business/businessInvestorEvidenceCards";
import { usesInvestorChallengeFlow } from "@/lib/business/businessInvestorChallengeFlow";
import type { InvestorPrincipleId } from "@/lib/business/businessInvestorFramework";
import {
  readBusinessInvestorFrameworkState,
  type BusinessInvestorFrameworkStoredState
} from "@/lib/business/businessInvestorFrameworkStorage";

export function evidenceCardsReadForPrinciple(
  principleId: InvestorPrincipleId,
  stored: BusinessInvestorFrameworkStoredState
): ReadonlySet<string> {
  const prefix = `${principleId}#`;
  const read = new Set<string>();
  for (const [key] of Object.entries(stored.evidenceCardsRead)) {
    if (!key.startsWith(prefix)) continue;
    read.add(key.slice(prefix.length));
  }
  return read;
}

export function isPrincipleEvidenceComplete(
  companyId: CompanyId,
  principleId: InvestorPrincipleId,
  stored?: BusinessInvestorFrameworkStoredState
): boolean {
  const state = stored ?? readBusinessInvestorFrameworkState(companyId);
  const cards = resolveInvestorEvidenceCards(companyId, principleId);
  if (cards.length === 0) return false;

  if (usesInvestorChallengeFlow(principleId)) {
    const read = evidenceCardsReadForPrinciple(principleId, state);
    const allRead = cards.every((card) => read.has(card.id));
    const challenge = state.principleChallengePassed[principleId];
    return allRead && (challenge === "great" || challenge === "good");
  }

  const rated = evidenceRatingsForPrincipleCards(principleId, state);
  return cards.every((card) => rated.has(card.id));
}

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

export function nextPrincipleEvidenceCard(
  companyId: CompanyId,
  principleId: InvestorPrincipleId,
  stored?: BusinessInvestorFrameworkStoredState
): BusinessInvestorEvidenceCardDef | null {
  const state = stored ?? readBusinessInvestorFrameworkState(companyId);
  const cards = resolveInvestorEvidenceCards(companyId, principleId);

  if (usesInvestorChallengeFlow(principleId)) {
    const read = evidenceCardsReadForPrinciple(principleId, state);
    return cards.find((card) => !read.has(card.id)) ?? null;
  }

  const rated = evidenceRatingsForPrincipleCards(principleId, state);
  return cards.find((card) => !rated.has(card.id)) ?? null;
}

export function principleEvidenceProgress(
  companyId: CompanyId,
  principleId: InvestorPrincipleId,
  stored?: BusinessInvestorFrameworkStoredState
): { completed: number; total: number } {
  const state = stored ?? readBusinessInvestorFrameworkState(companyId);
  const cards = resolveInvestorEvidenceCards(companyId, principleId);

  if (usesInvestorChallengeFlow(principleId)) {
    const read = evidenceCardsReadForPrinciple(principleId, state);
    return {
      completed: cards.filter((card) => read.has(card.id)).length,
      total: cards.length
    };
  }

  const rated = evidenceRatingsForPrincipleCards(principleId, state);
  return {
    completed: cards.filter((card) => rated.has(card.id)).length,
    total: cards.length
  };
}

export function isPrincipleChallengeFlowReadyForQuiz(
  companyId: CompanyId,
  principleId: InvestorPrincipleId,
  stored?: BusinessInvestorFrameworkStoredState
): boolean {
  return isPrincipleChallengeFlowReadyForExplain(companyId, principleId, stored);
}

/** Evidence complete — Investor Challenge (speak/type) is ready. */
export function isPrincipleChallengeFlowReadyForExplain(
  companyId: CompanyId,
  principleId: InvestorPrincipleId,
  stored?: BusinessInvestorFrameworkStoredState
): boolean {
  if (!usesInvestorChallengeFlow(principleId)) return false;
  const state = stored ?? readBusinessInvestorFrameworkState(companyId);
  const cards = resolveInvestorEvidenceCards(companyId, principleId);
  const read = evidenceCardsReadForPrinciple(principleId, state);
  return cards.length > 0 && cards.every((card) => read.has(card.id));
}
