"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

export const INVESTOR_MASTERY_HERO_SRC =
  "/images/schools/Investor-mastery-screen.png";

const MASTERY_FADE_S = 0.92;

export type InvestorMasteryHeroScreenProps = {
  reduceMotion: boolean | null;
  /** Fade-in duration in seconds (default 0.92). Schools opening uses a snappier pace. */
  fadeDurationS?: number;
  /** Optional bottom dock (e.g. Schools onboarding CTAs). */
  footer?: ReactNode;
};

/**
 * Full-bleed cinematic mastery hero (screen 2 after logo).
 * Shared by Bank/Broker `/opening` and Schools `/schools/opening`.
 */
export function InvestorMasteryHeroScreen({
  reduceMotion,
  fadeDurationS = MASTERY_FADE_S,
  footer
}: InvestorMasteryHeroScreenProps) {
  return (
    <motion.div
      key="mastery"
      className="fixed inset-0 z-20 flex flex-col bg-[#030308]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: reduceMotion ? 0.35 : fadeDurationS,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      <div
        className="relative min-h-0 flex-1 overflow-hidden"
        role="img"
        aria-label="Your epic path to investing mastery starts now"
      >
        <div
          className={[
            "absolute inset-0 flex items-center justify-center",
            reduceMotion ? "" : "iq-schools-mastery-kenburns"
          ].join(" ")}
        >
          <img
            src={INVESTOR_MASTERY_HERO_SRC}
            alt=""
            aria-hidden
            width={1920}
            height={1080}
            decoding="async"
            fetchPriority="high"
            className={[
              "max-h-none max-w-none object-cover object-center select-none",
              footer
                ? "h-full w-full"
                : "h-[100dvh] w-[100vw] min-h-[100dvh] min-w-[100vw] max-sm:object-contain"
            ].join(" ")}
          />
        </div>

        {!reduceMotion ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 iq-schools-mastery-parallax"
          />
        ) : null}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 iq-schools-mastery-vignette"
        />
      </div>

      {footer ? (
        <div className="relative z-30 shrink-0 pointer-events-auto">{footer}</div>
      ) : null}
    </motion.div>
  );
}
