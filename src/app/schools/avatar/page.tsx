"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { SchoolsArmorAvatarScreen } from "@/components/schools/SchoolsArmorAvatarScreen";
import { useGame } from "@/components/GameProvider";
import { getSchoolsAvatarById, type SchoolsAvatarId } from "@/lib/schools/avatars";
import { isSchoolsDemoPath, resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";
import { navigateSchoolsDemoStep } from "@/lib/schools/navigateSchoolsDemoStep";
import { isSchoolsDemoStoryModeActive } from "@/lib/schools/schoolsDemoStoryMode";
import { saveSchoolsAvatar } from "@/lib/schools/schoolsAvatarStorage";
import { markFunnelTransition, releaseFunnelTransition } from "@/lib/startup/funnelTransition";

export default function SchoolsAvatarPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { state, actions } = useGame();

  useEffect(() => {
    releaseFunnelTransition("avatar");
  }, []);

  const onContinue = useCallback(
    (avatarId: SchoolsAvatarId) => {
      const avatar = getSchoolsAvatarById(avatarId);
      saveSchoolsAvatar(avatarId);
      actions.setProfile({
        playerName: avatar.name,
        goal: state.goal ?? "Build investing mastery"
      });

      const onSchoolsDemo =
        isSchoolsDemoPath(pathname) || isSchoolsDemoStoryModeActive();

      if (onSchoolsDemo) {
        navigateSchoolsDemoStep("onboarding", pathname, router);
        return;
      }

      markFunnelTransition("onboarding");
      router.replace(resolveSchoolsLearnerHref("/schools/onboarding", pathname));
    },
    [actions, pathname, router, state.goal]
  );

  return <SchoolsArmorAvatarScreen onContinue={onContinue} />;
}
