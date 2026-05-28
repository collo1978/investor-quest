"use client";

import { useDeterministicIntro } from "@/hooks/useDeterministicIntro";

const OPENING_LOGO_SRC = "/logos/investor-quest-logo.png";
const OPENING_BLANK_MS = 800;
const OPENING_FADE_IN_MS = 1100;
const OPENING_HOLD_MS = 520;

export type GameOpeningScreenProps = {
  onComplete: () => void;
};

/**
 * First-run logo — visible on first paint; fixed wall-clock advance (no persistence gate).
 */
export function GameOpeningScreen({ onComplete }: GameOpeningScreenProps) {
  useDeterministicIntro(
    onComplete,
    OPENING_BLANK_MS + OPENING_FADE_IN_MS + OPENING_HOLD_MS
  );

  return (
    <div
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#030308] px-4 py-8"
      role="main"
      aria-label="Investor Quest opening"
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
    </div>
  );
}
