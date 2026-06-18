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

type RouterLike = { replace: (href: string) => void; push?: (href: string) => void };

type NavigateSchoolsDemoStepOptions = {
  /** Full document navigation — avoids soft-router stalls on presenter entry. */
  hard?: boolean;
};

/** Ensure Schools demo story is active before advancing (PWA cold start / race-safe). */
export function ensureSchoolsDemoStoryReady(pathname: string): void {
  if (!isSchoolsDemoPath(pathname)) return;
  if (!wasSchoolsDemoLaunchedInSession()) {
    markSchoolsDemoLaunched();
  }
  ensureProductionSchoolsDemoFromPath(pathname);
}

/**
 * Advance scripted Schools tour and navigate — never rely on orchestrator alone.
 */
export function navigateSchoolsDemoStep(
  next: SchoolsDemoStoryStep,
  pathname: string,
  router: RouterLike,
  options?: NavigateSchoolsDemoStepOptions
): string {
  ensureSchoolsDemoStoryReady(pathname);
  advanceSchoolsDemoStoryStep(next);
  const target = getRouteForSchoolsDemoStoryStep(next);
  if (options?.hard && typeof window !== "undefined") {
    window.location.assign(target);
  } else {
    router.replace(target);
  }
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
