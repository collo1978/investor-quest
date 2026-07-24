"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useGame } from "@/components/GameProvider";
import { SchoolsPickInterestsScreen } from "@/components/schools/SchoolsPickInterestsScreen";
import { hrefForSchoolsOnboardingStep } from "@/lib/schools/schoolsOnboardingFlow";
import { readPickInterestsSelection } from "@/lib/bank/pickInterestsState";

/** Schools onboarding step 3 — desktop game-style pick 1 interest. */
export default function SchoolsPickInterestsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { actions } = useGame();

  const onContinue = useCallback(() => {
    actions.setSchoolsProfile({ interests: readPickInterestsSelection() });
    router.replace(
      hrefForSchoolsOnboardingStep("/schools/company-reveal", pathname)
    );
  }, [actions, pathname, router]);

  const onBack = useCallback(() => {
    router.replace(
      hrefForSchoolsOnboardingStep("/schools/screen5-onboarding", pathname)
    );
  }, [pathname, router]);

  return (
    <SchoolsPickInterestsScreen onContinue={onContinue} onBack={onBack} />
  );
}
