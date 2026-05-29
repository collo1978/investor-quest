import { isSchoolsDemoPath } from "@/lib/schools/schoolsDemoHref";
import {
  advanceSchoolsDemoStoryStep,
  ensureProductionSchoolsDemoFromPath,
  getRouteForSchoolsDemoStoryStep,
  hydrateSchoolsDemoStoryFromSession,
  isSchoolsDemoStoryModeActive,
  type SchoolsDemoStoryStep
} from "@/lib/schools/schoolsDemoStoryMode";

type RouterLike = { replace: (href: string) => void };

/** Ensure Schools demo story is active before advancing (PWA cold start / race-safe). */
export function ensureSchoolsDemoStoryReady(pathname: string): void {
  if (isSchoolsDemoPath(pathname)) {
    ensureProductionSchoolsDemoFromPath(pathname);
    return;
  }
  if (!isSchoolsDemoStoryModeActive()) {
    hydrateSchoolsDemoStoryFromSession();
  }
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
  advanceSchoolsDemoStoryStep(next);
  const target = getRouteForSchoolsDemoStoryStep(next);
  router.replace(target);
  return target;
}
