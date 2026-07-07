import type { CompanyId } from "@/data/companies";
import type {
  BusinessChecklistSectionId,
  BusinessChecklistSectionView
} from "@/lib/business/businessInvestorFramework";
import {
  BUSINESS_INVESTOR_CHECKLIST_SECTIONS,
  DEFAULT_NA_PRINCIPLES_BY_COMPANY,
  principlesForSection
} from "@/lib/business/businessInvestorFramework";
import type { BusinessInvestorFrameworkStoredState } from "@/lib/business/businessInvestorFrameworkStorage";
import { readBusinessInvestorFrameworkState } from "@/lib/business/businessInvestorFrameworkStorage";
import { isPrincipleEvidenceComplete } from "@/lib/business/businessInvestorEvidenceHelpers";

export type ChecklistSectionQuizStatus = "locked" | "ready" | "passed";

export const BUSINESS_SECTION_QUIZ_START_EVENT = "iq-business-section-quiz-start";

export const BUSINESS_SECTION_QUIZ_GLOW_EVENT = "iq-business-section-quiz-glow";

function isPrincipleNaForCompany(
  principleId: BusinessChecklistSectionView["principles"][number]["id"],
  companyId: CompanyId,
  stored: BusinessInvestorFrameworkStoredState
): boolean {
  if (stored.naPrinciples[principleId]) return true;
  return (DEFAULT_NA_PRINCIPLES_BY_COMPANY[companyId] ?? []).includes(principleId);
}

/** Every applicable principle in the section has all evidence cards rated. */
export function isSectionPrinciplesEvidenceComplete(
  companyId: CompanyId,
  sectionId: BusinessChecklistSectionId,
  stored?: BusinessInvestorFrameworkStoredState
): boolean {
  const state = stored ?? readBusinessInvestorFrameworkState(companyId);
  const applicable = principlesForSection(sectionId).filter(
    (principle) => !isPrincipleNaForCompany(principle.id, companyId, state)
  );
  if (applicable.length === 0) return false;
  return applicable.every((principle) =>
    isPrincipleEvidenceComplete(companyId, principle.id, state)
  );
}

export function isSectionQuizPassed(
  sectionId: BusinessChecklistSectionId,
  stored: BusinessInvestorFrameworkStoredState
): boolean {
  return stored.sectionQuizPassed?.[sectionId] === true;
}

export function resolveSectionQuizStatus(input: {
  sectionId: BusinessChecklistSectionId;
  sectionUnlocked: boolean;
  companyId: CompanyId;
  stored: BusinessInvestorFrameworkStoredState;
}): ChecklistSectionQuizStatus {
  if (input.stored.sectionQuizPassed?.[input.sectionId]) return "passed";
  if (!input.sectionUnlocked) return "locked";
  if (
    isSectionPrinciplesEvidenceComplete(
      input.companyId,
      input.sectionId,
      input.stored
    )
  ) {
    return "ready";
  }
  return "locked";
}

export function resolveChecklistSectionByQuestSlug(
  questSlug: string
): (typeof BUSINESS_INVESTOR_CHECKLIST_SECTIONS)[number] | null {
  return (
    BUSINESS_INVESTOR_CHECKLIST_SECTIONS.find(
      (section) => section.questSlug === questSlug
    ) ?? null
  );
}
