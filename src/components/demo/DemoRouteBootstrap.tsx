"use client";

import { usePathname } from "next/navigation";

import { useRunOnceOnLayoutMount } from "@/hooks/useRunOnceOnLayoutMount";
import { isMobilePreviewEmbed } from "@/lib/bank/mobilePreviewEmbed";
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

  useRunOnceOnLayoutMount(() => {
    if (isMobilePreviewEmbed()) return;
    if (!isDemoPath(pathname) || pathname === DEMO_ROUTE_PREFIX) return;
    if (isDemoStoryModeActive()) return;
    ensureProductionDemoFromPath(pathname);
  });

  return null;
}
