import type { CompanyId } from "@/data/companies";
import type {
  BusinessChecklistSectionId,
  InvestorPrincipleId
} from "@/lib/business/businessInvestorFramework";
import { resolveInvestorEvidenceCards } from "@/lib/business/businessInvestorEvidenceCards";
import { isPrincipleEvidenceComplete } from "@/lib/business/businessInvestorEvidenceHelpers";

/** Company Overview principles — sequential evidence paths on Quest 1. */
export const COMPANY_OVERVIEW_EVIDENCE_PRINCIPLES = [
  "business-purpose",
  "company-evolution",
  "global-presence"
] as const satisfies readonly InvestorPrincipleId[];

/** Products & Services principles — sequential evidence paths on Quest 2. */
export const PRODUCTS_SERVICES_EVIDENCE_PRINCIPLES = [
  "value-proposition",
  "product-portfolio",
  "innovation"
] as const satisfies readonly InvestorPrincipleId[];

/** Customers & Markets principles — sequential evidence paths on Quest 3. */
export const CUSTOMERS_MARKETS_EVIDENCE_PRINCIPLES = [
  "customer-base",
  "end-markets",
  "geographic-reach"
] as const satisfies readonly InvestorPrincipleId[];

/** Business Model principles — sequential evidence paths on Quest 4. */
export const BUSINESS_MODEL_EVIDENCE_PRINCIPLES = [
  "revenue-model",
  "revenue-drivers",
  "business-structure"
] as const satisfies readonly InvestorPrincipleId[];

export type CompanyOverviewEvidencePrinciple =
  (typeof COMPANY_OVERVIEW_EVIDENCE_PRINCIPLES)[number];

export type ProductsServicesEvidencePrinciple =
  (typeof PRODUCTS_SERVICES_EVIDENCE_PRINCIPLES)[number];

export type CustomersMarketsEvidencePrinciple =
  (typeof CUSTOMERS_MARKETS_EVIDENCE_PRINCIPLES)[number];

export type BusinessModelEvidencePrinciple =
  (typeof BUSINESS_MODEL_EVIDENCE_PRINCIPLES)[number];

/** Competitive Position principles — sequential evidence paths on Quest 5. */
export const COMPETITIVE_POSITION_EVIDENCE_PRINCIPLES = [
  "competitive-advantage",
  "market-position",
  "competitive-strategy"
] as const satisfies readonly InvestorPrincipleId[];

export type CompetitivePositionEvidencePrinciple =
  (typeof COMPETITIVE_POSITION_EVIDENCE_PRINCIPLES)[number];

export const SECTION_EVIDENCE_PRINCIPLES: Partial<
  Record<BusinessChecklistSectionId, readonly InvestorPrincipleId[]>
> = {
  "company-overview": COMPANY_OVERVIEW_EVIDENCE_PRINCIPLES,
  "products-services": PRODUCTS_SERVICES_EVIDENCE_PRINCIPLES,
  "customers-markets": CUSTOMERS_MARKETS_EVIDENCE_PRINCIPLES,
  "business-model": BUSINESS_MODEL_EVIDENCE_PRINCIPLES,
  "competitive-position": COMPETITIVE_POSITION_EVIDENCE_PRINCIPLES
};

export type PrincipleEvidenceQuestTrigger = {
  questSlug: string;
  cardId: string;
};

const PRINCIPLE_EVIDENCE_TRIGGERS: Partial<
  Record<InvestorPrincipleId, PrincipleEvidenceQuestTrigger>
> = {
  "business-purpose": { questSlug: "what-they-do", cardId: "card-1" },
  "company-evolution": { questSlug: "what-they-do", cardId: "card-2" },
  "global-presence": { questSlug: "what-they-do", cardId: "card-3" },
  "value-proposition": { questSlug: "why-buying", cardId: "card-1" },
  "product-portfolio": { questSlug: "why-buying", cardId: "card-2" },
  "innovation": { questSlug: "why-buying", cardId: "card-3" },
  "customer-base": { questSlug: "everyday-life", cardId: "card-1" },
  "end-markets": { questSlug: "everyday-life", cardId: "card-2" },
  "geographic-reach": { questSlug: "everyday-life", cardId: "card-3" },
  "revenue-model": { questSlug: "how-it-works", cardId: "card-1" },
  "revenue-drivers": { questSlug: "how-it-works", cardId: "card-2" },
  "business-structure": { questSlug: "how-it-works", cardId: "card-3" },
  "competitive-advantage": { questSlug: "competition", cardId: "card-1" },
  "market-position": { questSlug: "competition", cardId: "card-2" },
  "competitive-strategy": { questSlug: "competition", cardId: "card-3" }
};

export function resolveSectionEvidencePrinciples(
  sectionId: BusinessChecklistSectionId
): readonly InvestorPrincipleId[] {
  return SECTION_EVIDENCE_PRINCIPLES[sectionId] ?? [];
}

export function resolveNextSectionEvidencePrinciple(
  sectionId: BusinessChecklistSectionId,
  principleId: InvestorPrincipleId
): InvestorPrincipleId | null {
  const principles = resolveSectionEvidencePrinciples(sectionId);
  const idx = principles.indexOf(principleId);
  if (idx < 0 || idx >= principles.length - 1) {
    return null;
  }
  return principles[idx + 1] ?? null;
}

export function resolveNextCompanyOverviewEvidencePrinciple(
  principleId: InvestorPrincipleId
): InvestorPrincipleId | null {
  return resolveNextSectionEvidencePrinciple("company-overview", principleId);
}

export function resolvePrincipleForQuestEvidenceTrigger(
  questSlug: string,
  cardId: string
): InvestorPrincipleId | null {
  for (const principles of Object.values(SECTION_EVIDENCE_PRINCIPLES)) {
    if (!principles) continue;
    for (const principleId of principles) {
      const trigger = PRINCIPLE_EVIDENCE_TRIGGERS[principleId];
      if (trigger?.questSlug === questSlug && trigger.cardId === cardId) {
        return principleId;
      }
    }
  }
  return null;
}

export function resolvePrincipleEvidenceTrigger(
  principleId: InvestorPrincipleId
): PrincipleEvidenceQuestTrigger | null {
  return PRINCIPLE_EVIDENCE_TRIGGERS[principleId] ?? null;
}

export function principleHasEvidenceCards(
  companyId: CompanyId,
  principleId: InvestorPrincipleId
): boolean {
  return resolveInvestorEvidenceCards(companyId, principleId).length > 0;
}

export function questSlugHasSectionEvidence(
  companyId: CompanyId,
  questSlug: string
): boolean {
  for (const principles of Object.values(SECTION_EVIDENCE_PRINCIPLES)) {
    if (!principles) continue;
    for (const principleId of principles) {
      const trigger = PRINCIPLE_EVIDENCE_TRIGGERS[principleId];
      if (trigger?.questSlug !== questSlug) continue;
      if (principleHasEvidenceCards(companyId, principleId)) return true;
    }
  }
  return false;
}

/** Prior principles must be evidence-complete before this path can open. */
export function canStartPrincipleEvidenceFlow(
  companyId: CompanyId,
  principleId: InvestorPrincipleId
): boolean {
  if (!principleHasEvidenceCards(companyId, principleId)) return false;
  if (isPrincipleEvidenceComplete(companyId, principleId)) return false;

  const sectionId = resolveSectionIdForEvidencePrinciple(principleId);
  if (!sectionId) return true;

  const principles = resolveSectionEvidencePrinciples(sectionId);
  const idx = principles.indexOf(principleId);
  if (idx < 0) return true;

  for (let i = 0; i < idx; i++) {
    const prior = principles[i]!;
    if (!isPrincipleEvidenceComplete(companyId, prior)) return false;
  }
  return true;
}

export function resolveSectionIdForEvidencePrinciple(
  principleId: InvestorPrincipleId
): BusinessChecklistSectionId | null {
  for (const [sectionId, principles] of Object.entries(SECTION_EVIDENCE_PRINCIPLES)) {
    if (principles?.includes(principleId)) {
      return sectionId as BusinessChecklistSectionId;
    }
  }
  return null;
}
