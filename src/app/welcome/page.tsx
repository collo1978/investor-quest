"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { WelcomeScreen } from "@/components/WelcomeScreen";
import { useDemoStory } from "@/components/demo/DemoStoryProvider";
import { useGame } from "@/components/GameProvider";
import {
  resolveHomeEntryRoute,
  shouldShowWelcomeScreen
} from "@/lib/opening/shouldShowOpeningScreen";
import {
  markFunnelTransition,
  releaseFunnelTransition
} from "@/lib/startup/funnelTransition";

export default function WelcomePage() {
  const router = useRouter();
  const { raw, actions } = useGame();
  const demoStory = useDemoStory();
  const leavingRef = useRef(false);

  useEffect(() => {
    releaseFunnelTransition("welcome");
  }, []);

  const demoStoryActiveRef = useRef(demoStory.active);
  demoStoryActiveRef.current = demoStory.active;
  const advanceStoryRef = useRef(demoStory.advance);
  advanceStoryRef.current = demoStory.advance;

  const startOnboarding = useCallback(() => {
    if (leavingRef.current) return;
    leavingRef.current = true;

    if (demoStoryActiveRef.current) {
      advanceStoryRef.current("onboarding");
      return;
    }

    markFunnelTransition("onboarding");
    router.replace("/onboarding");
    queueMicrotask(() => {
      actions.completeWelcomeScreen();
    });
  }, [actions, router]);

  useEffect(() => {
    if (demoStory.active) return;
    if (leavingRef.current) return;
    if (shouldShowWelcomeScreen(raw)) return;
    const target = resolveHomeEntryRoute(raw);
    if (target !== "/welcome") router.replace(target);
  }, [demoStory.active, raw, router]);

  return <WelcomeScreen onStartQuest={startOnboarding} />;
}
