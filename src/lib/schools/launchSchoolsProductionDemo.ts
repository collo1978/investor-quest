import { clearPersistedSnapshots } from "@/engine/progression/persistence";
import { deactivateDemoStory } from "@/lib/demo/demoStoryMode";
import { buildDemoGameState, DEMO_PROFILE_NEW_USER } from "@/lib/demo/demoProfiles";
import {
  clearDemoSessionFlags,
  rotateOnboardingGuestId,
  setActiveDemoProfileLabel
} from "@/lib/demo/demoSessionReset";
import { prefetchStartupAssets } from "@/lib/startup/prefetchStartupAssets";
import { preloadQuestDetailChunks } from "@/lib/quests/preloadQuestDetailChunks";
import {
  activateSchoolsDemoStory,
  deactivateSchoolsDemoStory,
  getRouteForSchoolsDemoStoryStep,
  markSchoolsDemoLaunched,
  SCHOOLS_DEMO_STORY_PREFETCH_ROUTES,
  setSchoolsDemoStoryStep
} from "@/lib/schools/schoolsDemoStoryMode";
import { SCHOOLS_DEMO_ROUTE_PREFIX } from "@/lib/schools/schoolsDemoHref";
import { clearSchoolsMapMissionBriefDismiss } from "@/lib/schools/schoolsMapMissionBriefState";
import {
  clearSchoolsBusinessIslandHubEntered,
  clearSchoolsBusinessIslandZoomEnter,
  clearSchoolsBusinessIslandZoomInProgress
} from "@/lib/schools/schoolsBusinessIslandZoomEnter";

type LaunchActions = {
  replaceGameState: (state: ReturnType<typeof buildDemoGameState>) => void;
};

type DemoRouter = {
  prefetch: (href: string) => void;
  replace: (href: string) => void;
};

function scheduleIdle(fn: () => void, timeoutMs = 2500): void {
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(fn, { timeout: timeoutMs });
  } else {
    window.setTimeout(fn, 80);
  }
}

/**
 * Production presenter demo at `/schools/demo/*` — isolated from bank/broker `/demo`.
 */
export function launchSchoolsProductionDemo(
  router: DemoRouter,
  actions: LaunchActions
): void {
  deactivateSchoolsDemoStory();
  deactivateDemoStory();
  clearPersistedSnapshots();
  clearDemoSessionFlags();
  clearSchoolsMapMissionBriefDismiss();
  clearSchoolsBusinessIslandHubEntered();
  clearSchoolsBusinessIslandZoomEnter();
  clearSchoolsBusinessIslandZoomInProgress();
  rotateOnboardingGuestId();
  setActiveDemoProfileLabel(DEMO_PROFILE_NEW_USER);

  markSchoolsDemoLaunched();
  activateSchoolsDemoStory({ productionRoutes: true });
  setSchoolsDemoStoryStep("mission-brief-invitation");

  actions.replaceGameState(buildDemoGameState(DEMO_PROFILE_NEW_USER));

  prefetchStartupAssets();
  preloadQuestDetailChunks();

  const opening = getRouteForSchoolsDemoStoryStep("mission-brief-invitation");
  try {
    router.prefetch(opening);
  } catch {
    /* ignore */
  }

  scheduleIdle(() => {
    for (const href of SCHOOLS_DEMO_STORY_PREFETCH_ROUTES) {
      const demoHref = href.replace("/schools", SCHOOLS_DEMO_ROUTE_PREFIX);
      try {
        router.prefetch(demoHref);
      } catch {
        /* ignore */
      }
    }
  });

  // Hard navigation — soft router.replace can stall on `/schools/demo` when crossing
  // demo vs canonical layout trees (user stays on "Starting Schools demo…").
  if (typeof window !== "undefined") {
    window.location.replace(opening);
    return;
  }
  router.replace(opening);
}
