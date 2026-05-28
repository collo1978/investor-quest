"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { GameOpeningScreen } from "@/components/GameOpeningScreen";
import { useDemoStory } from "@/components/demo/DemoStoryProvider";
import { useGame } from "@/components/GameProvider";
import { clearDemoFreshStart } from "@/lib/demo/demoSessionReset";
import {
  resolveHomeEntryRoute,
  shouldShowOpeningScreen
} from "@/lib/opening/shouldShowOpeningScreen";
import {
  markFunnelTransition,
  releaseFunnelTransition
} from "@/lib/startup/funnelTransition";

export default function OpeningPage() {
  const router = useRouter();
  const { raw, actions } = useGame();
  const demoStory = useDemoStory();
  const leavingRef = useRef(false);

  useEffect(() => {
    releaseFunnelTransition();
  }, []);

  const demoStoryActiveRef = useRef(demoStory.active);
  demoStoryActiveRef.current = demoStory.active;
  const advanceStoryRef = useRef(demoStory.advance);
  advanceStoryRef.current = demoStory.advance;

  const finishIntro = useCallback(() => {
    if (leavingRef.current) return;
    leavingRef.current = true;

    if (demoStoryActiveRef.current) {
      advanceStoryRef.current("welcome");
      return;
    }

    clearDemoFreshStart();
    const playIntro = shouldShowOpeningScreen(raw);
    const target = playIntro ? "/welcome" : resolveHomeEntryRoute(raw);
    const next = target === "/opening" ? "/welcome" : target;

    const transition =
      next === "/welcome"
        ? "welcome"
        : next === "/map"
          ? "map"
          : next.startsWith("/onboarding")
            ? "onboarding"
            : "welcome";
    markFunnelTransition(transition);
    router.replace(next);

    queueMicrotask(() => {
      if (playIntro) {
        actions.completeOpeningScreen();
      }
    });
  }, [actions, raw, router]);

  useEffect(() => {
    if (demoStory.active) return;
    if (shouldShowOpeningScreen(raw)) return;
    const target = resolveHomeEntryRoute(raw);
    if (target !== "/opening") router.replace(target);
  }, [demoStory.active, raw, router]);

  return <GameOpeningScreen onComplete={finishIntro} />;
}
