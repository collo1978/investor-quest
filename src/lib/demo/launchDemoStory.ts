
import { clearPersistedSnapshots } from "@/engine/progression/persistence";
import { buildDemoGameState, DEMO_PROFILE_NEW_USER } from "@/lib/demo/demoProfiles";
import {
  activateDemoStory,
  DEMO_STORY_PREFETCH_ROUTES,
  setDemoStoryStep
} from "@/lib/demo/demoStoryMode";
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
 * Start the scripted demo tour — no reliance on saved funnel flags or async hydration.
 */
export function launchDemoStory(router: DemoRouter, actions: LaunchActions): void {
  clearPersistedSnapshots();
  clearDemoSessionFlags();
  rotateOnboardingGuestId();
  setActiveDemoProfileLabel(DEMO_PROFILE_NEW_USER);

  activateDemoStory();
  setDemoStoryStep("logo");

  actions.replaceGameState(buildDemoGameState(DEMO_PROFILE_NEW_USER));

  prefetchStartupAssets();
  preloadQuestDetailChunks();

  router.prefetch("/opening");

  scheduleIdle(() => {
    for (const href of DEMO_STORY_PREFETCH_ROUTES) {
      if (href === "/opening") continue;
      try {
        router.prefetch(href);
      } catch {
        /* ignore prefetch errors in dev */
      }
    }
  });

  router.replace("/opening");
}
