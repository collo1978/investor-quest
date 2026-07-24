"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { SchoolsArmorAvatarScreen } from "@/components/schools/SchoolsArmorAvatarScreen";
import { useGame } from "@/components/GameProvider";
import type { SchoolsAvatarId } from "@/lib/schools/avatars";
import { isSchoolsDemoPath, resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";
import { navigateSchoolsDemoStep } from "@/lib/schools/navigateSchoolsDemoStep";
import { warmSchoolsArmorPickerImage } from "@/lib/schools/prefetchSchoolsOnboardingAssets";
import { saveSchoolsAvatar } from "@/lib/schools/schoolsAvatarStorage";
import { markFunnelTransition, releaseFunnelTransition } from "@/lib/startup/funnelTransition";

/** Schools onboarding — pick a named avatar character (portrait art). */
export default function SchoolsPickAvatarPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { actions } = useGame();

  useEffect(() => {
    releaseFunnelTransition("pick-avatar");
  }, []);

  useEffect(() => {
    router.prefetch(resolveSchoolsLearnerHref("/schools/avatar", pathname));
    warmSchoolsArmorPickerImage();
  }, [pathname, router]);

  const onContinue = useCallback(
    (avatarId: SchoolsAvatarId) => {
      saveSchoolsAvatar(avatarId);
      actions.setSchoolsProfile({ avatarId });

      if (isSchoolsDemoPath(pathname)) {
        navigateSchoolsDemoStep("avatar", pathname, router);
        return;
      }

      markFunnelTransition("avatar");
      router.replace(resolveSchoolsLearnerHref("/schools/avatar", pathname));
    },
    [actions, pathname, router]
  );

  return <SchoolsArmorAvatarScreen onContinue={onContinue} />;
}
