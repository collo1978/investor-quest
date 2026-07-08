"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { MissionEnvelopeBriefSequence } from "@/components/schools/MissionEnvelopeBriefSequence";
import { SchoolsMapBusinessIslandHubUiOverlay } from "@/components/schools/SchoolsMapBusinessIslandHubUiOverlay";
import { SchoolsProdigyMapScreen } from "@/components/schools/SchoolsProdigyMapScreen";
import { SchoolsQuestMapScreen } from "@/components/schools/SchoolsQuestMapScreen";
import { useSchoolsDemoStory } from "@/components/schools/SchoolsDemoStoryProvider";
import { preloadImage } from "@/lib/preloadImage";
import { SCHOOLS_MAP_IMAGE_SRC } from "@/lib/schools/schoolsMapConfig";
import { isSchoolsDemoPath } from "@/lib/schools/schoolsDemoHref";
import {
  dismissSchoolsMapMissionBrief,
  readSchoolsMapMissionBriefDismissed
} from "@/lib/schools/schoolsMapMissionBriefState";
import {
  advanceSchoolsDemoStoryStep,
  clearSchoolsDemoMapBriefPending,
  isSchoolsDemoStoryModeActive
} from "@/lib/schools/schoolsDemoStoryMode";
import { SCHOOLS_DEMO_RESET_EVENT } from "@/lib/schools/resetSchoolsDemoProgress";
import {
  clearSchoolsBusinessIslandHubEntered,
  clearSchoolsBusinessIslandZoomInProgress,
  hasSchoolsBusinessIslandHubEntered,
  markSchoolsBusinessIslandHubEntered,
  markSchoolsBusinessIslandZoomInProgress
} from "@/lib/schools/schoolsBusinessIslandZoomEnter";
import { resolveBusinessIslandProgressTier } from "@/lib/schools/schoolsProdigyMapConfig";
import { preloadQuestDetailChunks } from "@/lib/quests/preloadQuestDetailChunks";
import { SCHOOLS_UNLOCK_LAND_MS } from "@/lib/schools/schoolsMapUnlockAnimation";

const CANONICAL_SCHOOLS_MAP_PATH = "/schools/map";

/** Brief beat after the cinematic Business Island flash before entering the hub. */
const BUSINESS_HUB_NAV_DELAY_MS = SCHOOLS_UNLOCK_LAND_MS + 180;

type GuidePhase = "idle" | "awaiting-click" | "animating" | "zooming" | "hub" | "landed";

/** Schools-only map page — Prodigy overworld with envelope mission brief. */
export default function SchoolsMapPageClient() {
  const pathname = usePathname();
  const router = useRouter();
  const isCanonicalSchoolsMap = pathname === CANONICAL_SCHOOLS_MAP_PATH;
  const schoolsDemoFullscreen = isSchoolsDemoPath(pathname);
  /** Prodigy overworld for Schools demo + live map; cinematic map is preview-only. */
  const useProdigyMap =
    schoolsDemoFullscreen ||
    isCanonicalSchoolsMap ||
    pathname.startsWith("/schools/preview/map-prodigy");

  const [hydrationReady, setHydrationReady] = useState(false);
  const [briefStateReady, setBriefStateReady] = useState(false);
  const [schoolsBriefDismissed, setSchoolsBriefDismissed] = useState(false);
  const [envelopeBriefOpen, setEnvelopeBriefOpen] = useState(false);
  const [guidePhase, setGuidePhase] = useState<GuidePhase>("idle");
  const [showBusinessGuideLabel, setShowBusinessGuideLabel] = useState(false);
  const [mapSessionKey, setMapSessionKey] = useState(0);
  const navigateAfterUnlockRef = useRef<number | null>(null);
  const [businessProgressTier, setBusinessProgressTier] = useState(0);
  const schoolsDemo = useSchoolsDemoStory();

  const demoStoryActive =
    schoolsDemo.active || schoolsDemoFullscreen || isSchoolsDemoStoryModeActive();

  /** Session dismiss flag is source of truth — not story step (step resets to `map` on reload). */
  const showMapEnvelopeBrief =
    briefStateReady &&
    !schoolsBriefDismissed &&
    (demoStoryActive || isCanonicalSchoolsMap);

  const missionBriefGateActive = showMapEnvelopeBrief;

  const mapInteractionLocked =
    (!useProdigyMap && guidePhase === "animating") || guidePhase === "zooming";

  const exitBusinessIslandHub = useCallback(() => {
    clearSchoolsBusinessIslandHubEntered();
    setBusinessProgressTier(0);
    setGuidePhase("landed");
  }, []);

  const finishMissionBrief = useCallback(() => {
    setEnvelopeBriefOpen(false);
    dismissSchoolsMapMissionBrief();
    clearSchoolsDemoMapBriefPending();
    setSchoolsBriefDismissed(true);
    setGuidePhase("awaiting-click");

    if (demoStoryActive) {
      advanceSchoolsDemoStoryStep("map");
    }
  }, [demoStoryActive]);

  const handleOpenEnvelopeBrief = useCallback(() => {
    if (missionBriefGateActive) {
      setEnvelopeBriefOpen(true);
    }
  }, [missionBriefGateActive]);

  const beginBusinessIslandZoom = useCallback(() => {
    markSchoolsBusinessIslandZoomInProgress();
    setGuidePhase("zooming");
  }, []);

  const goToBusinessHub = useCallback(() => {
    if (
      schoolsDemo.active ||
      schoolsDemoFullscreen ||
      isSchoolsDemoStoryModeActive()
    ) {
      advanceSchoolsDemoStoryStep("business-island");
    }
    beginBusinessIslandZoom();
  }, [beginBusinessIslandZoom, schoolsDemo.active, schoolsDemoFullscreen]);

  const finishBusinessIslandZoom = useCallback(() => {
    clearSchoolsBusinessIslandZoomInProgress();
    markSchoolsBusinessIslandHubEntered();
    if (
      schoolsDemo.active ||
      schoolsDemoFullscreen ||
      isSchoolsDemoStoryModeActive()
    ) {
      advanceSchoolsDemoStoryStep("business-island");
    }
    setGuidePhase("hub");
  }, [schoolsDemo.active, schoolsDemoFullscreen]);

  const handleBusinessIslandClick = useCallback(() => {
    if (guidePhase !== "awaiting-click" && guidePhase !== "landed") return;
    beginBusinessIslandZoom();
  }, [beginBusinessIslandZoom, guidePhase]);

  const handleQuestEnterRequest = useCallback(
    (href: string) => {
      preloadQuestDetailChunks();
      router.prefetch(href);
      router.push(href);
    },
    [router]
  );

  const handleHubProgressTier = useCallback(
    (completedCards: number, totalCards: number) => {
      setBusinessProgressTier(resolveBusinessIslandProgressTier(completedCards, totalCards));
    },
    []
  );

  const handleBusinessIslandEnter = useCallback(() => {
    if (guidePhase === "hub" || guidePhase === "zooming") {
      return;
    }
    if (missionBriefGateActive && guidePhase === "idle") return;
    beginBusinessIslandZoom();
  }, [beginBusinessIslandZoom, guidePhase, missionBriefGateActive]);

  const handleUnlockAnimationComplete = useCallback(() => {
    setGuidePhase("landed");
    setShowBusinessGuideLabel(true);

    navigateAfterUnlockRef.current = window.setTimeout(() => {
      navigateAfterUnlockRef.current = null;
      setShowBusinessGuideLabel(false);
      goToBusinessHub();
    }, BUSINESS_HUB_NAV_DELAY_MS);
  }, [goToBusinessHub]);

  useLayoutEffect(() => {
    setHydrationReady(true);
    preloadImage(SCHOOLS_MAP_IMAGE_SRC);
    const dismissed = readSchoolsMapMissionBriefDismissed();
    setSchoolsBriefDismissed(dismissed);
    setBriefStateReady(true);
    if (!dismissed) {
      setGuidePhase("idle");
      return;
    }
    if (hasSchoolsBusinessIslandHubEntered()) {
      setGuidePhase("hub");
    } else {
      setGuidePhase("landed");
    }
  }, []);

  useEffect(() => {
    const syncBriefDismissed = () => {
      setSchoolsBriefDismissed(readSchoolsMapMissionBriefDismissed());
    };
    window.addEventListener("iq-schools-map-brief-dismissed", syncBriefDismissed);
    return () =>
      window.removeEventListener("iq-schools-map-brief-dismissed", syncBriefDismissed);
  }, []);

  useEffect(() => {
    if (!missionBriefGateActive) {
      setEnvelopeBriefOpen(false);
    }
  }, [missionBriefGateActive]);

  useEffect(() => {
    if (!hydrationReady) return;

    const demoPastBrief =
      (schoolsDemo.active || schoolsDemoFullscreen || isSchoolsDemoStoryModeActive()) &&
      schoolsDemo.step === "map" &&
      schoolsBriefDismissed;

    if (schoolsBriefDismissed || demoPastBrief) {
      setGuidePhase((prev) =>
        prev === "animating" ||
        prev === "awaiting-click" ||
        prev === "zooming" ||
        prev === "hub"
          ? prev
          : "landed"
      );
    }
  }, [
    hydrationReady,
    schoolsBriefDismissed,
    schoolsDemo.active,
    schoolsDemo.step,
    schoolsDemoFullscreen
  ]);

  useEffect(() => {
    const onDemoReset = () => {
      setSchoolsBriefDismissed(false);
      setEnvelopeBriefOpen(false);
      setGuidePhase("idle");
      setShowBusinessGuideLabel(false);
      setMapSessionKey((key) => key + 1);
      clearSchoolsBusinessIslandHubEntered();
    };
    window.addEventListener(SCHOOLS_DEMO_RESET_EVENT, onDemoReset);
    return () => window.removeEventListener(SCHOOLS_DEMO_RESET_EVENT, onDemoReset);
  }, []);

  useEffect(() => {
    return () => {
      if (navigateAfterUnlockRef.current != null) {
        window.clearTimeout(navigateAfterUnlockRef.current);
      }
    };
  }, []);

  return (
    <main
      className={[
        "pointer-events-auto relative w-full overflow-hidden bg-bg-0",
        useProdigyMap ? "" : "-mb-24",
        hydrationReady ? "" : "static-ui"
      ].join(" ")}
    >
      <div
        className={[
          "relative z-[1] mx-auto w-full overflow-hidden transition-[filter] duration-500",
          useProdigyMap ? "schools-demo-map-stage-height" : "quest-map-stage-height",
          useProdigyMap ? "px-0 py-0" : "px-1.5 py-1 sm:px-2 sm:py-1.5 md:px-2.5 md:py-2",
          mapInteractionLocked ? "pointer-events-none" : "pointer-events-auto"
        ].join(" ")}
        data-map-stage
      >
        {useProdigyMap ? (
          <>
            <SchoolsProdigyMapScreen
              key={mapSessionKey}
              missionBriefGateActive={missionBriefGateActive}
              envelopeHudReady={briefStateReady}
              envelopeBriefOpen={envelopeBriefOpen}
              onEnvelopeBriefOpen={handleOpenEnvelopeBrief}
              onMissionBriefStartQuest={finishMissionBrief}
              businessIslandPromptActive={guidePhase === "awaiting-click"}
              onBusinessIslandClick={handleBusinessIslandClick}
              businessIslandZoomActive={guidePhase === "zooming"}
              businessIslandHubActive={guidePhase === "hub"}
              businessHqZoomActive={false}
              businessIslandProgressTier={businessProgressTier}
              onBusinessIslandZoomComplete={finishBusinessIslandZoom}
              onBusinessHqZoomComplete={undefined}
              onBusinessIslandEnter={handleBusinessIslandEnter}
            />
            {guidePhase === "hub" ? (
              <SchoolsMapBusinessIslandHubUiOverlay
                onBackToMap={exitBusinessIslandHub}
                onQuestEnterRequest={handleQuestEnterRequest}
                onProgressTierChange={handleHubProgressTier}
                uiVisible
              />
            ) : null}
          </>
        ) : (
          <SchoolsQuestMapScreen
            businessIslandPromptActive={guidePhase === "awaiting-click"}
            onBusinessIslandClick={handleBusinessIslandClick}
            unlockAnimationActive={guidePhase === "animating"}
            onUnlockAnimationComplete={handleUnlockAnimationComplete}
            highlightIslandId={
              guidePhase === "awaiting-click" || guidePhase === "landed"
                ? "business"
                : null
            }
            showBusinessGuideLabel={showBusinessGuideLabel}
            bridgePulseActive={guidePhase === "landed"}
          />
        )}
      </div>
      {useProdigyMap ? (
        <MissionEnvelopeBriefSequence
          open={envelopeBriefOpen && missionBriefGateActive}
          title="Business Island Mission Brief"
          onStartQuest={finishMissionBrief}
        />
      ) : null}
    </main>
  );
}
