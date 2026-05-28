import { clearPersistedSnapshots } from "@/engine/progression/persistence";
import { buildDemoGameState, DEMO_PROFILE_NEW_USER } from "@/lib/demo/demoProfiles";
import {
  activateDemoStory,
  DEMO_STORY_PREFETCH_ROUTES,
  setDemoStoryStep
} from "@/lib/demo/demoStoryMode";
import { DEMO_ROUTE_PREFIX } from "@/lib/demo/demoHref";
import {
  clearDemoSessionFlags,
  rotateOnboardingGuestId,
  setActiveDemoProfileLabel
} from "@/lib/demo/demoSessionReset";
import { prefetchStartupAssets } from "@/lib/startup/prefetchStartupAssets";
import { preloadQuestDetailChunks } from "@/lib/quests/preloadQuestDetailChunks";

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
 * Production presenter demo at `/demo/*` — isolated from localStorage funnel state.
 */
export function launchProductionDemo(
  router: DemoRouter,
  actions: LaunchActions
): void {
  clearPersistedSnapshots();
  clearDemoSessionFlags();
  rotateOnboardingGuestId();
  setActiveDemoProfileLabel(DEMO_PROFILE_NEW_USER);

  activateDemoStory({ productionRoutes: true });
  setDemoStoryStep("logo");

  actions.replaceGameState(buildDemoGameState(DEMO_PROFILE_NEW_USER));

  prefetchStartupAssets();
  preloadQuestDetailChunks();

  const opening = `${DEMO_ROUTE_PREFIX}/opening`;
  try {
    router.prefetch(opening);
  } catch {
    /* ignore */
  }

  scheduleIdle(() => {
    for (const href of DEMO_STORY_PREFETCH_ROUTES) {
      const demoHref = `${DEMO_ROUTE_PREFIX}${href}`;
      try {
        router.prefetch(demoHref);
      } catch {
        /* ignore */
      }
    }
  });

  router.replace(opening);
}
