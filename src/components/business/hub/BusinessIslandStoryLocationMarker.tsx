"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import type { BusinessIslandStoryLocationDef } from "@/lib/business/businessIslandStoryLocations";
import type { BusinessIslandStoryLocationVisualState } from "@/lib/business/businessIslandStoryProgress";

type Props = {
  location: BusinessIslandStoryLocationDef;
  left: string;
  top: string;
  state: BusinessIslandStoryLocationVisualState;
  companyName: string;
  missionsDone: number;
  missionsTotal: number;
  onSelect: (location: BusinessIslandStoryLocationDef) => void;
};

/**
 * District pin — description tooltip only on the active unlocked destination.
 */
export function BusinessIslandStoryLocationMarker({
  location,
  left,
  top,
  state,
  companyName,
  missionsDone,
  missionsTotal,
  onSelect
}: Props) {
  const reduceMotion = useReducedMotion();
  const isLocked = state === "locked";
  const isActive = state === "active";
  const isVisited = state === "visited";
  const wasLockedRef = useRef(isLocked);
  const [unlockBeacon, setUnlockBeacon] = useState(false);
  const allClear = missionsTotal > 0 && missionsDone >= missionsTotal;

  useEffect(() => {
    if (isLocked) {
      wasLockedRef.current = true;
      setUnlockBeacon(false);
      return;
    }
    if (wasLockedRef.current && location.order > 1) {
      setUnlockBeacon(true);
      wasLockedRef.current = false;
      const t = window.setTimeout(() => setUnlockBeacon(false), 2600);
      return () => window.clearTimeout(t);
    }
  }, [isLocked, location.order]);

  const mission = location.missionLine.replace(/NVIDIA/g, companyName);
  const ariaLabel = isVisited
    ? `${location.placeName}: completed — ${missionsDone}/${missionsTotal}`
    : isLocked
      ? `${location.placeName} locked`
      : isActive
        ? `${location.placeName}: ${mission} — next destination`
        : `${location.placeName}`;

  return (
    <div
      className={[
        "iq-business-island-story-marker-anchor",
        `iq-business-island-story-marker-anchor--theme-${location.placeTheme}`,
        `iq-business-island-story-marker-anchor--${state}`,
        unlockBeacon ? "iq-business-island-story-marker-anchor--unlock-beacon" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ left, top }}
    >
      <motion.button
        type="button"
        className={[
          "iq-business-island-story-marker pointer-events-auto",
          `iq-business-island-story-marker--${state}`,
          unlockBeacon ? "iq-business-island-story-marker--unlock-beacon" : ""
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label={ariaLabel}
        aria-current={isActive ? "step" : undefined}
        disabled={isLocked}
        onClick={() => {
          if (isLocked) return;
          onSelect(location);
        }}
        whileHover={
          isLocked || reduceMotion
            ? undefined
            : { y: -5, transition: { duration: 0.18 } }
        }
        whileTap={
          isLocked || reduceMotion
            ? undefined
            : { scale: 0.96, transition: { duration: 0.12 } }
        }
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.38,
          delay: 0.04 + location.order * 0.04,
          ease: [0.22, 1, 0.36, 1]
        }}
      >
        <span className="iq-business-island-story-marker__halo" aria-hidden />
        <span className="iq-business-island-story-marker__shadow" aria-hidden />
        <span className="iq-business-island-story-marker__post" aria-hidden />
        <span className="iq-business-island-story-marker__cap">
          {isActive || unlockBeacon ? (
            <>
              <span
                className="iq-business-island-story-marker__pulse iq-business-island-story-marker__pulse--outer"
                aria-hidden
              />
              <span className="iq-business-island-story-marker__pulse" aria-hidden />
            </>
          ) : null}
          {allClear || isVisited ? (
            <span className="iq-business-island-story-marker__tick" aria-hidden>
              ✓
            </span>
          ) : (
            <span className="iq-business-island-story-marker__emoji" aria-hidden>
              {location.emoji}
            </span>
          )}
          {isLocked ? (
            <span className="iq-business-island-story-marker__lock-badge" aria-hidden>
              🔒
            </span>
          ) : null}
        </span>
        <span className="iq-business-island-story-marker__label">
          <span className="iq-business-island-story-marker__place">
            {location.placeName}
          </span>
          {missionsTotal > 0 ? (
            <span className="iq-business-island-story-marker__progress">
              {isLocked ? (
                <>
                  <span aria-hidden>🔒</span> {missionsDone}/{missionsTotal}
                </>
              ) : (
                `${missionsDone}/${missionsTotal}`
              )}
            </span>
          ) : null}
        </span>
      </motion.button>
    </div>
  );
}
