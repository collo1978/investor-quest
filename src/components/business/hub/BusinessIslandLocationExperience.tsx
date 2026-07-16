"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { BusinessIslandHqDecodeExperience } from "@/components/business/hub/BusinessIslandHqDecodeExperience";
import { BusinessIslandPlaceGlyph } from "@/components/business/hub/BusinessIslandPlaceGlyph";
import {
  formatInvestorNotebookQuestion,
  INVESTOR_NOTEBOOK_QUESTIONS,
  type InvestorNotebookQuestionId
} from "@/lib/business/businessIslandInvestorNotebook";
import type { BusinessIslandStoryLocationDef } from "@/lib/business/businessIslandStoryLocations";
import {
  atmosphereLabelForTheme,
  resolveDistrictMission,
  resolveLocationExperience,
  type DistrictMissionExperience
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
 * District hub — pick missions inside a landmark; game-room feel, not a quiz card.
 */
export function BusinessIslandLocationExperience(props: Props) {
  if (props.location.id === "district-hq") {
    return (
      <BusinessIslandHqDecodeExperience
        location={props.location}
        companyId={props.companyId}
        companyName={props.companyName}
        onBeforeQuestNavigate={props.onBeforeQuestNavigate}
        onLeave={() => props.onLeave(props.alreadyExplored)}
      />
    );
  }

  return <BusinessIslandDistrictExperience {...props} />;
}

function BusinessIslandDistrictExperience({
  location,
  companyId: _companyId,
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

  const [phase, setPhase] = useState<"arrive" | "hub" | "mission">(
    reduceMotion ? "hub" : "arrive"
  );
  const [activeMission, setActiveMission] =
    useState<DistrictMissionExperience | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [completedThisVisit, setCompletedThisVisit] = useState(false);
  const focusConsumedRef = useRef(false);

  useEffect(() => {
    if (phase !== "arrive" || reduceMotion) return;
    const t = window.setTimeout(() => setPhase("hub"), 900);
    return () => window.clearTimeout(t);
  }, [phase, reduceMotion]);

  useEffect(() => {
    if (!focusQuestionId || focusConsumedRef.current || phase === "arrive") return;
    const mission = resolveDistrictMission(location.id, focusQuestionId);
    if (!mission) return;
    focusConsumedRef.current = true;
    setActiveMission(mission);
    setRevealed(masteredSet.has(focusQuestionId) ? mission.insights.length : 0);
    setPhase("mission");
  }, [focusQuestionId, location.id, masteredSet, phase]);

  const missionLine = location.missionLine.replace(/NVIDIA/g, companyName);
  const allDistrictMastered = location.notebookQuestionIds.every((id) =>
    masteredSet.has(id)
  );

  const openMission = (mission: DistrictMissionExperience) => {
    setActiveMission(mission);
    setRevealed(masteredSet.has(mission.questionId) ? mission.insights.length : 0);
    setPhase("mission");
  };

  const finishMission = () => {
    if (!activeMission) return;
    if (!masteredSet.has(activeMission.questionId)) {
      onMissionMastered(activeMission.questionId);
      setCompletedThisVisit(true);
    }
    setActiveMission(null);
    setPhase("hub");
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
        ) : phase === "hub" ? (
          <motion.div
            key="hub"
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

            <p className="iq-business-island-location-xp__ambience">
              {experience.ambience.replace(/NVIDIA/g, companyName)}
            </p>
            <p className="iq-business-island-location-xp__mission">{missionLine}</p>

            <p className="iq-business-island-location-xp__missions-label">
              District missions
            </p>
            <ul className="iq-business-island-location-xp__missions">
              {experience.missions.map((mission) => {
                const done = masteredSet.has(mission.questionId);
                const question = INVESTOR_NOTEBOOK_QUESTIONS.find(
                  (q) => q.id === mission.questionId
                );
                const prompt = question
                  ? formatInvestorNotebookQuestion(
                      question.questionTemplate,
                      companyName
                    )
                  : mission.missionTitle;
                return (
                  <li key={mission.questionId}>
                    <button
                      type="button"
                      className={[
                        "iq-business-island-location-xp__mission-card",
                        done
                          ? "iq-business-island-location-xp__mission-card--done"
                          : ""
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => openMission(mission)}
                    >
                      <span className="iq-business-island-location-xp__mission-status" aria-hidden>
                        {done ? "✓" : "●"}
                      </span>
                      <span className="iq-business-island-location-xp__mission-copy">
                        <span className="iq-business-island-location-xp__mission-title">
                          {mission.missionTitle}
                        </span>
                        <span className="iq-business-island-location-xp__mission-prompt">
                          {prompt}
                        </span>
                      </span>
                      <span className="iq-business-island-location-xp__mission-cta">
                        {done ? "Replay" : "Enter →"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <footer className="iq-business-island-location-xp__footer">
              <button
                type="button"
                className="iq-business-island-location-xp__cta"
                onClick={leaveIsland}
              >
                {allDistrictMastered
                  ? "District cleared — return to island →"
                  : alreadyExplored || completedThisVisit
                    ? "Return to the island →"
                    : "Leave district →"}
              </button>
            </footer>
          </motion.div>
        ) : activeMission ? (
          <motion.div
            key={activeMission.questionId}
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
                  {location.placeName}
                </p>
                <h2 className="iq-business-island-location-xp__title">
                  {activeMission.missionTitle}
                </h2>
              </div>
              <button
                type="button"
                className="iq-business-island-location-xp__close"
                aria-label="Back to district hub"
                onClick={() => {
                  setActiveMission(null);
                  setPhase("hub");
                }}
              >
                ← District
              </button>
            </header>

            <ol className="iq-business-island-location-xp__insights">
              {activeMission.insights.map((insight, index) => {
                const open = index < revealed;
                return (
                  <li
                    key={insight}
                    className={[
                      "iq-business-island-location-xp__insight",
                      open
                        ? "iq-business-island-location-xp__insight--open"
                        : "iq-business-island-location-xp__insight--sealed"
                    ].join(" ")}
                  >
                    {open ? (
                      <>
                        <span className="iq-business-island-location-xp__insight-index">
                          {index + 1}
                        </span>
                        <p>{insight.replace(/NVIDIA/g, companyName)}</p>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="iq-business-island-location-xp__reveal"
                        disabled={index !== revealed}
                        onClick={() => setRevealed((n) => n + 1)}
                      >
                        {index === revealed
                          ? "Uncover this discovery →"
                          : "Locked until prior discovery"}
                      </button>
                    )}
                  </li>
                );
              })}
            </ol>

            <footer className="iq-business-island-location-xp__footer">
              {revealed >= activeMission.insights.length ? (
                <button
                  type="button"
                  className="iq-business-island-location-xp__cta"
                  onClick={finishMission}
                >
                  {masteredSet.has(activeMission.questionId)
                    ? "Back to district missions →"
                    : "I can explain this — mark mastery →"}
                </button>
              ) : (
                <p className="iq-business-island-location-xp__hint">
                  Uncover each discovery to complete this mission.
                </p>
              )}
            </footer>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
