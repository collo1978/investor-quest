"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { isMobilePreviewEmbed } from "@/lib/bank/mobilePreviewEmbed";
import {
  isSchoolsDemoPath,
  stripSchoolsDemoPrefix
} from "@/lib/schools/schoolsDemoHref";
import {
  ensureProductionSchoolsDemoFromPath,
  hydrateSchoolsDemoStoryFromSession,
  markSchoolsDemoLaunched,
  wasSchoolsDemoLaunchedInSession
} from "@/lib/schools/schoolsDemoStoryMode";
import { warmSchoolsProfileApproachAssets } from "@/lib/schools/prefetchSchoolsProfileLinks";

/**
 * Resume scripted Schools mode on `/schools/demo` and `/schools/demo/*`.
 */
export function SchoolsDemoRouteBootstrap() {
  const pathname = usePathname();

  useEffect(() => {
    if (isMobilePreviewEmbed()) return;
    if (!isSchoolsDemoPath(pathname)) {
      return;
    }
    if (!wasSchoolsDemoLaunchedInSession()) {
      markSchoolsDemoLaunched();
    }
    hydrateSchoolsDemoStoryFromSession(pathname);
    ensureProductionSchoolsDemoFromPath(pathname);

    const learnerPath = stripSchoolsDemoPrefix(pathname);
    if (
      learnerPath === "/schools/business" ||
      learnerPath.startsWith("/schools/business/")
    ) {
      warmSchoolsProfileApproachAssets();
    }
  }, [pathname]);

  return null;
}
