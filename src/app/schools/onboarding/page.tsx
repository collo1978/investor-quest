"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import OnboardingPage from "@/app/onboarding/page";
import { useGame } from "@/components/GameProvider";
import { hasSchoolsAvatarSelected } from "@/lib/schools/schoolsAvatarStorage";
import { resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";
import { isSchoolsDemoStoryModeActive } from "@/lib/schools/schoolsDemoStoryMode";
import { releaseFunnelTransition } from "@/lib/startup/funnelTransition";

/**
 * Schools onboarding — same steps as Bank/Broker, but requires avatar selection first.
 */
export default function SchoolsOnboardingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { raw } = useGame();

  useEffect(() => {
    releaseFunnelTransition("onboarding");
  }, []);

  useEffect(() => {
    if (isSchoolsDemoStoryModeActive()) return;
    if (raw.onboarding.openingScreenSeenAt == null) {
      router.replace(resolveSchoolsLearnerHref("/schools/opening", pathname));
      return;
    }
    if (!hasSchoolsAvatarSelected()) {
      router.replace(resolveSchoolsLearnerHref("/schools/avatar", pathname));
    }
  }, [pathname, raw.onboarding.openingScreenSeenAt, router]);

  return <OnboardingPage />;
}
