import type { BusinessChecklistSectionId } from "@/lib/business/businessInvestorFramework";
import { BUSINESS_SECTION_QUIZ_START_EVENT } from "@/lib/business/businessChecklistSectionQuizHelpers";
import { resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";

export const PENDING_CHECKLIST_SECTION_QUIZ_KEY = "iq-pending-checklist-section-quiz";

type RouterLike = { push: (href: string) => void };

export function markPendingChecklistSectionQuiz(sectionId: BusinessChecklistSectionId): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(PENDING_CHECKLIST_SECTION_QUIZ_KEY, sectionId);
  } catch {
    /* ignore */
  }
}

export function consumePendingChecklistSectionQuiz(): BusinessChecklistSectionId | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const value = sessionStorage.getItem(PENDING_CHECKLIST_SECTION_QUIZ_KEY);
    sessionStorage.removeItem(PENDING_CHECKLIST_SECTION_QUIZ_KEY);
    if (!value) return null;
    return value as BusinessChecklistSectionId;
  } catch {
    return null;
  }
}

export function dispatchChecklistSectionQuizStart(
  sectionId: BusinessChecklistSectionId,
  questSlug: string
): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(BUSINESS_SECTION_QUIZ_START_EVENT, {
      detail: { sectionId, questSlug }
    })
  );
}

/** Hub checklist tap — open the section quest, then start the section quiz. */
export function navigateToChecklistSectionQuiz(
  questSlug: string,
  sectionId: BusinessChecklistSectionId,
  pathname: string,
  router: RouterLike
): void {
  const target = resolveSchoolsLearnerHref(`/schools/business/${questSlug}`, pathname);
  const onQuestPage =
    pathname === target ||
    pathname.endsWith(`/business/${questSlug}`) ||
    pathname.endsWith(`/business/${questSlug}/`);

  if (onQuestPage) {
    dispatchChecklistSectionQuizStart(sectionId, questSlug);
    return;
  }

  markPendingChecklistSectionQuiz(sectionId);
  router.push(target);
}
