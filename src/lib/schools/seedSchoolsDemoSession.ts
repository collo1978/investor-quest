import { buildDemoGameState, DEMO_PROFILE_NEW_USER } from "@/lib/demo/demoProfiles";
import {
  clearDemoSessionFlags,
  setActiveDemoProfileLabel
} from "@/lib/demo/demoSessionReset";
import {
  clearPersistedSnapshots,
  savePersistedSnapshot
} from "@/engine/progression/persistence";
import { prepareSchoolsMapMissionBriefEntry } from "@/lib/schools/schoolsMapMissionBriefState";

export const SCHOOLS_DEMO_GAME_SEEDED_KEY = "iq-schools-demo-game-seeded";

/** Fresh demo save once per presenter session — mirrors sidebar launch reset. */
export function seedSchoolsDemoGameStateOncePerSession(): void {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(SCHOOLS_DEMO_GAME_SEEDED_KEY) === "1") return;
    clearDemoSessionFlags();
    clearPersistedSnapshots();
    prepareSchoolsMapMissionBriefEntry();
    setActiveDemoProfileLabel(DEMO_PROFILE_NEW_USER);
    savePersistedSnapshot(buildDemoGameState(DEMO_PROFILE_NEW_USER), {
      mergeIfDiskNewer: false
    });
    sessionStorage.setItem(SCHOOLS_DEMO_GAME_SEEDED_KEY, "1");
  } catch {
    /* ignore */
  }
}
