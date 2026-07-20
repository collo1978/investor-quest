"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { BusinessIslandPlaceGlyph } from "@/components/business/hub/BusinessIslandPlaceGlyph";
import { resolveLocationExperience } from "@/lib/business/businessIslandLocationExperience";
import type { BusinessIslandStoryLocationDef } from "@/lib/business/businessIslandStoryLocations";
import type { BusinessIslandStoryLocationVisualState } from "@/lib/business/businessIslandStoryProgress";

type Props = {
  location: BusinessIslandStoryLocationDef | null;
  companyName: string;
  state: BusinessIslandStoryLocationVisualState | null;
  masteredCount: number;
  onClose: () => void;
  onContinue: (location: BusinessIslandStoryLocationDef) => void;
};

/**
 * District preview — full guide copy only for the active destination.
 */
export function BusinessIslandStoryLocationDock({
  location,
  companyName,
  state,
  masteredCount,
  onClose,
  onContinue
}: Props) {
  const reduceMotion = useReducedMotion();
  const roomName = location
    ? resolveLocationExperience(location.id).roomName
    : "";
  const missionTotal = location?.notebookQuestionIds.length ?? 0;
  const isActive = state === "active";
  const isCleared = state === "visited";
  const mission = location
    ? location.missionLine.replace(/NVIDIA/g, companyName)
    : "";

  return (
    <AnimatePresence>
      {location ? (
        <motion.div
          key={location.id}
          className="iq-business-island-story-dock pointer-events-auto"
          role="dialog"
          aria-label={`Enter ${roomName}`}
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: 16 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="iq-business-island-story-dock__glow" aria-hidden />
          <button
            type="button"
            className="iq-business-island-story-dock__close"
            aria-label="Close district preview"
            onClick={onClose}
          >
            ✕
          </button>
          <div className="iq-business-island-story-dock__row">
            <span
              className={`iq-business-island-story-dock__glyph iq-business-island-story-dock__glyph--${location.placeTheme}`}
              aria-hidden
            >
              <BusinessIslandPlaceGlyph theme={location.placeTheme} />
            </span>
            <div>
              <p className="iq-business-island-story-dock__place">
                {location.emoji} {location.placeName}
              </p>
              <h3 className="iq-business-island-story-dock__title">{roomName}</h3>
            </div>
          </div>
          {isActive ? (
            <p className="iq-business-island-story-dock__teaser">{mission}</p>
          ) : isCleared ? (
            <p className="iq-business-island-story-dock__teaser">
              District cleared — revisit missions anytime.
            </p>
          ) : (
            <p className="iq-business-island-story-dock__teaser">
              Continue the campus path to unlock this district.
            </p>
          )}
          {missionTotal > 0 ? (
            <p className="iq-business-island-story-dock__missions">
              {masteredCount}/{missionTotal} checklist missions cleared
            </p>
          ) : null}
          <button
            type="button"
            className="iq-business-island-story-dock__cta"
            onClick={() => onContinue(location)}
          >
            {isCleared ? "Revisit district →" : "Enter district →"}
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
