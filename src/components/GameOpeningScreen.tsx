"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSearchParams } from "next/navigation";

import {
  INVESTOR_MASTERY_HERO_SRC,
  InvestorMasteryHeroScreen
} from "@/components/opening/InvestorMasteryHeroScreen";
import { MOBILE_PREVIEW_SEARCH_PARAM } from "@/lib/bank/mobilePreviewEmbed";
import { preloadImage } from "@/lib/preloadImage";

const OPENING_LOGO_SRC = "/logos/investor-quest-logo.png";
const OPENING_LOGO_WIDTH = 520;
const OPENING_LOGO_HEIGHT = 160;

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

type OpeningLogoProps = {
  /** Fade-in via CSS sequence (full opening flow only). */
  animateIn?: boolean;
};

/** Full-bleed logo — width locked on wrapper so layout does not jump on image load. */
function OpeningLogo({ animateIn = false }: OpeningLogoProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    preloadImage(OPENING_LOGO_SRC);
  }, []);

  return (
    <div className="relative z-10 mx-auto w-[min(94vw,40rem)] max-w-[calc(100%-0.5rem)] sm:max-w-none sm:w-[min(88vw,44rem)] lg:w-[min(78vw,48rem)]">
      {animateIn ? (
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[min(70vw,420px)] w-[min(92vw,680px)] -translate-x-1/2 -translate-y-1/2 rounded-full iq-opening-logo-bloom"
        />
      ) : null}
      <img
        src={OPENING_LOGO_SRC}
        alt="Investor Quest"
        width={OPENING_LOGO_WIDTH}
        height={OPENING_LOGO_HEIGHT}
        decoding="sync"
        fetchPriority="high"
        onLoad={() => setReady(true)}
        className={[
          "relative z-10 block h-auto w-full max-w-none object-contain object-center select-none",
          animateIn
            ? ready
              ? "iq-opening-logo-sequence"
              : "opacity-0"
            : ["transition-opacity duration-200", ready ? "opacity-100" : "opacity-0"],
          "[filter:drop-shadow(0_0_22px_rgba(167,139,250,0.34))_drop-shadow(0_0_54px_rgba(139,92,246,0.22))]"
        ].join(" ")}
      />
    </div>
  );
}

/**
 * Bank/Broker opening: logo → mastery hero → `onComplete`.
 */
export function GameOpeningScreen({ onComplete }: GameOpeningScreenProps) {
  const reduceMotion = useReducedMotion();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<IntroPhase>("logo");
  const isPreview = searchParams.get(MOBILE_PREVIEW_SEARCH_PARAM) === "1";

  useEffect(() => {
    preloadImage(OPENING_LOGO_SRC);
    const img = new Image();
    img.src = INVESTOR_MASTERY_HERO_SRC;
  }, []);

  const logoPhaseMs = useMemo(
    () => OPENING_BLANK_MS + OPENING_FADE_IN_MS + OPENING_HOLD_MS,
    []
  );

  const masteryPhaseMs = CROSSFADE_MS + MASTERY_FADE_MS + MASTERY_HOLD_MS;

  useEffect(() => {
    if (isPreview) return;

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
  }, [isPreview, logoPhaseMs, masteryPhaseMs, onComplete, reduceMotion]);

  if (isPreview) {
    return (
      <div
        className="relative min-h-[100dvh] overflow-hidden bg-[#030308]"
        role="main"
        aria-label="Investor Quest opening preview"
      >
        <div className="relative z-10 flex min-h-[100dvh] items-center justify-center px-4 py-8">
          <div aria-hidden className="pointer-events-none absolute inset-0 iq-opening-vignette" />
          <OpeningLogo />
        </div>
      </div>
    );
  }

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

            <div className="relative z-10 flex w-full justify-center px-2">
              <OpeningLogo animateIn />
            </div>
          </motion.div>
        ) : (
          <InvestorMasteryHeroScreen reduceMotion={reduceMotion} />
        )}
      </AnimatePresence>
    </div>
  );
}
