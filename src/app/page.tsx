"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useGame } from "@/components/GameProvider";
import { isDemoStoryModeActive } from "@/lib/demo/demoStoryMode";
import { resolveHomeEntryRoute } from "@/lib/opening/shouldShowOpeningScreen";

/** Routes first-time players to opening → welcome → onboarding → map. */
export default function HomePage() {
  const router = useRouter();
  const { raw, persistenceReady } = useGame();

  useEffect(() => {
    if (isDemoStoryModeActive()) return;
    if (!persistenceReady) return;
    router.replace(resolveHomeEntryRoute(raw));
  }, [persistenceReady, raw, router]);

  return (
    <div
      className="min-h-[100dvh] bg-[#030308]"
      aria-hidden
    />
  );
}
