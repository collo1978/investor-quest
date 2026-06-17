"use client";

import { useCallback, useState } from "react";

import { SchoolsMissionBriefSequence } from "@/components/schools/SchoolsMissionBriefSequence";
import { SchoolsQuestMapScreen } from "@/components/schools/SchoolsQuestMapScreen";
import { primeMissionBriefAudio } from "@/lib/schools/missionBriefTypewriterSound";
import { SCHOOLS_UNLOCK_LABEL_MS } from "@/lib/schools/schoolsMapUnlockAnimation";

type GuidePhase = "idle" | "animating" | "landed";

/**
 * Direct preview — quest map behind the mission brief overlay (same as `/schools/map`).
 */
export default function SchoolsMissionBriefPreviewPage() {
  const [runId, setRunId] = useState(0);
  const [briefOpen, setBriefOpen] = useState(true);
  const [guidePhase, setGuidePhase] = useState<GuidePhase>("idle");
  const [showBusinessGuideLabel, setShowBusinessGuideLabel] = useState(false);

  const mapInteractionLocked = briefOpen || guidePhase === "animating";

  const handleUnlockAnimationComplete = useCallback(() => {
    setGuidePhase("landed");
    setShowBusinessGuideLabel(true);
    window.setTimeout(() => setShowBusinessGuideLabel(false), SCHOOLS_UNLOCK_LABEL_MS);
  }, []);

  return (
    <main className="relative h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-bg-0">
      <div
        className={[
          "schools-demo-map-stage-height relative z-[1] mx-auto w-full px-1.5 py-1",
          briefOpen ? "iq-schools-map-stage-dimmed" : "",
          mapInteractionLocked ? "pointer-events-none" : "pointer-events-auto"
        ].join(" ")}
      >
        <SchoolsQuestMapScreen
          unlockAnimationActive={guidePhase === "animating"}
          onUnlockAnimationComplete={handleUnlockAnimationComplete}
          highlightIslandId={guidePhase === "landed" ? "business" : null}
          showBusinessGuideLabel={showBusinessGuideLabel}
          bridgePulseActive={guidePhase === "landed"}
        />
      </div>

      <button
        type="button"
        onClick={() => {
          primeMissionBriefAudio();
          setBriefOpen(true);
          setGuidePhase("idle");
          setShowBusinessGuideLabel(false);
          setRunId((id) => id + 1);
        }}
        className="pointer-events-auto absolute left-4 top-[max(0.75rem,env(safe-area-inset-top))] z-[210] rounded-full border border-white/12 bg-black/50 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-2 transition hover:border-white/25 hover:text-ink-0"
      >
        Replay
      </button>

      <SchoolsMissionBriefSequence
        key={runId}
        open={briefOpen}
        previewMode
        overlayMode="map"
        onDismiss={() => {
          setBriefOpen(false);
          setGuidePhase("animating");
        }}
      />
    </main>
  );
}
