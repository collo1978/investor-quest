"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useSchoolsDemoStory } from "@/components/schools/SchoolsDemoStoryProvider";
import {
  advanceSchoolsDemoStoryStep,
  getRouteForSchoolsDemoStoryStep,
  isSchoolsDemoStoryModeActive,
  SCHOOLS_DEMO_STORY_STEPS
} from "@/lib/schools/schoolsDemoStoryMode";
import { stripSchoolsDemoPrefix } from "@/lib/schools/schoolsDemoHref";

function stepIndex(step: (typeof SCHOOLS_DEMO_STORY_STEPS)[number]): number {
  return SCHOOLS_DEMO_STORY_STEPS.indexOf(step);
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
    if (!isSchoolsDemoStoryModeActive()) return;
    if (!active) {
      prevStepRef.current = null;
      return;
    }
    if (prevStepRef.current === step) return;
    prevStepRef.current = step;

    const expected = getRouteForSchoolsDemoStoryStep(step);
    routerRef.current.replace(expected);
  }, [active, step]);

  useEffect(() => {
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
  }, [active, pathname, step]);

  return null;
}
