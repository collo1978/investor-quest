"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useGame } from "@/components/GameProvider";
import { isDemoFreshStart } from "@/lib/demo/demoSessionReset";
import { isIsolatedDemoStoryModeActive } from "@/lib/demo/isolatedDemoStoryMode";
import { isFunnelTransitionActive } from "@/lib/startup/funnelTransition";
import {
  shouldShowOnboarding,
  shouldShowOpeningScreen,
  shouldShowWelcomeScreen
} from "@/lib/opening/shouldShowOpeningScreen";

const FUNNEL_EXEMPT_PREFIXES = [
  "/admin",
  "/demo",
  "/schools",
  "/opening",
  "/welcome",
  "/onboarding"
];

/**
 * Keeps first-run players on opening → welcome → onboarding before map/islands.
 */
export function EntryFunnelGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { raw, persistenceReady } = useGame();

  useEffect(() => {
    if (isIsolatedDemoStoryModeActive()) return;
    if (!persistenceReady) return;
    if (isFunnelTransitionActive()) return;
    if (FUNNEL_EXEMPT_PREFIXES.some((p) => pathname.startsWith(p))) return;

    if (isDemoFreshStart() || shouldShowOpeningScreen(raw)) {
      router.replace("/opening");
      return;
    }

    if (shouldShowWelcomeScreen(raw)) {
      router.replace("/welcome");
      return;
    }

    if (shouldShowOnboarding(raw)) {
      router.replace("/onboarding");
    }
  }, [pathname, persistenceReady, raw, router]);

  return null;
}
