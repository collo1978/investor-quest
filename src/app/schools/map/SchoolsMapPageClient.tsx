"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { SchoolsMissionBriefSequence } from "@/components/schools/SchoolsMissionBriefSequence";
import { SchoolsQuestMapScreen } from "@/components/schools/SchoolsQuestMapScreen";
import { useSchoolsDemoStory } from "@/components/schools/SchoolsDemoStoryProvider";
import { preloadImage } from "@/lib/preloadImage";
import { SCHOOLS_MAP_IMAGE_SRC } from "@/lib/schools/schoolsMapConfig";
import { isSchoolsDemoPath } from "@/lib/schools/schoolsDemoHref";
import {
  dismissSchoolsMapMissionBrief,
  readSchoolsMapMissionBriefDismissed,
  shouldShowSchoolsMapMissionBrief
} from "@/lib/schools/schoolsMapMissionBriefState";
import {
  advanceSchoolsDemoStoryStep,
  isSchoolsDemoStoryModeActive
} from "@/lib/schools/schoolsDemoStoryMode";
import { SCHOOLS_DEMO_RESET_EVENT } from "@/lib/schools/resetSchoolsDemoProgress";
import { SCHOOLS_UNLOCK_LABEL_MS } from "@/lib/schools/schoolsMapUnlockAnimation";

const CANONICAL_SCHOOLS_MAP_PATH = "/schools/map";

type GuidePhase = "idle" | "animating" | "landed";

/** Schools-only map page — quest map visible under the mission brief overlay. */
export default function SchoolsMapPageClient() {
  const pathname = usePathname();
  const schoolsDemoFullscreen = isSchoolsDemoPath(pathname);
  const isCanonicalSchoolsMap = pathname === CANONICAL_SCHOOLS_MAP_PATH;
  const [hydrationReady, setHydrationReady] = useState(false);
  const [schoolsBriefDismissed, setSchoolsBriefDismissed] = useState(false);
  const [guidePhase, setGuidePhase] = useState<GuidePhase>("idle");
  const [showBusinessGuideLabel, setShowBusinessGuideLabel] = useState(false);
  const schoolsDemo = useSchoolsDemoStory();

  const showDemoMissionBrief =
    hydrationReady &&
    (schoolsDemo.active || schoolsDemoFullscreen || isSchoolsDemoStoryModeActive()) &&
    schoolsDemo.step === "map-brief";

  const showCanonicalMissionBrief =
    isCanonicalSchoolsMap &&
    hydrationReady &&
    !schoolsBriefDismissed &&
    !showDemoMissionBrief &&
    shouldShowSchoolsMapMissionBrief();

  const showMissionBrief = showDemoMissionBrief || showCanonicalMissionBrief;
  const mapInteractionLocked = showMissionBrief || guidePhase === "animating";

  const finishMissionBrief = useCallback(() => {
    dismissSchoolsMapMissionBrief();
    setSchoolsBriefDismissed(true);
    setGuidePhase("animating");

    if (schoolsDemo.active || schoolsDemoFullscreen || isSchoolsDemoStoryModeActive()) {
      advanceSchoolsDemoStoryStep("map");
    }
  }, [schoolsDemo.active, schoolsDemoFullscreen]);

  const handleUnlockAnimationComplete = useCallback(() => {
    setGuidePhase("landed");
    setShowBusinessGuideLabel(true);
    window.setTimeout(() => setShowBusinessGuideLabel(false), SCHOOLS_UNLOCK_LABEL_MS);
  }, []);

  useLayoutEffect(() => {
    setHydrationReady(true);
    preloadImage(SCHOOLS_MAP_IMAGE_SRC);
    const dismissed = readSchoolsMapMissionBriefDismissed();
    setSchoolsBriefDismissed(dismissed);
    if (dismissed) {
      setGuidePhase("landed");
    }
  }, []);

  useEffect(() => {
    if (!hydrationReady || showMissionBrief) return;

    const demoPastBrief =
      (schoolsDemo.active || schoolsDemoFullscreen || isSchoolsDemoStoryModeActive()) &&
      schoolsDemo.step === "map";

    if (schoolsBriefDismissed || demoPastBrief) {
      setGuidePhase((prev) => (prev === "animating" ? prev : "landed"));
    }
  }, [
    hydrationReady,
    showMissionBrief,
    schoolsBriefDismissed,
    schoolsDemo.active,
    schoolsDemo.step,
    schoolsDemoFullscreen
  ]);

  useEffect(() => {
    const onDemoReset = () => {
      setSchoolsBriefDismissed(true);
      setGuidePhase("landed");
      setShowBusinessGuideLabel(false);
    };
    window.addEventListener(SCHOOLS_DEMO_RESET_EVENT, onDemoReset);
    return () => window.removeEventListener(SCHOOLS_DEMO_RESET_EVENT, onDemoReset);
  }, []);

  return (
    <main
      className={[
        "pointer-events-auto relative w-full overflow-hidden bg-bg-0",
        schoolsDemoFullscreen ? "" : "-mb-24",
        hydrationReady ? "" : "static-ui"
      ].join(" ")}
    >
      <div
        className={[
          "relative z-[1] mx-auto w-full overflow-hidden transition-[filter] duration-500",
          schoolsDemoFullscreen
            ? "schools-demo-map-stage-height"
            : "quest-map-stage-height",
          "px-1.5 py-1 sm:px-2 sm:py-1.5 md:px-2.5 md:py-2",
          showMissionBrief ? "iq-schools-map-stage-dimmed" : "",
          mapInteractionLocked ? "pointer-events-none" : "pointer-events-auto"
        ].join(" ")}
        data-map-stage
      >
        <SchoolsQuestMapScreen
          unlockAnimationActive={guidePhase === "animating"}
          onUnlockAnimationComplete={handleUnlockAnimationComplete}
          highlightIslandId={guidePhase === "landed" ? "business" : null}
          showBusinessGuideLabel={showBusinessGuideLabel}
          bridgePulseActive={guidePhase === "landed"}
        />
      </div>

      <SchoolsMissionBriefSequence
        open={showMissionBrief}
        onDismiss={finishMissionBrief}
        overlayMode="map"
      />
    </main>
  );
}
