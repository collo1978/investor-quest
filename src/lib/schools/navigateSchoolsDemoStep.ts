import { isSchoolsDemoPath, resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";
import {
  advanceSchoolsDemoStoryStep,
  ensureProductionSchoolsDemoFromPath,
  getRouteForSchoolsDemoStoryStep,
  markSchoolsDemoLaunched,
  schoolsDemoStepFromPathname,
  setSchoolsDemoStoryStep,
  wasSchoolsDemoLaunchedInSession,
  type SchoolsDemoStoryStep
} from "@/lib/schools/schoolsDemoStoryMode";
import { clearSchoolsMapMissionBriefDismiss } from "@/lib/schools/schoolsMapMissionBriefState";
import { seedSchoolsDemoGameStateOncePerSession } from "@/lib/schools/seedSchoolsDemoSession";

type RouterLike = { replace: (href: string) => void; push?: (href: string) => void };

function resolveNavigateTarget(
  next: SchoolsDemoStoryStep,
  pathname: string
): string {
  const stepRoute = getRouteForSchoolsDemoStoryStep(next);
  if (!isSchoolsDemoPath(pathname)) return stepRoute;
  const learnerPath = stepRoute.startsWith("/schools/demo")
    ? stepRoute.replace("/schools/demo", "/schools")
    : stepRoute;
  return resolveSchoolsLearnerHref(learnerPath, pathname);
}

/** Ensure Schools demo story is active before advancing (PWA cold start / race-safe). */
export function ensureSchoolsDemoStoryReady(pathname: string): void {
  if (!isSchoolsDemoPath(pathname)) return;
  if (!wasSchoolsDemoLaunchedInSession()) {
    markSchoolsDemoLaunched();
    seedSchoolsDemoGameStateOncePerSession();
  }
  ensureProductionSchoolsDemoFromPath(pathname);
}

/**
 * Advance scripted Schools tour and navigate — never rely on orchestrator alone.
 */
export function navigateSchoolsDemoStep(
  next: SchoolsDemoStoryStep,
  pathname: string,
  router: RouterLike
): string {
  ensureSchoolsDemoStoryReady(pathname);
  if (next === "map-brief") {
    clearSchoolsMapMissionBriefDismiss();
  }
  advanceSchoolsDemoStoryStep(next);
  const target = resolveNavigateTarget(next, pathname);
  router.replace(target);
  return target;
}

/** Hamburger hub jumps — sync story step (including backward) then navigate. */
export function navigateSchoolsDemoMenuHref(
  schoolsPath: string,
  pathname: string,
  router: RouterLike
): string {
  ensureSchoolsDemoStoryReady(pathname);
  const target = resolveSchoolsLearnerHref(schoolsPath, pathname);
  const inferred = schoolsDemoStepFromPathname(target);
  if (inferred) {
    setSchoolsDemoStoryStep(inferred);
  }
  if (router.push) {
    router.push(target);
  } else {
    router.replace(target);
  }
  return target;
}
