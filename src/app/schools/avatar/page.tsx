"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { SchoolsChooseIdentityScreen } from "@/components/schools/SchoolsChooseIdentityScreen";
import { useGame } from "@/components/GameProvider";
import {
  getSchoolsArmorById,
  type SchoolsArmorId
} from "@/lib/schools/schoolsIdentities";
import { isSchoolsDemoPath, resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";
import { navigateSchoolsDemoStep } from "@/lib/schools/navigateSchoolsDemoStep";
import { saveSchoolsArmor } from "@/lib/schools/schoolsIdentityStorage";
import { markFunnelTransition, releaseFunnelTransition } from "@/lib/startup/funnelTransition";

export default function SchoolsAvatarPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { state, actions } = useGame();

  useEffect(() => {
    actions.completeOpeningScreen();
    actions.completeWelcomeScreen();
    releaseFunnelTransition("avatar");
  }, [actions]);

  const onContinue = useCallback(
    (armorId: SchoolsArmorId) => {
      const armor = getSchoolsArmorById(armorId);
      saveSchoolsArmor(armorId);
      actions.setProfile({
        playerName: armor.title,
        goal: state.goal ?? "Build investing mastery"
      });

      if (isSchoolsDemoPath(pathname)) {
        navigateSchoolsDemoStep("onboarding", pathname, router);
        return;
      }

      markFunnelTransition("onboarding");
      router.replace(
        resolveSchoolsLearnerHref("/schools/screen5-onboarding", pathname)
      );
    },
    [actions, pathname, router, state.goal]
  );

  return <SchoolsChooseIdentityScreen onContinue={onContinue} />;
}
