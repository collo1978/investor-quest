"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { isMobilePreviewEmbed } from "@/lib/bank/mobilePreviewEmbed";
import {
  isSchoolsDemoPath,
  SCHOOLS_DEMO_ROUTE_PREFIX,
  stripSchoolsDemoPrefix
} from "@/lib/schools/schoolsDemoHref";
import {
  ensureProductionSchoolsDemoFromPath,
  hydrateSchoolsDemoStoryFromSession
} from "@/lib/schools/schoolsDemoStoryMode";
import { warmSchoolsProfileApproachAssets } from "@/lib/schools/prefetchSchoolsProfileLinks";

/**
 * Resume scripted Schools mode on `/schools/demo/*` after sidebar launch only.
 */
export function SchoolsDemoRouteBootstrap() {
  const pathname = usePathname();

  useEffect(() => {
    if (isMobilePreviewEmbed()) return;
    if (!isSchoolsDemoPath(pathname) || pathname === SCHOOLS_DEMO_ROUTE_PREFIX) {
      return;
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
