import type { CompanyId } from "@/data/companies";
import type { InvestorPrincipleId } from "@/lib/business/businessInvestorFramework";

export type InvestorEvidenceCardPhase = "read" | "rating" | "submitting";

function evidencePhaseStorageKey(
  companyId: CompanyId,
  principleId: InvestorPrincipleId
): string {
  return `iq-evidence-phases:${companyId}:${principleId}`;
}

export function readStoredInvestorEvidenceCardPhases(
  companyId: CompanyId,
  principleId: InvestorPrincipleId
): Partial<Record<string, InvestorEvidenceCardPhase>> {
  if (typeof sessionStorage === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(evidencePhaseStorageKey(companyId, principleId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<Record<string, InvestorEvidenceCardPhase>>;
    const sanitized: Partial<Record<string, InvestorEvidenceCardPhase>> = {};
    for (const [cardId, phase] of Object.entries(parsed)) {
      if (phase === "submitting") sanitized[cardId] = "rating";
      else if (phase === "read" || phase === "rating") sanitized[cardId] = phase;
    }
    return sanitized;
  } catch {
    return {};
  }
}

export function writeStoredInvestorEvidenceCardPhases(
  companyId: CompanyId,
  principleId: InvestorPrincipleId,
  phases: Partial<Record<string, InvestorEvidenceCardPhase>>
): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(
      evidencePhaseStorageKey(companyId, principleId),
      JSON.stringify(phases)
    );
  } catch {
    /* ignore quota */
  }
}

export function clearInvestorEvidencePhaseStorage(
  companyId: CompanyId,
  principleId: InvestorPrincipleId
): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(evidencePhaseStorageKey(companyId, principleId));
  } catch {
    /* ignore */
  }
}
