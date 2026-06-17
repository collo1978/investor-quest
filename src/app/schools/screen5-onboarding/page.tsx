"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

import { SchoolsSoundsLikeYouScreen } from "@/components/schools/SchoolsSoundsLikeYouScreen";
import { hrefForSchoolsOnboardingStep } from "@/lib/schools/schoolsOnboardingFlow";
import { resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";

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
    router.replace(resolveSchoolsLearnerHref("/schools/avatar", pathname));
  }, [pathname, router]);

  return (
    <SchoolsSoundsLikeYouScreen onContinue={onContinue} onBack={onBack} />
  );
}
