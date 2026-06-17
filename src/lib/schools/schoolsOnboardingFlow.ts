import { resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";

/** Scripted Schools onboarding order after avatar selection. */
export const SCHOOLS_ONBOARDING_FLOW = [
  "/schools/screen5-onboarding",
  "/schools/pick-interests",
  "/schools/company-reveal"
] as const;

export type SchoolsOnboardingFlowRoute =
  (typeof SCHOOLS_ONBOARDING_FLOW)[number];

const FLOW_INDEX = new Map<string, number>(
  SCHOOLS_ONBOARDING_FLOW.map((href, index) => [href, index])
);

export function isSchoolsOnboardingFlowRoute(
  pathname: string
): pathname is SchoolsOnboardingFlowRoute {
  const normalized = pathname.replace(/^\/schools\/demo/, "/schools");
  return FLOW_INDEX.has(normalized);
}

export function nextSchoolsOnboardingRoute(
  pathname: string
): SchoolsOnboardingFlowRoute | null {
  const normalized = pathname.replace(/^\/schools\/demo/, "/schools");
  const index = FLOW_INDEX.get(normalized);
  if (index == null || index >= SCHOOLS_ONBOARDING_FLOW.length - 1) {
    return null;
  }
  return SCHOOLS_ONBOARDING_FLOW[index + 1]!;
}

export function previousSchoolsOnboardingRoute(
  pathname: string
): SchoolsOnboardingFlowRoute | null {
  const normalized = pathname.replace(/^\/schools\/demo/, "/schools");
  const index = FLOW_INDEX.get(normalized);
  if (index == null || index <= 0) return null;
  return SCHOOLS_ONBOARDING_FLOW[index - 1]!;
}

/** Navigate within the Schools onboarding funnel (respects `/schools/demo` prefix). */
export function hrefForSchoolsOnboardingStep(
  route: SchoolsOnboardingFlowRoute,
  pathname?: string
): string {
  return resolveSchoolsLearnerHref(route, pathname);
}
