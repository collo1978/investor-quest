"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

import { SchoolsSoundsLikeYouScreen } from "@/components/schools/SchoolsSoundsLikeYouScreen";
import { hrefForSchoolsOnboardingStep } from "@/lib/schools/schoolsOnboardingFlow";
import { resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";
import { SCHOOLS_MISSION_BRIEF_INVITATION_ROUTE } from "@/lib/schools/schoolsMissionBriefInvitationContent";

/** Schools onboarding step 1 — stocks experience multi-select. */
export default function SchoolsScreen5OnboardingPage() {
  const router = useRouter();
  const pathname = usePathname();

  const onContinue = useCallback(() => {
    router.replace(
      hrefForSchoolsOnboardingStep("/schools/pick-interests", pathname)
    );
  }, [pathname, router]);

  const onBack = useCallback(() => {
    router.replace(
      resolveSchoolsLearnerHref(SCHOOLS_MISSION_BRIEF_INVITATION_ROUTE, pathname)
    );
  }, [pathname, router]);

  return (
    <SchoolsSoundsLikeYouScreen onContinue={onContinue} onBack={onBack} />
  );
}
