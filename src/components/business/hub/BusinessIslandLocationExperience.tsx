"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { BusinessIslandHqDecodeExperience } from "@/components/business/hub/BusinessIslandHqDecodeExperience";
import { BusinessIslandMissionFlow } from "@/components/business/hub/BusinessIslandMissionFlow";
import { BusinessIslandPlaceGlyph } from "@/components/business/hub/BusinessIslandPlaceGlyph";
import type { InvestorNotebookQuestionId } from "@/lib/business/businessIslandInvestorNotebook";
import type { BusinessIslandStoryLocationDef } from "@/lib/business/businessIslandStoryLocations";
import {
  atmosphereLabelForTheme,
  resolveLocationExperience
} from "@/lib/business/businessIslandLocationExperience";

type Props = {
  location: BusinessIslandStoryLocationDef;
  companyId: string;
  companyName: string;
  alreadyExplored: boolean;
  masteredQuestionIds: readonly InvestorNotebookQuestionId[];
  /** Checklist deep-link — jump straight into this mission. */
  focusQuestionId?: InvestorNotebookQuestionId | null;
  onBeforeQuestNavigate?: (href: string) => void;
  onMissionMastered: (questionId: InvestorNotebookQuestionId) => void;
  onLeave: (markVisited: boolean) => void;
};

/**
 * District room — arrive, then chain each checklist question:
 * evidence → answer → checklist tick → next question.
 */
export function BusinessIslandLocationExperience(props: Props) {
  if (props.location.id === "district-hq") {
    return (
      <BusinessIslandHqDecodeExperience
        location={props.location}
        companyName={props.companyName}
        onMissionMastered={props.onMissionMastered}
        onLeave={() => props.onLeave(true)}
      />
    );
  }

  return <BusinessIslandDistrictExperience {...props} />;
}

function BusinessIslandDistrictExperience({
  location,
  companyName,
  alreadyExplored,
  masteredQuestionIds,
  focusQuestionId = null,
  onMissionMastered,
  onLeave
}: Props) {
  const reduceMotion = useReducedMotion();
  const experience = resolveLocationExperience(location.id);
  const masteredSet = useMemo(
    () => new Set(masteredQuestionIds),
    [masteredQuestionIds]
  );

  const [phase, setPhase] = useState<"arrive" | "flow">(
    reduceMotion ? "flow" : "arrive"
  );
  const [completedThisVisit, setCompletedThisVisit] = useState(false);

  useEffect(() => {
    if (phase !== "arrive" || reduceMotion) return;
    const t = window.setTimeout(() => setPhase("flow"), 900);
    return () => window.clearTimeout(t);
  }, [phase, reduceMotion]);

  const startIndex = useMemo(() => {
    if (!focusQuestionId) return 0;
    const idx = location.notebookQuestionIds.indexOf(focusQuestionId);
    return idx >= 0 ? idx : 0;
  }, [focusQuestionId, location.notebookQuestionIds]);

  const allDistrictMastered = location.notebookQuestionIds.every((id) =>
    masteredSet.has(id)
  );

  const handleQuestionMastered = (questionId: InvestorNotebookQuestionId) => {
    if (!masteredSet.has(questionId)) {
      setCompletedThisVisit(true);
    }
    onMissionMastered(questionId);
  };

  const leaveIsland = () => {
    onLeave(alreadyExplored || completedThisVisit || allDistrictMastered);
  };

  return (
    <motion.div
      className={[
        "iq-business-island-location-xp pointer-events-auto",
        `iq-business-island-location-xp--${location.placeTheme}`
      ].join(" ")}
      role="dialog"
      aria-modal="true"
      aria-label={`${experience.roomName}: ${location.placeName}`}
      initial={reduceMotion ? false : { opacity: 0, scale: 1.06 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0, scale: 1.03, y: 10 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="iq-business-island-location-xp__fx" aria-hidden>
        <span className="iq-business-island-location-xp__wash" />
        <span className="iq-business-island-location-xp__particles" />
        <span className="iq-business-island-location-xp__horizon" />
        <span className="iq-business-island-location-xp__motif" />
      </div>

      <AnimatePresence mode="wait">
        {phase === "arrive" ? (
          <motion.div
            key="arrive"
            className="iq-business-island-location-xp__arrive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="iq-business-island-location-xp__arrive-label">
              {atmosphereLabelForTheme(location.placeTheme)}
            </p>
            <p className="iq-business-island-location-xp__arrive-place">
              {location.placeName}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="flow"
            className="iq-business-island-location-xp__panel"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="iq-business-island-location-xp__header">
              <span className="iq-business-island-location-xp__glyph" aria-hidden>
                <BusinessIslandPlaceGlyph theme={location.placeTheme} />
              </span>
              <div>
                <p className="iq-business-island-location-xp__room">
                  {experience.roomName}
                </p>
                <h2 className="iq-business-island-location-xp__title">
                  {location.chapterTitle}
                </h2>
              </div>
              <button
                type="button"
                className="iq-business-island-location-xp__close"
                aria-label="Return to Business Island"
                onClick={leaveIsland}
              >
                ← Island
              </button>
            </header>

            <BusinessIslandMissionFlow
              questionIds={location.notebookQuestionIds}
              companyName={companyName}
              startIndex={startIndex}
              onQuestionMastered={handleQuestionMastered}
              onComplete={leaveIsland}
              completeLabel={
                allDistrictMastered
                  ? "District cleared — return to island →"
                  : "Return to the island →"
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
