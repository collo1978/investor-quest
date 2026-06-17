"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import { WelcomeScreen } from "@/components/WelcomeScreen";
import { useDemoStory } from "@/components/demo/DemoStoryProvider";
import { useGame } from "@/components/GameProvider";
import { useMobilePreviewEmbed } from "@/hooks/useMobilePreviewEmbed";
import { isDemoPath } from "@/lib/demo/demoHref";
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
  const pathname = usePathname();
  const { raw, actions } = useGame();
  const demoStory = useDemoStory();
  const isPreviewEmbed = useMobilePreviewEmbed();
  const leavingRef = useRef(false);

  useEffect(() => {
    releaseFunnelTransition("welcome");
  }, []);

  const demoStoryActiveRef = useRef(demoStory.active);
  demoStoryActiveRef.current = demoStory.active;
  const advanceStoryRef = useRef(demoStory.advance);
  advanceStoryRef.current = demoStory.advance;

  const startOnboarding = useCallback(() => {
    if (isPreviewEmbed) return;
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
  }, [actions, isPreviewEmbed, router]);

  useEffect(() => {
    if (isPreviewEmbed) return;
    if (isDemoPath(pathname)) return;
    if (demoStory.active) return;
    if (leavingRef.current) return;
    if (shouldShowWelcomeScreen(raw)) return;
    const target = resolveHomeEntryRoute(raw);
    if (target !== "/welcome") router.replace(target);
  }, [demoStory.active, isPreviewEmbed, pathname, raw, router]);

  return <WelcomeScreen onStartQuest={startOnboarding} />;
}
