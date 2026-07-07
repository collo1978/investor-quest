"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useGame } from "@/components/GameProvider";
import { SchoolsPickCompanyScreen } from "@/components/schools/SchoolsPickCompanyScreen";
import { isSchoolsDemoPath, resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";
import { navigateSchoolsDemoStep } from "@/lib/schools/navigateSchoolsDemoStep";
import { prepareSchoolsMapMissionBriefEntry } from "@/lib/schools/schoolsMapMissionBriefState";
import { markFunnelTransition } from "@/lib/startup/funnelTransition";
import {
  resolveSchoolsPickCompanyGameId,
  type SchoolsPickCompanySelection
} from "@/lib/schools/schoolsPickCompanyState";

/** Post-onboarding menu route — sector → industry → company picker. */
export default function SchoolsPickCompanyPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { actions } = useGame();

  const onBack = useCallback(() => {
    router.replace(resolveSchoolsLearnerHref("/schools/map", pathname));
  }, [pathname, router]);

  const onStartQuest = useCallback(
    (selection: SchoolsPickCompanySelection) => {
      actions.setActiveCompany(resolveSchoolsPickCompanyGameId(selection.companyName));
      prepareSchoolsMapMissionBriefEntry();

      if (isSchoolsDemoPath(pathname)) {
        navigateSchoolsDemoStep("map-brief", pathname, router);
        return;
      }

      markFunnelTransition("map");
      router.replace(resolveSchoolsLearnerHref("/schools/map", pathname));
    },
    [actions, pathname, router]
  );

  return (
    <SchoolsPickCompanyScreen onStartQuest={onStartQuest} onBack={onBack} />
  );
}
