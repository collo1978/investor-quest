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
  /** Quest slug that just completed — triggers chip celebration. */
  celebrateQuestSlug?: string | null;
};

const TOTAL = MASTER_INVESTING_PRINCIPLES.length;
const CELEBRATE_MS = 2400;

/**
 * Direction B — compact horizontal principle chips + mastery count.
 */
export function InvestorToolkitStrip({
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
    <section
      className="iq-investor-toolkit-strip pointer-events-auto"
      aria-label="Investment quality check progress"
    >
      <div className="iq-investor-toolkit-strip__header">
        <h2 className="iq-investor-toolkit-strip__title">
          Investment Quality Check
        </h2>
        <motion.p
          className="iq-investor-toolkit-strip__count tabular-nums"
          aria-live="polite"
          key={displayCount}
          initial={reduceMotion ? false : { scale: 0.94, opacity: 0.88 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
        >
          <span className="iq-investor-toolkit-strip__count-value">
            {displayCount}
          </span>
          <span className="iq-investor-toolkit-strip__count-sep">/</span>
          <span>{TOTAL}</span>
        </motion.p>
      </div>

      <div className="iq-investor-toolkit-strip__scroll-wrap">
        <ul className="iq-investor-toolkit-strip__chips">
          {principles.map((principle) => {
            const isCelebrating =
              celebrateSlug === principle.questSlug && principle.mastered;
            const isSpotlight =
              principle.mastered &&
              principle.questSlug === spotlightQuestSlug;

            return (
              <li
                key={principle.id}
                className={[
                  "iq-investor-toolkit-strip__chip",
                  principle.mastered
                    ? "iq-investor-toolkit-strip__chip--mastered"
                    : "iq-investor-toolkit-strip__chip--pending",
                  isSpotlight ? "iq-investor-toolkit-strip__chip--spotlight" : "",
                  isCelebrating ? "iq-investor-toolkit-strip__chip--celebrate" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                title={principle.label}
              >
                <span className="iq-investor-toolkit-strip__chip-icon" aria-hidden>
                  {principle.mastered ? "✓" : "○"}
                </span>
                <span className="iq-investor-toolkit-strip__chip-label">
                  {principle.shortLabel}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
