"use client";

import { useRouter } from "next/navigation";

import { useGame } from "@/components/GameProvider";
import { useRunOnceOnMount } from "@/hooks/useRunOnceOnMount";
import {
  getRouteForSchoolsDemoStoryStep,
  getSchoolsDemoStoryStep,
  isSchoolsDemoStoryModeActive
} from "@/lib/schools/schoolsDemoStoryMode";
import { launchSchoolsProductionDemo } from "@/lib/schools/launchSchoolsProductionDemo";

/**
 * `/schools/demo` entry — resets scripted state and opens the Schools logo intro.
 * Share this URL for Schools presentations on Vercel.
 */
export default function SchoolsDemoEntryPage() {
  const router = useRouter();
  const { actions } = useGame();

  useRunOnceOnMount(() => {
    if (isSchoolsDemoStoryModeActive()) {
      router.replace(getRouteForSchoolsDemoStoryStep(getSchoolsDemoStoryStep()));
      return;
    }
    launchSchoolsProductionDemo(router, actions);
  });

  return (
    <div
      className="flex min-h-[100dvh] items-center justify-center bg-[#030308]"
      aria-busy="true"
      aria-label="Starting Schools demo"
    >
      <p className="text-sm text-ink-2">Starting Schools demo…</p>
    </div>
  );
}
