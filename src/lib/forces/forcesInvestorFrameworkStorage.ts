import type { CompanyId } from "@/data/companies";

import type {
  ForcesChecklistSectionId,
  ForcesInvestorPrincipleId
} from "@/lib/forces/forcesInvestorFramework";

const STORAGE_PREFIX = "iq-forces-investor-framework";

export const FORCES_INVESTOR_FRAMEWORK_CHANGED_EVENT =
  "iq-forces-investor-framework-changed";

/** Persisted Risk Island checklist progress — evidence and quizzes wired later. */
export type ForcesInvestorFrameworkStoredState = {
  /** Principle marked not applicable for this company. */
  naPrinciples: Partial<Record<ForcesInvestorPrincipleId, true>>;
  /** Key: `${principleId}#${evidenceCardId}` — populated when evidence cards ship. */
  evidenceRatings: Partial<Record<string, "strong" | "weak">>;
  /** Section-end checklist quiz passed — unlocks next checklist section. */
  sectionQuizPassed: Partial<Record<ForcesChecklistSectionId, true>>;
};

function storageKey(companyId: CompanyId): string {
  return `${STORAGE_PREFIX}:${companyId}`;
}

function emptyState(): ForcesInvestorFrameworkStoredState {
  return { naPrinciples: {}, evidenceRatings: {}, sectionQuizPassed: {} };
}

export function readForcesInvestorFrameworkState(
  companyId: CompanyId
): ForcesInvestorFrameworkStoredState {
  if (typeof localStorage === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(storageKey(companyId));
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as ForcesInvestorFrameworkStoredState;
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
  state: ForcesInvestorFrameworkStoredState
): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(storageKey(companyId), JSON.stringify(state));
    window.dispatchEvent(new Event(FORCES_INVESTOR_FRAMEWORK_CHANGED_EVENT));
  } catch {
    /* ignore quota */
  }
}

export function clearForcesInvestorFrameworkState(companyId: CompanyId): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(storageKey(companyId));
    window.dispatchEvent(new Event(FORCES_INVESTOR_FRAMEWORK_CHANGED_EVENT));
  } catch {
    /* ignore */
  }
}

export function markForcesSectionQuizPassed(
  companyId: CompanyId,
  sectionId: ForcesChecklistSectionId
): ForcesInvestorFrameworkStoredState {
  const state = readForcesInvestorFrameworkState(companyId);
  state.sectionQuizPassed[sectionId] = true;
  writeState(companyId, state);
  return state;
}
