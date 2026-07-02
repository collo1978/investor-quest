"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";
import {
  MASTER_INVESTING_PRINCIPLES,
  resolveLatestMasteredQuestSlug,
  resolveMasterInvestingPrinciples
} from "@/lib/business/masterInvestingPrinciples";

type Props = {
  cards: readonly BusinessHubQuestCard[];
  celebrateQuestSlug?: string | null;
};

const TOTAL = MASTER_INVESTING_PRINCIPLES.length;
const CELEBRATE_MS = 2400;

/** Shoreline arc positions — hydration-safe fixed layout. */
const SEAL_ARC_SLOTS = [
  { left: "2%", lift: 0 },
  { left: "15%", lift: 10 },
  { left: "28%", lift: 18 },
  { left: "41%", lift: 22 },
  { left: "54%", lift: 18 },
  { left: "67%", lift: 10 },
  { left: "80%", lift: 0 }
] as const;

/**
 * Concept A — compact principle seals along the island shoreline (not a sidebar).
 */
export function PrinciplesSealArc({
  cards,
  celebrateQuestSlug = null
}: Props) {
  const reduceMotion = useReducedMotion();
  const principles = useMemo(
    () => resolveMasterInvestingPrinciples(cards),
    [cards]
  );
  const masteredCount = principles.filter((p) => p.mastered).length;
  const spotlightQuestSlug = useMemo(
    () => resolveLatestMasteredQuestSlug(cards),
    [cards]
  );

  const prevMasteredRef = useRef(masteredCount);
  const [displayCount, setDisplayCount] = useState(masteredCount);
  const [celebrateSlug, setCelebrateSlug] = useState<string | null>(null);

  useEffect(() => {
    if (celebrateQuestSlug && !reduceMotion) {
      setCelebrateSlug(celebrateQuestSlug);
      if (masteredCount > prevMasteredRef.current) {
        setDisplayCount(Math.max(0, masteredCount - 1));
        const tick = window.setTimeout(
          () => setDisplayCount(masteredCount),
          180
        );
        const clear = window.setTimeout(() => setCelebrateSlug(null), CELEBRATE_MS);
        prevMasteredRef.current = masteredCount;
        return () => {
          window.clearTimeout(tick);
          window.clearTimeout(clear);
        };
      }
    }

    setDisplayCount(masteredCount);
    prevMasteredRef.current = masteredCount;
    if (!celebrateQuestSlug) setCelebrateSlug(null);
  }, [celebrateQuestSlug, masteredCount, reduceMotion]);

  return (
    <div
      className="iq-principles-seal-arc pointer-events-auto"
      aria-label="Investment quality check path"
    >
      <div className="iq-principles-seal-arc__header">
        <p className="iq-principles-seal-arc__title">Principles path</p>
        <motion.p
          className="iq-principles-seal-arc__count tabular-nums"
          aria-live="polite"
          key={displayCount}
          initial={reduceMotion ? false : { scale: 0.94, opacity: 0.88 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
        >
          {displayCount}/{TOTAL}
        </motion.p>
      </div>

      <svg
        className="iq-principles-seal-arc__path-glow pointer-events-none"
        viewBox="0 0 360 48"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M 4 38 Q 90 8 180 6 Q 270 8 356 38"
          fill="none"
          stroke="rgba(251, 191, 36, 0.45)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      <ul className="iq-principles-seal-arc__seals">
        {principles.map((principle, index) => {
          const slot = SEAL_ARC_SLOTS[index];
          const isCelebrating =
            celebrateSlug === principle.questSlug && principle.mastered;
          const isSpotlight =
            principle.mastered && principle.questSlug === spotlightQuestSlug;

          return (
            <li
              key={principle.id}
              className={[
                "iq-principles-seal-arc__seal",
                principle.mastered
                  ? "iq-principles-seal-arc__seal--mastered"
                  : "iq-principles-seal-arc__seal--pending",
                isSpotlight ? "iq-principles-seal-arc__seal--spotlight" : "",
                isCelebrating ? "iq-principles-seal-arc__seal--celebrate" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                left: slot.left,
                bottom: slot.lift
              }}
              title={principle.label}
            >
              <span className="iq-principles-seal-arc__seal-face" aria-hidden>
                {principle.mastered ? (
                  <motion.span
                    className="iq-principles-seal-arc__tick"
                    initial={
                      isCelebrating && !reduceMotion
                        ? { scale: 0.2, opacity: 0 }
                        : false
                    }
                    animate={{ scale: 1, opacity: 1 }}
                    transition={
                      reduceMotion
                        ? { duration: 0.15 }
                        : { type: "spring", stiffness: 460, damping: 16 }
                    }
                  >
                    ✓
                  </motion.span>
                ) : (
                  <span className="iq-principles-seal-arc__ring" />
                )}
              </span>
              <span className="iq-principles-seal-arc__label">
                {principle.shortLabel}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
