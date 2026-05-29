"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import {
  isSchoolsDemoPath,
  SCHOOLS_DEMO_ROUTE_PREFIX
} from "@/lib/schools/schoolsDemoHref";
import { ensureProductionSchoolsDemoFromPath } from "@/lib/schools/schoolsDemoStoryMode";

/**
 * Deep links to `/schools/demo/opening` etc. still activate scripted Schools mode.
 */
export function SchoolsDemoRouteBootstrap() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isSchoolsDemoPath(pathname) || pathname === SCHOOLS_DEMO_ROUTE_PREFIX) {
      return;
    }
    ensureProductionSchoolsDemoFromPath(pathname);
  }, [pathname]);

  return null;
}
