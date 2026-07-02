import { resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";
import { markSchoolsBusinessIslandHubEntered } from "@/lib/schools/schoolsBusinessIslandZoomEnter";

/** Map URL for the camera-zoom Business Island hub (replaces `/schools/business`). */
export function resolveSchoolsBusinessIslandMapHubHref(pathname: string): string {
  return resolveSchoolsLearnerHref("/schools/map", pathname);
}

/** Session flag so `/schools/map` restores the zoomed island hub after navigation. */
export function prepareSchoolsBusinessIslandMapHub(): void {
  markSchoolsBusinessIslandHubEntered();
}
