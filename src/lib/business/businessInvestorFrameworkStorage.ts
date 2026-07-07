import type { CompanyId } from "@/data/companies";

import type {
  InvestorEvidenceRating,
  InvestorPrincipleId,
  BusinessChecklistSectionId
} from "@/lib/business/businessInvestorFramework";

const STORAGE_PREFIX = "iq-business-investor-framework";

export const BUSINESS_INVESTOR_FRAMEWORK_CHANGED_EVENT =
  "iq-business-investor-framework-changed";

/** Persisted adaptive checklist + evidence ratings (cards wired later). */
export type BusinessInvestorFrameworkStoredState = {
  /** Principle marked not applicable for this company. */
  naPrinciples: Partial<Record<InvestorPrincipleId, true>>;
  /** Key: `${principleId}#${evidenceCardId}` — populated when evidence cards ship. */
  evidenceRatings: Partial<Record<string, InvestorEvidenceRating>>;
  /** Section-end checklist quiz passed — unlocks next checklist section. */
  sectionQuizPassed: Partial<Record<BusinessChecklistSectionId, true>>;
};

function storageKey(companyId: CompanyId): string {
  return `${STORAGE_PREFIX}:${companyId}`;
}

function emptyState(): BusinessInvestorFrameworkStoredState {
  return { naPrinciples: {}, evidenceRatings: {}, sectionQuizPassed: {} };
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
