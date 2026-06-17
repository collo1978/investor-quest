"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useOptionalGame } from "@/components/GameProvider";
import { navigateSchoolsDemoStep } from "@/lib/schools/navigateSchoolsDemoStep";
import {
  advanceSchoolsDemoStoryStep,
  getSchoolsDemoStoryStep,
  isSchoolsDemoStoryModeActive
} from "@/lib/schools/schoolsDemoStoryMode";
import {
  isSchoolsBusinessQuestDetailPath,
  stripSchoolsDemoPrefix
} from "@/lib/schools/schoolsDemoHref";

/**
 * Wires post-quest Schools tour steps after the learner leaves the quiz screen.
 * Conviction is enqueued from the quest completion CTA — not on engine complete.
 */
export function SchoolsDemoPlaythroughBridge() {
  const pathname = usePathname();
  const router = useRouter();
  const game = useOptionalGame();

  useEffect(() => {
    if (!game) return;
    const { raw } = game;
    if (!isSchoolsDemoStoryModeActive()) return;
    const prog = raw.companies[raw.activeCompanyId];
    if (!prog) return;

    const convictionDone =
      typeof prog.pillarConvictionSubmittedAt.business === "number";
    const step = getSchoolsDemoStoryStep();

    if (
      convictionDone &&
      step === "conviction" &&
      !isSchoolsBusinessQuestDetailPath(pathname)
    ) {
      advanceSchoolsDemoStoryStep("business-island");
    }

    const path = stripSchoolsDemoPrefix(pathname);
    if (
      path === "/schools/map" &&
      step === "final-challenge" &&
      prog.tenKRookieChallenge
    ) {
      navigateSchoolsDemoStep("map-return", pathname, router);
    }
  }, [game, pathname, router]);

  return null;
}
