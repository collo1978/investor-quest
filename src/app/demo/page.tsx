"use client";

import { useRouter } from "next/navigation";

import { useGame } from "@/components/GameProvider";
import { useRunOnceOnMount } from "@/hooks/useRunOnceOnMount";
import { launchProductionDemo } from "@/lib/demo/launchProductionDemo";

/**
 * `/demo` entry — resets scripted state and opens the logo intro.
 * Share this URL for school / investor presentations on Vercel.
 */
export default function DemoEntryPage() {
  const router = useRouter();
  const { actions } = useGame();

  useRunOnceOnMount(() => {
    launchProductionDemo(router, actions);
  });

  return (
    <div
      className="flex min-h-[100dvh] items-center justify-center bg-[#030308]"
      aria-busy="true"
      aria-label="Starting demo"
    >
      <p className="text-sm text-ink-2">Starting demo…</p>
    </div>
  );
}
