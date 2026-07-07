import {
  clearSchoolsBusinessIslandHubEntered,
  clearSchoolsBusinessIslandZoomEnter,
  clearSchoolsBusinessIslandZoomInProgress
} from "@/lib/schools/schoolsBusinessIslandZoomEnter";

/** Session-only dismiss for the Schools map mission brief (`/schools/map`). */
export const SCHOOLS_MAP_MISSION_BRIEF_STORAGE_KEY =
  "iq-schools-map-mission-brief-dismissed";

export function readSchoolsMapMissionBriefDismissed(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(SCHOOLS_MAP_MISSION_BRIEF_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissSchoolsMapMissionBrief(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(SCHOOLS_MAP_MISSION_BRIEF_STORAGE_KEY, "1");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("iq-schools-map-brief-dismissed"));
    }
  } catch {
    /* ignore */
  }
}

export function shouldShowSchoolsMapMissionBrief(): boolean {
  return !readSchoolsMapMissionBriefDismissed();
}

export function clearSchoolsMapMissionBriefDismiss(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(SCHOOLS_MAP_MISSION_BRIEF_STORAGE_KEY);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("iq-schools-map-brief-dismissed"));
    }
  } catch {
    /* ignore */
  }
}

/**
 * Reset map handoff state so the envelope mission brief always replays after
 * company selection — clears stale Business Island hub session flags.
 */
export function prepareSchoolsMapMissionBriefEntry(): void {
  clearSchoolsMapMissionBriefDismiss();
  clearSchoolsBusinessIslandHubEntered();
  clearSchoolsBusinessIslandZoomEnter();
  clearSchoolsBusinessIslandZoomInProgress();
}
