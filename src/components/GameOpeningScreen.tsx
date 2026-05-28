"use client";

import { useDeterministicIntro } from "@/hooks/useDeterministicIntro";

const OPENING_LOGO_SRC = "/logos/investor-quest-logo.png";

export type GameOpeningScreenProps = {
  onComplete: () => void;
};

/**
 * First-run logo — visible on first paint; fixed wall-clock advance (no persistence gate).
 */
export function GameOpeningScreen({ onComplete }: GameOpeningScreenProps) {
  useDeterministicIntro(onComplete, 600);

  return (
    <div
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#030308] px-4 py-8"
      role="main"
      aria-label="Investor Quest opening"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_95%_75%_at_50%_48%,rgba(109,40,217,0.22),transparent_62%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_50%,rgba(139,92,246,0.14),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(80vw,480px)] w-[min(95vw,720px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_100%_85%_at_50%_50%,rgba(167,139,250,0.5),rgba(139,92,246,0.2)_55%,transparent_72%)] opacity-70 blur-3xl"
      />

      <div className="relative z-10 flex w-full justify-center px-2 iq-opening-logo-enter">
        <img
          src={OPENING_LOGO_SRC}
          alt="Investor Quest"
          width={520}
          height={160}
          decoding="async"
          fetchPriority="high"
          className="h-auto w-[min(94vw,40rem)] max-w-none object-contain object-center select-none sm:w-[min(88vw,44rem)] lg:w-[min(78vw,48rem)] [filter:drop-shadow(0_0_28px_rgba(167,139,250,0.45))_drop-shadow(0_0_64px_rgba(139,92,246,0.28))]"
        />
      </div>
    </div>
  );
}
