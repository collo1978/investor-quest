"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

import { SchoolsPickInterestsScreen } from "@/components/schools/SchoolsPickInterestsScreen";
import { hrefForSchoolsOnboardingStep } from "@/lib/schools/schoolsOnboardingFlow";

/** Schools onboarding step 3 — desktop game-style pick 1 interest. */
export default function SchoolsPickInterestsPage() {
  const router = useRouter();
  const pathname = usePathname();

  const onContinue = useCallback(() => {
    router.replace(
      hrefForSchoolsOnboardingStep("/schools/company-reveal", pathname)
    );
  }, [pathname, router]);

  const onBack = useCallback(() => {
    router.replace(
      hrefForSchoolsOnboardingStep("/schools/screen5-onboarding", pathname)
    );
  }, [pathname, router]);

  return (
    <SchoolsPickInterestsScreen onContinue={onContinue} onBack={onBack} />
  );
}
