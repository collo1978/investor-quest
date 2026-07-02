"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";
import {
  MASTER_INVESTING_PRINCIPLES,
  resolveLatestMasteredQuestSlug,
  resolveMasterInvestingPrinciples,
  resolveNextPrincipleToMaster
} from "@/lib/business/masterInvestingPrinciples";

type Props = {
  cards: readonly BusinessHubQuestCard[];
  variant?: "schools" | "dark";
  /** Journey hub — mastery-first chrome. Island hub — compact shore panel. Map camera — kiosk sign. Ladder sheet — full detail. */
  presentation?: "default" | "journey" | "island" | "island-kiosk" | "ladder";
  /** Quest slug that just completed — triggers tick celebration. */
  celebrateQuestSlug?: string | null;
};

const TOTAL = MASTER_INVESTING_PRINCIPLES.length;
const CELEBRATE_MS = 2400;

function PrincipleStatusIcon({
  mastered,
  celebrating,
  reduceMotion
}: {
  mastered: boolean;
  celebrating: boolean;
  reduceMotion: boolean | null;
}) {
  if (!mastered) {
    return (
      <span
        className="iq-master-principles-panel__circle"
        aria-hidden
      />
    );
  }

  return (
    <span className="iq-master-principles-panel__tick-wrap" aria-hidden>
      {celebrating && !reduceMotion ? (
        <motion.span
          className="iq-master-principles-panel__tick-glow pointer-events-none absolute inset-[-8px]"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 0.95, 0], scale: [0.6, 1.5, 1.7] }}
          transition={{ duration: 0.85, ease: "easeOut" }}
        />
      ) : null}
      <motion.span
        className={[
          "iq-master-principles-panel__tick",
          celebrating ? "iq-master-principles-panel__tick--celebrate" : ""
        ]
          .filter(Boolean)
          .join(" ")}
        initial={
          celebrating && !reduceMotion
            ? { scale: 0.2, opacity: 0, rotate: -48 }
            : false
        }
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={
          reduceMotion
            ? { duration: 0.15 }
            : { type: "spring", stiffness: 460, damping: 16, mass: 0.72 }
        }
      >
        ✓
      </motion.span>
    </span>
  );
}

/**
 * Business Island mastery tracker — seven investing principles unlocked by quests.
 */
export function MasterInvestingPrinciplesPanel({
  cards,
  variant = "schools",
  presentation = "default",
  celebrateQuestSlug = null
}: Props) {
  const reduceMotion = useReducedMotion();
  const isSchools = variant === "schools";
  const isJourney = presentation === "journey";
  const isIsland = presentation === "island" || presentation === "island-kiosk";
  const isKiosk = presentation === "island-kiosk";
  const isLadder = presentation === "ladder";
  const principles = useMemo(
    () => resolveMasterInvestingPrinciples(cards),
    [cards]
  );
  const masteredCount = principles.filter((p) => p.mastered).length;
  const spotlightQuestSlug = useMemo(
    () => resolveLatestMasteredQuestSlug(cards),
    [cards]
  );
  const currentQuestSlug = useMemo(() => {
    if (!isLadder) return null;
    return resolveNextPrincipleToMaster(cards)?.questSlug ?? null;
  }, [cards, isLadder]);

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
      className={[
        "iq-master-principles-panel pointer-events-auto",
        isSchools ? "iq-master-principles-panel--schools" : "iq-master-principles-panel--dark",
        isJourney ? "iq-master-principles-panel--journey" : "",
        isIsland ? "iq-master-principles-panel--island" : "",
        isKiosk ? "iq-master-principles-panel--island-kiosk" : "",
        isLadder ? "iq-master-principles-panel--ladder" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={
        isLadder
          ? "Investment quality check ladder"
          : isIsland
            ? "Investment quality check on Business Island"
            : isJourney
              ? "Investment quality check progression"
              : "Your investor toolkit progress"
      }
    >
      <header className="iq-master-principles-panel__header-band">
        <span aria-hidden className="iq-master-principles-panel__medal">
          🏅
        </span>
        <h2 className="iq-master-principles-panel__title">
          {isKiosk
            ? "Principles"
            : isIsland || isJourney || isLadder
              ? "Investment Quality Check"
              : "Your Investor Toolkit"}
        </h2>
        {!isLadder ? (
          <p className="iq-master-principles-panel__subtitle">
            {isKiosk
              ? "Progress board"
              : isIsland
                ? "Mastery ladder"
                : isJourney
                  ? "Your permanent progression"
                  : "Principles you're mastering"}
          </p>
        ) : null}
        <div className="iq-master-principles-panel__title-divider" aria-hidden />
      </header>

      <div className="iq-master-principles-panel__body">
        <ul className="iq-master-principles-panel__list">
          {principles.map((principle) => {
            const isCelebrating =
              celebrateSlug === principle.questSlug && principle.mastered;
            const isSpotlight =
              !isLadder &&
              principle.mastered &&
              principle.questSlug === spotlightQuestSlug;
            const isCurrent =
              isLadder &&
              !principle.mastered &&
              principle.questSlug === currentQuestSlug;

            return (
              <li
                key={principle.id}
                className={[
                  "iq-master-principles-panel__item",
                  principle.mastered
                    ? "iq-master-principles-panel__item--mastered"
                    : "iq-master-principles-panel__item--pending",
                  isCurrent ? "iq-master-principles-panel__item--current" : "",
                  isSpotlight ? "iq-master-principles-panel__item--spotlight" : "",
                  isCelebrating ? "iq-master-principles-panel__item--celebrate" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <PrincipleStatusIcon
                  mastered={principle.mastered}
                  celebrating={isCelebrating}
                  reduceMotion={reduceMotion}
                />
                <span className="iq-master-principles-panel__label">
                  {principle.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <footer className="iq-master-principles-panel__footer">
        <motion.p
          className="iq-master-principles-panel__progress"
          aria-live="polite"
          key={displayCount}
          initial={reduceMotion ? false : { scale: 0.96, opacity: 0.88 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
        >
          <span aria-hidden className="iq-master-principles-panel__progress-star">
            ⭐
          </span>
          <span className="iq-master-principles-panel__progress-text">
            <span className="iq-master-principles-panel__progress-count tabular-nums">
              {displayCount}
            </span>
            {" of "}
            <span className="tabular-nums">{TOTAL}</span>
            {" Principles"}
          </span>
        </motion.p>
        {displayCount < TOTAL && !isIsland && !isLadder && !isJourney ? (
          <p className="iq-master-principles-panel__footer-hint">
            Complete quests to add principles to your toolkit
          </p>
        ) : null}
      </footer>
    </section>
  );
}
