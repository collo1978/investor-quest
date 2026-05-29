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
  getRouteForSchoolsDemoStoryStep,
  SCHOOLS_DEMO_STORY_PREFETCH_ROUTES,
  setSchoolsDemoStoryStep
} from "@/lib/schools/schoolsDemoStoryMode";
import { SCHOOLS_DEMO_ROUTE_PREFIX } from "@/lib/schools/schoolsDemoHref";

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
  deactivateDemoStory();
  clearPersistedSnapshots();
  clearDemoSessionFlags();
  rotateOnboardingGuestId();
  setActiveDemoProfileLabel(DEMO_PROFILE_NEW_USER);

  activateSchoolsDemoStory({ productionRoutes: true });
  setSchoolsDemoStoryStep("logo");

  actions.replaceGameState(buildDemoGameState(DEMO_PROFILE_NEW_USER));

  prefetchStartupAssets();
  preloadQuestDetailChunks();

  const opening = getRouteForSchoolsDemoStoryStep("logo");
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

  router.replace(opening);
}
