"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { SchoolsChooseIdentityScreen } from "@/components/schools/SchoolsChooseIdentityScreen";
import { useGame } from "@/components/GameProvider";
import type { SchoolsArmorId } from "@/lib/schools/schoolsIdentities";
import { isSchoolsDemoPath, resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";
import { navigateSchoolsDemoStep } from "@/lib/schools/navigateSchoolsDemoStep";
import { saveSchoolsArmor } from "@/lib/schools/schoolsIdentityStorage";
import { markFunnelTransition, releaseFunnelTransition } from "@/lib/startup/funnelTransition";

export default function SchoolsAvatarPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { actions } = useGame();

  useEffect(() => {
    releaseFunnelTransition("avatar");
  }, []);

  useEffect(() => {
    router.prefetch(resolveSchoolsLearnerHref("/schools/screen5-onboarding", pathname));
  }, [pathname, router]);

  const onContinue = useCallback(
    (armorId: SchoolsArmorId) => {
      saveSchoolsArmor(armorId);
      actions.setSchoolsProfile({ armorId });

      if (isSchoolsDemoPath(pathname)) {
        navigateSchoolsDemoStep("onboarding", pathname, router);
        return;
      }

      markFunnelTransition("onboarding");
      router.replace(
        resolveSchoolsLearnerHref("/schools/screen5-onboarding", pathname)
      );
    },
    [actions, pathname, router]
  );

  return <SchoolsChooseIdentityScreen onContinue={onContinue} />;
}
