"use client";

import { useRouter } from "next/navigation";

import { useRunOnceOnMount } from "@/hooks/useRunOnceOnMount";
import {
  prefetchStartupAssets,
  prefetchStartupRoutes
} from "@/lib/startup/prefetchStartupAssets";
import { isIsolatedDemoStoryModeActive } from "@/lib/demo/isolatedDemoStoryMode";
import { isSchoolsDemoProtectedPath, isSchoolsFunnelPath } from "@/lib/schools/schoolsDemoProtection";

/** Runs once per tab — warms logo, funnel routes, and quest detail chunks. */
export function StartupPrefetchBootstrap() {
  const router = useRouter();

  useRunOnceOnMount(() => {
    if (isIsolatedDemoStoryModeActive()) return;
    prefetchStartupAssets();
    if (isSchoolsDemoProtectedPath() || isSchoolsFunnelPath()) return;
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
