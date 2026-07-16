import type { InvestorPrincipleId } from "@/lib/business/businessInvestorFramework";
import { resolvePrincipleEvidenceTrigger } from "@/lib/business/businessInvestorEvidenceFlowHelpers";
import { resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";

export const BUSINESS_PRINCIPLE_REVIEW_START_EVENT = "iq-business-principle-review-start";

export const PENDING_CHECKLIST_PRINCIPLE_REVIEW_KEY = "iq-pending-checklist-principle-review";

type RouterLike = { push: (href: string) => void };

export function markPendingChecklistPrincipleReview(
  principleId: InvestorPrincipleId
): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(PENDING_CHECKLIST_PRINCIPLE_REVIEW_KEY, principleId);
  } catch {
    /* ignore */
  }
}

export function consumePendingChecklistPrincipleReview(): InvestorPrincipleId | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const value = sessionStorage.getItem(PENDING_CHECKLIST_PRINCIPLE_REVIEW_KEY);
    sessionStorage.removeItem(PENDING_CHECKLIST_PRINCIPLE_REVIEW_KEY);
    if (!value) return null;
    return value as InvestorPrincipleId;
  } catch {
    return null;
  }
}

export function dispatchChecklistPrincipleReviewStart(
  principleId: InvestorPrincipleId,
  questSlug: string
): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(BUSINESS_PRINCIPLE_REVIEW_START_EVENT, {
      detail: { principleId, questSlug }
    })
  );
}

/** Checklist principle tap — open the section quest, then review that principle's evidence. */
export function navigateToChecklistPrincipleReview(
  principleId: InvestorPrincipleId,
  pathname: string,
  router: RouterLike
): void {
  const trigger = resolvePrincipleEvidenceTrigger(principleId);
  if (!trigger) return;

  const target = resolveSchoolsLearnerHref(
    `/schools/business/${trigger.questSlug}`,
    pathname
  );
  const onQuestPage =
    pathname === target ||
    pathname.endsWith(`/business/${trigger.questSlug}`) ||
    pathname.endsWith(`/business/${trigger.questSlug}/`);

  if (onQuestPage) {
    dispatchChecklistPrincipleReviewStart(principleId, trigger.questSlug);
    return;
  }

  markPendingChecklistPrincipleReview(principleId);
  router.push(target);
}
