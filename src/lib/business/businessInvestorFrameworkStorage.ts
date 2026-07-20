import type { CompanyId } from "@/data/companies";

import type {
  InvestorEvidenceRating,
  InvestorPrincipleId,
  BusinessChecklistSectionId
} from "@/lib/business/businessInvestorFramework";
import type { InvestorChallengeOutcome } from "@/lib/business/businessInvestorChallengeFlow";

const STORAGE_PREFIX = "iq-business-investor-framework";

export const BUSINESS_INVESTOR_FRAMEWORK_CHANGED_EVENT =
  "iq-business-investor-framework-changed";

export type BusinessInvestorFrameworkStoredState = {
  /** Principle marked not applicable for this company. */
  naPrinciples: Partial<Record<InvestorPrincipleId, true>>;
  /** Key: `${principleId}#${evidenceCardId}` — thumbs rating (legacy principles). */
  evidenceRatings: Partial<Record<string, InvestorEvidenceRating>>;
  /** Key: `${principleId}#${evidenceCardId}` — evidence card read (challenge flow). */
  evidenceCardsRead: Partial<Record<string, true>>;
  /** Legacy: principle quiz flag (no longer required; Investor Challenge gates completion). */
  principleQuizPassed: Partial<Record<InvestorPrincipleId, true>>;
  /** Explain-in-your-own-words challenge passed (challenge flow). */
  principleChallengePassed: Partial<Record<InvestorPrincipleId, InvestorChallengeOutcome>>;
  /** Section-end checklist quiz passed — unlocks next checklist section. */
  sectionQuizPassed: Partial<Record<BusinessChecklistSectionId, true>>;
};

function storageKey(companyId: CompanyId): string {
  return `${STORAGE_PREFIX}:${companyId}`;
}

function emptyState(): BusinessInvestorFrameworkStoredState {
  return {
    naPrinciples: {},
    evidenceRatings: {},
    evidenceCardsRead: {},
    principleQuizPassed: {},
    principleChallengePassed: {},
    sectionQuizPassed: {}
  };
}

export function readBusinessInvestorFrameworkState(
  companyId: CompanyId
): BusinessInvestorFrameworkStoredState {
  if (typeof localStorage === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(storageKey(companyId));
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as BusinessInvestorFrameworkStoredState;
    return {
      naPrinciples: parsed.naPrinciples ?? {},
      evidenceRatings: parsed.evidenceRatings ?? {},
      evidenceCardsRead: parsed.evidenceCardsRead ?? {},
      principleQuizPassed: parsed.principleQuizPassed ?? {},
      principleChallengePassed: parsed.principleChallengePassed ?? {},
      sectionQuizPassed: parsed.sectionQuizPassed ?? {}
    };
  } catch {
    return emptyState();
  }
}

function writeState(
  companyId: CompanyId,
  state: BusinessInvestorFrameworkStoredState
): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(storageKey(companyId), JSON.stringify(state));
    window.dispatchEvent(new Event(BUSINESS_INVESTOR_FRAMEWORK_CHANGED_EVENT));
  } catch {
    /* ignore quota */
  }
}

export function clearBusinessInvestorFrameworkState(companyId: CompanyId): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(storageKey(companyId));
    window.dispatchEvent(new Event(BUSINESS_INVESTOR_FRAMEWORK_CHANGED_EVENT));
  } catch {
    /* ignore */
  }
}

export function setPrincipleNa(
  companyId: CompanyId,
  principleId: InvestorPrincipleId,
  isNa: boolean
): BusinessInvestorFrameworkStoredState {
  const state = readBusinessInvestorFrameworkState(companyId);
  if (isNa) {
    state.naPrinciples[principleId] = true;
  } else {
    delete state.naPrinciples[principleId];
  }
  writeState(companyId, state);
  return state;
}

/** Save one evidence rating — recomputes principle + section upstream. */
export function saveEvidenceRating(
  companyId: CompanyId,
  principleId: InvestorPrincipleId,
  evidenceCardId: string,
  rating: InvestorEvidenceRating
): BusinessInvestorFrameworkStoredState {
  const state = readBusinessInvestorFrameworkState(companyId);
  state.evidenceRatings[`${principleId}#${evidenceCardId}`] = rating;
  writeState(companyId, state);
  return state;
}

/** Mark a checklist section quiz passed — unlocks the next section. */
export function markSectionQuizPassed(
  companyId: CompanyId,
  sectionId: BusinessChecklistSectionId
): BusinessInvestorFrameworkStoredState {
  const state = readBusinessInvestorFrameworkState(companyId);
  state.sectionQuizPassed[sectionId] = true;
  writeState(companyId, state);
  return state;
}

export function saveEvidenceCardRead(
  companyId: CompanyId,
  principleId: InvestorPrincipleId,
  evidenceCardId: string
): BusinessInvestorFrameworkStoredState {
  const state = readBusinessInvestorFrameworkState(companyId);
  state.evidenceCardsRead[`${principleId}#${evidenceCardId}`] = true;
  writeState(companyId, state);
  return state;
}

export function markPrincipleQuizPassed(
  companyId: CompanyId,
  principleId: InvestorPrincipleId
): BusinessInvestorFrameworkStoredState {
  const state = readBusinessInvestorFrameworkState(companyId);
  state.principleQuizPassed[principleId] = true;
  writeState(companyId, state);
  return state;
}

export function savePrincipleChallengeOutcome(
  companyId: CompanyId,
  principleId: InvestorPrincipleId,
  outcome: InvestorChallengeOutcome
): BusinessInvestorFrameworkStoredState {
  const state = readBusinessInvestorFrameworkState(companyId);
  if (outcome === "retry") {
    writeState(companyId, state);
    return state;
  }

  state.principleChallengePassed[principleId] = outcome;

  for (const key of Object.keys(state.evidenceCardsRead)) {
    if (!key.startsWith(`${principleId}#`)) continue;
    state.evidenceRatings[key] = outcome === "great" ? "strong" : "weak";
  }

  writeState(companyId, state);
  return state;
}

/** Demo/QA: wipe Company Evolution reads + challenge so the timeline starts fresh. */
export function resetCompanyEvolutionProgress(
  companyId: CompanyId
): BusinessInvestorFrameworkStoredState {
  const state = readBusinessInvestorFrameworkState(companyId);
  const principleId: InvestorPrincipleId = "company-evolution";

  for (const key of Object.keys(state.evidenceCardsRead)) {
    if (key.startsWith(`${principleId}#`)) {
      delete state.evidenceCardsRead[key];
    }
  }
  for (const key of Object.keys(state.evidenceRatings)) {
    if (key.startsWith(`${principleId}#`)) {
      delete state.evidenceRatings[key];
    }
  }
  delete state.principleChallengePassed[principleId];
  delete state.principleQuizPassed[principleId];

  writeState(companyId, state);
  return state;
}
