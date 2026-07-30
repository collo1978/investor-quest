"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { SchoolsAvatarArmorScreen } from "@/components/schools/SchoolsAvatarArmorScreen";
import { useGame } from "@/components/GameProvider";
import type { SchoolsAvatarId } from "@/lib/schools/avatars";
import type { SchoolsArmorId } from "@/lib/schools/schoolsIdentities";
import { isSchoolsDemoPath, resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";
import { navigateSchoolsDemoStep } from "@/lib/schools/navigateSchoolsDemoStep";
import {
  warmSchoolsArmorPickerImage,
  warmSchoolsAvatarPortraitImages
} from "@/lib/schools/prefetchSchoolsOnboardingAssets";
import { saveSchoolsAvatar } from "@/lib/schools/schoolsAvatarStorage";
import { saveSchoolsArmor } from "@/lib/schools/schoolsIdentityStorage";
import { markFunnelTransition, releaseFunnelTransition } from "@/lib/startup/funnelTransition";

/** Schools onboarding — merged face (avatar) + archetype (armor) identity step. */
export default function SchoolsPickAvatarPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { actions } = useGame();

  useEffect(() => {
    releaseFunnelTransition("pick-avatar");
  }, []);

  useEffect(() => {
    router.prefetch(resolveSchoolsLearnerHref("/schools/screen5-onboarding", pathname));
    warmSchoolsArmorPickerImage();
    warmSchoolsAvatarPortraitImages();
  }, [pathname, router]);

  const onContinue = useCallback(
    (avatarId: SchoolsAvatarId, armorId: SchoolsArmorId) => {
      saveSchoolsAvatar(avatarId);
      saveSchoolsArmor(armorId);
      actions.setSchoolsProfile({ avatarId, armorId });

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

  return <SchoolsAvatarArmorScreen onContinue={onContinue} />;
}
