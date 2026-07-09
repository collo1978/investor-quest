import { buildDemoGameState, buildFreshSchoolsBusinessDemoProgress, DEMO_PROFILE_NEW_USER } from "@/lib/demo/demoProfiles";
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
import { CONTROLLED_DEMO_COMPANY_ID } from "@/lib/demo/controlledDemo";
import { clearAllHubCardRevealForPillar } from "@/lib/quests/hubCardRevealStorage";
import { clearInvestorQualityChecklist, syncChecklistEvidenceFromReadSlugs } from "@/lib/business/investorQualityChecklistStorage";
import { clearBusinessInvestorFrameworkState } from "@/lib/business/businessInvestorFrameworkStorage";
import { clearForcesInvestorFrameworkState } from "@/lib/forces/forcesInvestorFrameworkStorage";
import { clearInvestorEvidencePhaseStorage } from "@/lib/business/businessInvestorEvidencePhaseStorage";
import { clearQuestChecklistSessions } from "@/lib/business/investorQualityQuestSession";
import { resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";
import { prepareSchoolsMapMissionBriefEntry } from "@/lib/schools/schoolsMapMissionBriefState";
import {
  clearSchoolsBusinessIslandHubEntered,
  clearSchoolsBusinessIslandZoomEnter
} from "@/lib/schools/schoolsBusinessIslandZoomEnter";
import { clearSchoolsHubCelebrateReturn, clearSchoolsQuestSummaryExited } from "@/lib/schools/schoolsQuestRewardFlow";
import {
  ensureProductionSchoolsDemoFromPath,
  markSchoolsDemoLaunched,
  markSchoolsDemoMapBriefPending,
  setSchoolsDemoStoryStep,
  wasSchoolsDemoLaunchedInSession
} from "@/lib/schools/schoolsDemoStoryMode";

export const SCHOOLS_DEMO_RESET_EVENT = "iq-schools-demo-reset";

/** Fresh presenter save — Business card 1 only, no quest reads, onboarding already done. */
export function buildSchoolsDemoPresenterResetState(): GameState {
  const base = buildDemoGameState(DEMO_PROFILE_NEW_USER);
  const now = Date.now();
  const companyId = base.activeCompanyId;

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
        ...buildFreshSchoolsBusinessDemoProgress(),
        activePillarId: "business",
        activeQuestSlug: null
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
 * Business Island returns to 0/7 — card 1 unlocked, map envelope brief replays.
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
  prepareSchoolsMapMissionBriefEntry();
  clearSchoolsQuestSummaryExited();
  clearSchoolsHubCelebrateReturn();
  clearSchoolsBusinessIslandZoomEnter();
  clearSchoolsBusinessIslandHubEntered();
  clearAllHubCardRevealForPillar(CONTROLLED_DEMO_COMPANY_ID, "business");
  clearInvestorQualityChecklist(CONTROLLED_DEMO_COMPANY_ID);
  clearBusinessInvestorFrameworkState(CONTROLLED_DEMO_COMPANY_ID);
  clearForcesInvestorFrameworkState(CONTROLLED_DEMO_COMPANY_ID);
  clearInvestorEvidencePhaseStorage(CONTROLLED_DEMO_COMPANY_ID, "business-purpose");
  clearQuestChecklistSessions(CONTROLLED_DEMO_COMPANY_ID);
  syncChecklistEvidenceFromReadSlugs(CONTROLLED_DEMO_COMPANY_ID, []);
  setActiveDemoProfileLabel(DEMO_PROFILE_NEW_USER);
  markSchoolsDemoMapBriefPending();
  setSchoolsDemoStoryStep("map-brief");

  const nextState = buildSchoolsDemoPresenterResetState();
  /** Always persist — replaceGameState skips disk writes during isolated demo story mode. */
  clearPersistedSnapshots();
  savePersistedSnapshot(nextState, { mergeIfDiskNewer: false });
  if (actions) {
    actions.replaceGameState(nextState);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SCHOOLS_DEMO_RESET_EVENT));
  }

  router.replace(resolveSchoolsLearnerHref("/schools/map", pathname));
}
