import { buildDemoGameState, DEMO_PROFILE_NEW_USER } from "@/lib/demo/demoProfiles";
import {
  clearDemoSessionFlags,
  setActiveDemoProfileLabel
} from "@/lib/demo/demoSessionReset";
import type { GameState } from "@/engine/progression/state";
import {
  clearPersistedSnapshots,
  savePersistedSnapshot
} from "@/engine/progression/persistence";
import { clearBusinessIslandBriefSeen } from "@/lib/businessIslandBriefSession";
import { resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";
import { dismissSchoolsMapMissionBrief } from "@/lib/schools/schoolsMapMissionBriefState";
import {
  ensureProductionSchoolsDemoFromPath,
  markSchoolsDemoLaunched,
  setSchoolsDemoStoryStep,
  wasSchoolsDemoLaunchedInSession
} from "@/lib/schools/schoolsDemoStoryMode";

export const SCHOOLS_DEMO_RESET_EVENT = "iq-schools-demo-reset";

/** Fresh presenter save — Business only, no quest reads, onboarding already done. */
export function buildSchoolsDemoPresenterResetState(): GameState {
  const base = buildDemoGameState(DEMO_PROFILE_NEW_USER);
  const now = Date.now();
  const companyId = base.activeCompanyId;
  const prog = base.companies[companyId];
  if (!prog) return base;

  return {
    ...base,
    onboarding: {
      step: 3,
      completedAt: now,
      openingScreenSeenAt: now,
      welcomeScreenSeenAt: now
    },
    companies: {
      ...base.companies,
      [companyId]: {
        ...prog,
        activePillarId: "business",
        activeQuestSlug: null,
        questMapBriefDismissedAt: now,
        businessIslandBriefDismissedAt: now
      }
    },
    lastActivityAt: now
  };
}

type ResetActions = {
  replaceGameState: (state: GameState) => void;
};

type ResetRouter = {
  replace: (href: string) => void;
};

/**
 * Reset Schools demo quest progress without replaying the opening tour.
 * Card 1 unlocked, other Business cards locked, map brief stays dismissed.
 */
export function resetSchoolsDemoProgress(
  pathname: string,
  router: ResetRouter,
  actions?: ResetActions
): void {
  if (!wasSchoolsDemoLaunchedInSession()) {
    markSchoolsDemoLaunched();
  }
  ensureProductionSchoolsDemoFromPath(pathname);

  clearDemoSessionFlags();
  clearBusinessIslandBriefSeen();
  dismissSchoolsMapMissionBrief();
  setActiveDemoProfileLabel(DEMO_PROFILE_NEW_USER);
  setSchoolsDemoStoryStep("map");

  const nextState = buildSchoolsDemoPresenterResetState();
  if (actions) {
    actions.replaceGameState(nextState);
  } else {
    clearPersistedSnapshots();
    savePersistedSnapshot(nextState, { mergeIfDiskNewer: false });
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SCHOOLS_DEMO_RESET_EVENT));
  }

  router.replace(resolveSchoolsLearnerHref("/schools/map", pathname));
}
