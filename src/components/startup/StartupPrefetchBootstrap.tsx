"use client";

import { useRouter } from "next/navigation";

import { useRunOnceOnMount } from "@/hooks/useRunOnceOnMount";
import {
  prefetchStartupAssets,
  prefetchStartupRoutes
} from "@/lib/startup/prefetchStartupAssets";
import { isIsolatedDemoStoryModeActive } from "@/lib/demo/isolatedDemoStoryMode";

/** Runs once per tab — warms logo, funnel routes, and quest detail chunks. */
export function StartupPrefetchBootstrap() {
  const router = useRouter();

  useRunOnceOnMount(() => {
    if (isIsolatedDemoStoryModeActive()) return;
    prefetchStartupAssets();
    prefetchStartupRoutes((href) => {
      try {
        router.prefetch(href);
      } catch {
        /* ignore */
      }
    });
  });

  return null;
}
