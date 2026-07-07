"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import { SCHOOLS_QUIZ_PASS_AUTO_CONTINUE_MS } from "@/lib/schools/schoolsQuestRewardFlow";
import { ConfettiBurst } from "@/ui/effects/ConfettiBurst";

const GREEN_HI = "#22C58B";
const GREEN_MISSION = "#15803d";
const MISSION_HEADING = "#0f172a";
const MISSION_BODY = "#475569";
const MISSION_MUTED = "#64748b";
const MISSION_STRONG = "#92400e";

type Props = {
  correct: number;
  total: number;
  microXpPerCorrect: number;
  accent: PillarQuestTheme;
  onContinue: () => void;
};

/**
 * Mini quiz pass screen — score recap before Investor Quality Check.
 */
export function SchoolsQuizPassResultsCelebration({
  correct,
  total,
  microXpPerCorrect,
  accent,
  onContinue
}: Props) {
  const reduceMotion = useReducedMotion();
  const continuedRef = useRef(false);
  const isMission = accent.cardChrome === "mission";

  const quizXp = correct * microXpPerCorrect;
  const perfect = correct === total;
  const headline = perfect ? "Perfect score!" : "Well done!";

  const handleContinue = useCallback(() => {
    if (continuedRef.current) return;
    continuedRef.current = true;
    onContinue();
  }, [onContinue]);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setTimeout(handleContinue, SCHOOLS_QUIZ_PASS_AUTO_CONTINUE_MS);
    return () => window.clearTimeout(timer);
  }, [handleContinue, reduceMotion]);

  return (
    <motion.div
      key="schools-quiz-pass-results"
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className={[
        "iq-schools-quiz-pass-results relative px-1 py-4 sm:px-2 sm:py-6",
        isMission ? "iq-schools-quiz-pass-results--mission" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {!reduceMotion ? (
        <ConfettiBurst
          triggerKey={`quiz-pass-${correct}-${total}`}
          count={22}
          spreadX={240}
          fallDistance={220}
          originTopPct={8}
          particleDurationSec={1.75}
          maxParticleDelaySec={0.42}
          activeDurationMs={2800}
          className="pointer-events-none absolute inset-x-[-6%] -top-4 bottom-0 z-0"
        />
      ) : null}

      <div
        className={[
          "iq-schools-quiz-pass-results__card relative z-10",
          isMission ? "iq-schools-quiz-pass-results__card--mission" : ""
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="relative z-10 flex flex-col items-center text-center">
          <motion.span
            className="iq-schools-quiz-pass-results__badge"
            initial={reduceMotion ? false : { scale: 0.72, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 340, damping: 22, delay: 0.06 }}
            aria-hidden
          >
            ✓
          </motion.span>

          <motion.h3
            className="iq-schools-quiz-pass-results__headline font-[var(--font-grotesk)]"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, delay: 0.1, ease: "easeOut" }}
            style={
              isMission
                ? {
                    color: MISSION_HEADING,
                    textShadow: "0 2px 0 rgba(255, 255, 255, 0.55)"
                  }
                : undefined
            }
          >
            {headline}
          </motion.h3>

          <motion.p
            className="iq-schools-quiz-pass-results__score mt-3 max-w-md"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, delay: 0.18, ease: "easeOut" }}
            style={isMission ? { color: MISSION_BODY } : undefined}
          >
            You got{" "}
            <strong
              className="iq-schools-quiz-pass-results__score-strong"
              style={isMission ? { color: MISSION_STRONG } : undefined}
            >
              {correct} of {total}
            </strong>{" "}
            right.
          </motion.p>

          {quizXp > 0 ? (
            <motion.p
              className="iq-schools-quiz-pass-results__xp mt-4"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 24, delay: 0.26 }}
              style={{ color: isMission ? GREEN_MISSION : GREEN_HI }}
            >
              +{quizXp} quiz XP
            </motion.p>
          ) : null}

          <motion.p
            className="iq-schools-quiz-pass-results__next mt-5 max-w-sm text-[13px] leading-relaxed"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.34 }}
            style={isMission ? { color: MISSION_MUTED } : undefined}
          >
            Next up: use your evidence to judge how strongly this business meets
            each investor quality.
          </motion.p>

          <motion.button
            type="button"
            className={[
              "iq-schools-quiz-pass-results__cta mt-7",
              isMission ? "iq-schools-quiz-pass-results__cta--mission" : ""
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={handleContinue}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.42 }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            style={
              isMission
                ? undefined
                : {
                    borderColor: accent.border,
                    color: accent.hi,
                    boxShadow: `0 0 22px -10px ${accent.glow}`
                  }
            }
          >
            Continue
          </motion.button>

          {!reduceMotion ? (
            <p
              className="iq-schools-quiz-pass-results__auto mt-3 text-[11px] font-medium uppercase tracking-[0.14em]"
              style={isMission ? { color: MISSION_MUTED } : undefined}
            >
              Continuing automatically…
            </p>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
