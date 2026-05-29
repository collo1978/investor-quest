"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useDemoStory } from "@/components/demo/DemoStoryProvider";
import {
  advanceDemoStoryStep,
  DEMO_STORY_STEPS,
  getRouteForDemoStoryStep
} from "@/lib/demo/demoStoryMode";
import { stripDemoPrefix } from "@/lib/demo/demoHref";
import { isSchoolsDemoStoryModeActive } from "@/lib/schools/schoolsDemoStoryMode";

function stepIndex(step: (typeof DEMO_STORY_STEPS)[number]): number {
  return DEMO_STORY_STEPS.indexOf(step);
}

/**
 * Navigates only when the demo story step advances (not on every pathname change).
 * Prevents replace/retry loops when RSC fetch fails transiently in dev.
 */
export function DemoStoryOrchestrator() {
  const router = useRouter();
  const pathname = usePathname();
  const { active, step } = useDemoStory();
  const prevStepRef = useRef<typeof step | null>(null);
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    if (isSchoolsDemoStoryModeActive()) return;
    if (!active) {
      prevStepRef.current = null;
      return;
    }
    if (prevStepRef.current === step) return;
    prevStepRef.current = step;

    const expected = getRouteForDemoStoryStep(step);
    routerRef.current.replace(expected);
  }, [active, step]);

  useEffect(() => {
    if (isSchoolsDemoStoryModeActive()) return;
    if (!active) return;
    const path = stripDemoPrefix(pathname);
    if (path === "/business" && stepIndex(step) < stepIndex("business-island")) {
      advanceDemoStoryStep("business-island");
    }
    if (
      path.startsWith("/business/") &&
      stepIndex(step) < stepIndex("business-quest")
    ) {
      advanceDemoStoryStep("business-quest");
    }
  }, [active, pathname, step]);

  return null;
}
