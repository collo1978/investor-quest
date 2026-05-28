"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

import { useDemoStory } from "@/components/demo/DemoStoryProvider";
import { useGame } from "@/components/GameProvider";
import { useDeterministicIntro } from "@/hooks/useDeterministicIntro";
import { clearDemoFreshStart } from "@/lib/demo/demoSessionReset";
import { markFunnelTransition, releaseFunnelTransition } from "@/lib/startup/funnelTransition";

const OPENING_LOGO_SRC = "/logos/investor-quest-logo.png";

// Match the Bank/Broker cinematic feel, but add a schools-only stamp beat.
const OPENING_BLANK_MS = 800;
const OPENING_FADE_IN_MS = 1100;
const OPENING_HOLD_MS = 520;
const STAMP_PAUSE_MS = 400;
const STAMP_HOLD_MS = 700;

function SchoolSealCapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      aria-hidden
    >
      <path
        d="M3.2 9.1 12 4.7l8.8 4.4L12 13.5 3.2 9.1Z"
        fill="rgba(245,197,71,0.9)"
        stroke="rgba(245,197,71,0.95)"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      <path
        d="M6.2 11.2v4.1c0 .6.35 1.15.9 1.4 1.45.7 3.1 1.05 4.9 1.05 1.8 0 3.45-.35 4.9-1.05.55-.25.9-.8.9-1.4v-4.1"
        stroke="rgba(245,197,71,0.95)"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      <path
        d="M20.8 9.4v4.2"
        stroke="rgba(245,197,71,0.95)"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SchoolsOpeningPage() {
  const router = useRouter();
  const { actions } = useGame();
  const demoStory = useDemoStory();
  const leavingRef = useRef(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    releaseFunnelTransition();
  }, []);

  const demoStoryActiveRef = useRef(demoStory.active);
  demoStoryActiveRef.current = demoStory.active;
  const advanceStoryRef = useRef(demoStory.advance);
  advanceStoryRef.current = demoStory.advance;

  const finishIntro = useCallback(() => {
    if (leavingRef.current) return;
    leavingRef.current = true;

    // Schools routes are dev-only for now; keep story behavior consistent if ever enabled.
    if (demoStoryActiveRef.current) {
      advanceStoryRef.current("welcome");
      return;
    }

    clearDemoFreshStart();
    markFunnelTransition("welcome");
    router.replace("/schools/welcome");
    queueMicrotask(() => {
      actions.completeOpeningScreen();
    });
  }, [actions, router]);

  useDeterministicIntro(
    finishIntro,
    OPENING_BLANK_MS +
      OPENING_FADE_IN_MS +
      OPENING_HOLD_MS +
      STAMP_PAUSE_MS +
      STAMP_HOLD_MS
  );

  const stampDelayS = useMemo(() => {
    const ms =
      OPENING_BLANK_MS + OPENING_FADE_IN_MS + OPENING_HOLD_MS + STAMP_PAUSE_MS;
    return ms / 1000;
  }, []);

  return (
    <div
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#030308] px-4 py-8"
      role="main"
      aria-label="Investor Quest opening (schools edition)"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 iq-opening-vignette" />

      <div className="relative z-10 flex w-full justify-center px-2 iq-opening-logo-sequence">
        {/* Keep the Investor Quest logo exactly as-is (same src + classes). */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[min(70vw,420px)] w-[min(92vw,680px)] -translate-x-1/2 -translate-y-1/2 rounded-full iq-opening-logo-bloom"
        />

        <div className="relative inline-flex items-center justify-center">
          <img
            src={OPENING_LOGO_SRC}
            alt="Investor Quest"
            width={520}
            height={160}
            decoding="async"
            fetchPriority="high"
            className="h-auto w-[min(94vw,40rem)] max-w-none object-contain object-center select-none sm:w-[min(88vw,44rem)] lg:w-[min(78vw,48rem)] [filter:drop-shadow(0_0_22px_rgba(167,139,250,0.34))_drop-shadow(0_0_54px_rgba(139,92,246,0.22))]"
          />

          {/* Schools-only seal — attached to the right side of the logo. */}
          <motion.div
            aria-hidden
            className={[
              "pointer-events-none absolute top-1/2 -translate-y-1/2",
              "-right-8 sm:-right-10 md:-right-12",
              "w-[92px] sm:w-[108px] md:w-[120px] aspect-square"
            ].join(" ")}
            initial={
              reduceMotion
                ? { opacity: 1, scale: 1, rotate: -8 }
                : { opacity: 0, scale: 1.6, rotate: -16 }
            }
            animate={
              reduceMotion
                ? undefined
                : {
                    opacity: [0, 1, 1],
                    scale: [1.6, 0.94, 1.03, 1],
                    rotate: [-16, -8, -8, -8],
                    filter: ["blur(0.8px)", "blur(0px)", "blur(0px)", "blur(0px)"],
                    boxShadow: [
                      "0 0 0 rgba(0,0,0,0)",
                      "0 0 32px rgba(245,197,71,0.22), 0 0 22px rgba(139,92,246,0.22)",
                      "0 0 18px rgba(245,197,71,0.16), 0 0 16px rgba(139,92,246,0.18)",
                      "0 0 14px rgba(245,197,71,0.12), 0 0 14px rgba(139,92,246,0.16)"
                    ]
                  }
            }
            transition={
              reduceMotion
                ? undefined
                : {
                    delay: stampDelayS,
                    duration: 0.56,
                    ease: [0.16, 1, 0.3, 1],
                    times: [0, 0.45, 0.75, 1]
                  }
            }
          >
            <div className="iq-schools-seal">
              <div className="iq-schools-seal-inner">
                <div className="iq-schools-seal-cap">
                  <SchoolSealCapIcon />
                </div>
                <div className="iq-schools-seal-ribbon">
                  <span className="iq-schools-seal-ribbon-text">SCHOOL</span>
                </div>
                <div className="iq-schools-seal-sub">EDITION</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

