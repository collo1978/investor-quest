import type { InvestorPrincipleId } from "@/lib/business/businessInvestorFramework";
import { resolvePrincipleEvidenceTrigger } from "@/lib/business/businessInvestorEvidenceFlowHelpers";
import { usesInvestorMissionFlow } from "@/lib/business/businessInvestorMissionFlow";
import { resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";

export const PENDING_INVESTOR_MISSION_KEY = "iq-pending-investor-mission";

export const BUSINESS_MISSION_STEP_START_EVENT = "iq-business-mission-step-start";

/** Evidence card id, or `challenge` for the investor challenge step. */
export type InvestorMissionStepId = string;

export type InvestorMissionStepTarget =
  | { type: "evidence"; cardId: string }
  | { type: "challenge" };

type RouterLike = { push: (href: string) => void };

export function resolveMissionStepTarget(
  stepId: InvestorMissionStepId
): InvestorMissionStepTarget {
  if (stepId === "challenge" || stepId === "quiz") return { type: "challenge" };
  return { type: "evidence", cardId: stepId };
}

export function dispatchMissionStepStart(
  principleId: InvestorPrincipleId,
  stepId: InvestorMissionStepId,
  questSlug: string
): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(BUSINESS_MISSION_STEP_START_EVENT, {
      detail: { principleId, stepId, questSlug }
    })
  );
}

export function markPendingInvestorMission(principleId: InvestorPrincipleId): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(PENDING_INVESTOR_MISSION_KEY, principleId);
  } catch {
    /* ignore */
  }
}

export function consumePendingInvestorMission(): InvestorPrincipleId | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const value = sessionStorage.getItem(PENDING_INVESTOR_MISSION_KEY);
    sessionStorage.removeItem(PENDING_INVESTOR_MISSION_KEY);
    if (!value) return null;
    return value as InvestorPrincipleId;
  } catch {
    return null;
  }
}

/** Island hub — mission brief confirmed; open quest cards for this principle. */
export function startInvestorMissionFromHub(
  principleId: InvestorPrincipleId,
  pathname: string,
  router: RouterLike
): void {
  if (!usesInvestorMissionFlow(principleId)) return;
  const trigger = resolvePrincipleEvidenceTrigger(principleId);
  if (!trigger) return;

  markPendingInvestorMission(principleId);
  router.push(
    resolveSchoolsLearnerHref(`/schools/business/${trigger.questSlug}`, pathname)
  );
}

/** Mission tracker tap — open quest page if needed, then launch the step in the main column. */
export function navigateToMissionStep(
  principleId: InvestorPrincipleId,
  stepId: InvestorMissionStepId,
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
    dispatchMissionStepStart(principleId, stepId, trigger.questSlug);
    return;
  }

  router.push(target);
  window.setTimeout(() => {
    dispatchMissionStepStart(principleId, stepId, trigger.questSlug);
  }, 120);
}
