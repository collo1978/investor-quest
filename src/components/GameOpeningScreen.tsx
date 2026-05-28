"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import {
  INVESTOR_MASTERY_HERO_SRC,
  InvestorMasteryHeroScreen
} from "@/components/opening/InvestorMasteryHeroScreen";

const OPENING_LOGO_SRC = "/logos/investor-quest-logo.png";

/** Screen 1: logo power-on. */
const OPENING_BLANK_MS = 800;
const OPENING_FADE_IN_MS = 1100;
const OPENING_HOLD_MS = 520;

/** Screen 2: full-bleed mastery hero. */
const CROSSFADE_MS = 800;
const MASTERY_FADE_MS = 920;
const MASTERY_HOLD_MS = 4500;

export type GameOpeningScreenProps = {
  onComplete: () => void;
};

type IntroPhase = "logo" | "mastery";

/**
 * Bank/Broker opening: logo → mastery hero → `onComplete`.
 */
export function GameOpeningScreen({ onComplete }: GameOpeningScreenProps) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<IntroPhase>("logo");

  useEffect(() => {
    const img = new Image();
    img.src = INVESTOR_MASTERY_HERO_SRC;
  }, []);

  const logoPhaseMs = useMemo(
    () => OPENING_BLANK_MS + OPENING_FADE_IN_MS + OPENING_HOLD_MS,
    []
  );

  const masteryPhaseMs = CROSSFADE_MS + MASTERY_FADE_MS + MASTERY_HOLD_MS;

  useEffect(() => {
    if (reduceMotion) {
      const masteryTimer = window.setTimeout(() => setPhase("mastery"), 700);
      const doneTimer = window.setTimeout(onComplete, 2600);
      return () => {
        window.clearTimeout(masteryTimer);
        window.clearTimeout(doneTimer);
      };
    }

    const toMastery = window.setTimeout(() => setPhase("mastery"), logoPhaseMs);
    const doneTimer = window.setTimeout(
      onComplete,
      logoPhaseMs + masteryPhaseMs
    );

    return () => {
      window.clearTimeout(toMastery);
      window.clearTimeout(doneTimer);
    };
  }, [logoPhaseMs, masteryPhaseMs, onComplete, reduceMotion]);

  return (
    <div
      className="relative min-h-[100dvh] overflow-hidden bg-[#030308]"
      role="main"
      aria-label="Investor Quest opening"
    >
      <AnimatePresence mode="wait">
        {phase === "logo" ? (
          <motion.div
            key="logo-phase"
            className="relative z-10 flex min-h-[100dvh] items-center justify-center px-4 py-8"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.985, filter: "blur(8px)" }}
            transition={{ duration: CROSSFADE_MS / 1000, ease: [0.4, 0, 0.2, 1] }}
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 iq-opening-vignette" />

            <div className="relative z-10 flex w-full justify-center px-2 iq-opening-logo-sequence">
              <span
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-[min(70vw,420px)] w-[min(92vw,680px)] -translate-x-1/2 -translate-y-1/2 rounded-full iq-opening-logo-bloom"
              />
              <img
                src={OPENING_LOGO_SRC}
                alt="Investor Quest"
                width={520}
                height={160}
                decoding="async"
                fetchPriority="high"
                className="h-auto w-[min(94vw,40rem)] max-w-none object-contain object-center select-none sm:w-[min(88vw,44rem)] lg:w-[min(78vw,48rem)] [filter:drop-shadow(0_0_22px_rgba(167,139,250,0.34))_drop-shadow(0_0_54px_rgba(139,92,246,0.22))]"
              />
            </div>
          </motion.div>
        ) : (
          <InvestorMasteryHeroScreen reduceMotion={reduceMotion} />
        )}
      </AnimatePresence>
    </div>
  );
}
