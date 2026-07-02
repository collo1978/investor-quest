"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  advanceSchoolsDemoStoryStep,
  isSchoolsDemoStoryModeActive
} from "@/lib/schools/schoolsDemoStoryMode";
import {
  prepareSchoolsBusinessIslandMapHub,
  resolveSchoolsBusinessIslandMapHubHref
} from "@/lib/schools/schoolsBusinessIslandMapHub";
import { isSchoolsDemoPath } from "@/lib/schools/schoolsDemoHref";

/**
 * Legacy `/schools/business` hub — redirects to the Prodigy map camera hub.
 */
export default function SchoolsBusinessHubRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    prepareSchoolsBusinessIslandMapHub();
    if (isSchoolsDemoPath(pathname) || isSchoolsDemoStoryModeActive()) {
      advanceSchoolsDemoStoryStep("business-island");
    }
    router.replace(resolveSchoolsBusinessIslandMapHubHref(pathname));
  }, [pathname, router]);

  return null;
}
