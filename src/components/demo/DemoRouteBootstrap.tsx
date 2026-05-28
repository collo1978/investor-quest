"use client";

import { usePathname } from "next/navigation";

import { useRunOnceOnMount } from "@/hooks/useRunOnceOnMount";
import { DEMO_ROUTE_PREFIX, isDemoPath } from "@/lib/demo/demoHref";
import {
  ensureProductionDemoFromPath,
  isDemoStoryModeActive
} from "@/lib/demo/demoStoryMode";

/**
 * Deep links to `/demo/opening` etc. still activate scripted mode
 * (entry `/demo` runs the full reset via launchProductionDemo).
 */
export function DemoRouteBootstrap() {
  const pathname = usePathname();

  useRunOnceOnMount(() => {
    if (!isDemoPath(pathname) || pathname === DEMO_ROUTE_PREFIX) return;
    if (isDemoStoryModeActive()) return;
    ensureProductionDemoFromPath(pathname);
  });

  return null;
}
