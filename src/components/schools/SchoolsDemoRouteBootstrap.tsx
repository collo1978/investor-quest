"use client";

import { usePathname } from "next/navigation";

import { useRunOnceOnMount } from "@/hooks/useRunOnceOnMount";
import {
  isSchoolsDemoPath,
  SCHOOLS_DEMO_ROUTE_PREFIX
} from "@/lib/schools/schoolsDemoHref";
import {
  ensureProductionSchoolsDemoFromPath,
  isSchoolsDemoStoryModeActive
} from "@/lib/schools/schoolsDemoStoryMode";

/**
 * Deep links to `/schools/demo/opening` etc. still activate scripted Schools mode.
 */
export function SchoolsDemoRouteBootstrap() {
  const pathname = usePathname();

  useRunOnceOnMount(() => {
    if (!isSchoolsDemoPath(pathname) || pathname === SCHOOLS_DEMO_ROUTE_PREFIX) {
      return;
    }
    if (isSchoolsDemoStoryModeActive()) return;
    ensureProductionSchoolsDemoFromPath(pathname);
  });

  return null;
}
