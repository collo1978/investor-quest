"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import { SchoolsArmorAvatarScreen } from "@/components/schools/SchoolsArmorAvatarScreen";
import { useSchoolsDemoStory } from "@/components/schools/SchoolsDemoStoryProvider";
import { useGame } from "@/components/GameProvider";
import { getSchoolsAvatarById, type SchoolsAvatarId } from "@/lib/schools/avatars";
import { resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";
import { isSchoolsDemoStoryModeActive } from "@/lib/schools/schoolsDemoStoryMode";
import {
  saveSchoolsAvatar
} from "@/lib/schools/schoolsAvatarStorage";
import { markFunnelTransition, releaseFunnelTransition } from "@/lib/startup/funnelTransition";

export default function SchoolsAvatarPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { state, actions } = useGame();
  const schoolsDemo = useSchoolsDemoStory();
  const leavingRef = useRef(false);
  const schoolsDemoActiveRef = useRef(schoolsDemo.active);
  schoolsDemoActiveRef.current = schoolsDemo.active;
  const advanceSchoolsStoryRef = useRef(schoolsDemo.advance);
  advanceSchoolsStoryRef.current = schoolsDemo.advance;

  useEffect(() => {
    releaseFunnelTransition("avatar");
  }, []);

  const onContinue = useCallback(
    (avatarId: SchoolsAvatarId) => {
      if (leavingRef.current) return;
      leavingRef.current = true;

      const avatar = getSchoolsAvatarById(avatarId);
      saveSchoolsAvatar(avatarId);
      actions.setProfile({
        playerName: avatar.name,
        goal: state.goal ?? "Build investing mastery"
      });

      if (schoolsDemoActiveRef.current || isSchoolsDemoStoryModeActive()) {
        advanceSchoolsStoryRef.current("onboarding");
        return;
      }

      markFunnelTransition("onboarding");
      router.replace(resolveSchoolsLearnerHref("/schools/onboarding", pathname));
    },
    [actions, pathname, router, state.goal]
  );

  return <SchoolsArmorAvatarScreen onContinue={onContinue} />;
}
