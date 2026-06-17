"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

import { BankBrokerCompanyRevealScreen } from "@/components/bank/BankBrokerCompanyRevealScreen";
import { useGame } from "@/components/GameProvider";
import { isSchoolsDemoPath, resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";
import { navigateSchoolsDemoStep } from "@/lib/schools/navigateSchoolsDemoStep";
import { hrefForSchoolsOnboardingStep } from "@/lib/schools/schoolsOnboardingFlow";
import { SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT } from "@/lib/schools/schoolsPickInterestsConfig";
import { markFunnelTransition } from "@/lib/startup/funnelTransition";

/** Schools onboarding step 4 — game-show reveal + final quest unlocked → map. */
export default function SchoolsCompanyRevealPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { actions } = useGame();

  const onPickInterestsMissing = useCallback(() => {
    router.replace(
      hrefForSchoolsOnboardingStep("/schools/pick-interests", pathname)
    );
  }, [pathname, router]);

  const onLetsGo = useCallback(() => {
    actions.completeOnboarding();

    if (isSchoolsDemoPath(pathname)) {
      navigateSchoolsDemoStep("map-brief", pathname, router);
      return;
    }

    markFunnelTransition("map");
    router.replace(resolveSchoolsLearnerHref("/schools/map", pathname));
  }, [actions, pathname, router]);

  return (
    <BankBrokerCompanyRevealScreen
      onLetsGo={onLetsGo}
      onPickInterestsMissing={onPickInterestsMissing}
      requiredInterestCount={SCHOOLS_PICK_INTERESTS_REQUIRED_COUNT}
    />
  );
}
