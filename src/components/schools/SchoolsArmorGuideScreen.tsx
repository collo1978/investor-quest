"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

import { SchoolsArmorGuidePanel } from "@/components/schools/SchoolsArmorGuidePanel";
import { resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";
import { warmSchoolsArmorGuideScreenAssets } from "@/lib/schools/prefetchSchoolsProfileLinks";

/** Schools investor armor guide — full-screen reference artwork (direct URL). */
export function SchoolsArmorGuideScreen() {
  const pathname = usePathname();
  const router = useRouter();
  const profileHref = resolveSchoolsLearnerHref("/schools/profile", pathname);

  useEffect(() => {
    warmSchoolsArmorGuideScreenAssets();
  }, []);

  const returnToProfile = useCallback(() => {
    router.push(profileHref);
  }, [router, profileHref]);

  return <SchoolsArmorGuidePanel onClose={returnToProfile} variant="page" />;
}
