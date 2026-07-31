"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { SchoolsNameEntryScreen } from "@/components/schools/SchoolsNameEntryScreen";
import { useGame } from "@/components/GameProvider";
import { isSchoolsDemoPath, resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";
import { navigateSchoolsDemoStep } from "@/lib/schools/navigateSchoolsDemoStep";
import { warmSchoolsAvatarPortraitImages } from "@/lib/schools/prefetchSchoolsOnboardingAssets";
import { markFunnelTransition, releaseFunnelTransition } from "@/lib/startup/funnelTransition";

/** Schools onboarding — first step after the opening cinematic: capture the learner's name. */
export default function SchoolsNamePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { state, actions } = useGame();

  useEffect(() => {
    actions.completeOpeningScreen();
    actions.completeWelcomeScreen();
    releaseFunnelTransition("name");
  }, [actions]);

  useEffect(() => {
    router.prefetch(resolveSchoolsLearnerHref("/schools/pick-avatar", pathname));
    warmSchoolsAvatarPortraitImages();
  }, [pathname, router]);

  const onContinue = useCallback(
    (name: string) => {
      actions.setProfile({
        playerName: name,
        goal: state.goal ?? "Build investing mastery"
      });

      if (isSchoolsDemoPath(pathname)) {
        navigateSchoolsDemoStep("pick-avatar", pathname, router);
        return;
      }

      markFunnelTransition("pick-avatar");
      router.replace(resolveSchoolsLearnerHref("/schools/pick-avatar", pathname));
    },
    [actions, pathname, router, state.goal]
  );

  return (
    <SchoolsNameEntryScreen
      initialName={state.playerName}
      onContinue={onContinue}
    />
  );
}
