"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useSchoolsDemoStory } from "@/components/schools/SchoolsDemoStoryProvider";
import { isMobilePreviewEmbed, isMobilePreviewShellPath } from "@/lib/bank/mobilePreviewEmbed";
import {
  advanceSchoolsDemoStoryStep,
  deactivateSchoolsDemoStory,
  ensureProductionSchoolsDemoFromPath,
  getRouteForSchoolsDemoStoryStep,
  isSchoolsDemoStoryModeActive,
  markSchoolsDemoLaunched,
  SCHOOLS_DEMO_STORY_STEPS,
  schoolsDemoStepFromPathname,
  setSchoolsDemoStoryStep,
  wasSchoolsDemoLaunchedInSession
} from "@/lib/schools/schoolsDemoStoryMode";
import { SCHOOLS_DEMO_MENU_HUB_PATHS } from "@/lib/schools/schoolsDemoMenu";
import { isSchoolsOnboardingFlowRoute } from "@/lib/schools/schoolsOnboardingFlow";
import {
  isSchoolsBusinessQuestDetailPath,
  isSchoolsDemoPath,
  SCHOOLS_DEMO_ROUTE_PREFIX,
  stripSchoolsDemoPrefix
} from "@/lib/schools/schoolsDemoHref";

function stepIndex(step: (typeof SCHOOLS_DEMO_STORY_STEPS)[number]): number {
  return SCHOOLS_DEMO_STORY_STEPS.indexOf(step);
}

/** `/schools/demo` and `/schools/demo/logo-intro` are both valid opener beats. */
function pathnameMatchesDemoStepRoute(
  pathname: string,
  storyStep: (typeof SCHOOLS_DEMO_STORY_STEPS)[number]
): boolean {
  const expected = getRouteForSchoolsDemoStoryStep(storyStep);
  if (pathname === expected) return true;
  if (storyStep === "logo-intro" && pathname === SCHOOLS_DEMO_ROUTE_PREFIX) {
    return true;
  }
  if (storyStep === "onboarding") {
    const learnerPath = stripSchoolsDemoPrefix(pathname);
    if (isSchoolsOnboardingFlowRoute(learnerPath)) return true;
  }
  return false;
}

/**
 * Navigates Schools demo steps under `/schools/demo/*` only.
 */
export function SchoolsDemoStoryOrchestrator() {
  const router = useRouter();
  const pathname = usePathname();
  const { active, step } = useSchoolsDemoStory();
  const prevStepRef = useRef<typeof step | null>(null);
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    if (isMobilePreviewShellPath(pathname) || isMobilePreviewEmbed()) return;
    if (isSchoolsDemoPath(pathname)) {
      if (!wasSchoolsDemoLaunchedInSession()) {
        markSchoolsDemoLaunched();
      }
      ensureProductionSchoolsDemoFromPath(pathname);
    }
    if (
      pathname.startsWith("/schools") &&
      !isSchoolsDemoPath(pathname) &&
      !pathname.startsWith("/schools/preview")
    ) {
      if (isSchoolsDemoStoryModeActive()) {
        deactivateSchoolsDemoStory();
      }
      prevStepRef.current = null;
      return;
    }
    if (!isSchoolsDemoPath(pathname)) return;
    if (!isSchoolsDemoStoryModeActive()) return;
    if (!active) {
      prevStepRef.current = null;
      return;
    }

    // Learner jumped via CTA or hamburger — sync story to the URL (forward or back).
    const inferred = schoolsDemoStepFromPathname(pathname);
    if (inferred) {
      if (pathnameMatchesDemoStepRoute(pathname, inferred)) {
        if (step !== inferred) {
          const inferredIdx = stepIndex(inferred);
          const currentIdx = stepIndex(step);
          // Never downgrade an in-flight CTA advance while the URL still shows logo.
          if (inferredIdx > currentIdx) {
            setSchoolsDemoStoryStep(inferred);
          }
        }
        prevStepRef.current = step;
        return;
      }
      const inferredIdx = stepIndex(inferred);
      const currentIdx = stepIndex(step);
      if (inferredIdx > currentIdx) {
        advanceSchoolsDemoStoryStep(inferred);
        return;
      }
    }

    const learnerPath = stripSchoolsDemoPrefix(pathname);
    if (SCHOOLS_DEMO_MENU_HUB_PATHS.has(learnerPath)) {
      return;
    }

    if (step === "onboarding" && isSchoolsOnboardingFlowRoute(learnerPath)) {
      prevStepRef.current = step;
      return;
    }

    if (prevStepRef.current === step) return;
    prevStepRef.current = step;

    // Quest 1 summary + check-in — stay on the quest URL until the learner taps Back.
    if (
      isSchoolsBusinessQuestDetailPath(pathname) &&
      (step === "business-island" || step === "conviction")
    ) {
      return;
    }

    const expected = getRouteForSchoolsDemoStoryStep(step);
    if (!pathnameMatchesDemoStepRoute(pathname, step)) {
      routerRef.current.replace(expected);
    }
  }, [active, pathname, step]);

  useEffect(() => {
    if (isMobilePreviewShellPath(pathname) || isMobilePreviewEmbed()) return;
    if (!isSchoolsDemoPath(pathname)) return;
    if (!active) return;
    const path = stripSchoolsDemoPrefix(pathname);
    if (
      path === "/schools/business" &&
      stepIndex(step) < stepIndex("business-island")
    ) {
      advanceSchoolsDemoStoryStep("business-island");
    }
    if (
      path.startsWith("/schools/business/") &&
      stepIndex(step) < stepIndex("business-quest")
    ) {
      advanceSchoolsDemoStoryStep("business-quest");
    }
    if (path === "/schools/profile" && stepIndex(step) < stepIndex("profile")) {
      advanceSchoolsDemoStoryStep("profile");
    }
    if (
      path === "/schools/xp-ladder" &&
      stepIndex(step) < stepIndex("xp-ladder")
    ) {
      advanceSchoolsDemoStoryStep("xp-ladder");
    }
    if (
      path === "/schools/final-challenge" &&
      stepIndex(step) < stepIndex("final-challenge")
    ) {
      advanceSchoolsDemoStoryStep("final-challenge");
    }
  }, [active, pathname, step]);

  return null;
}
