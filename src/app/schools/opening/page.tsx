"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { useDemoStory } from "@/components/demo/DemoStoryProvider";
import { useSchoolsDemoStory } from "@/components/schools/SchoolsDemoStoryProvider";
import { useGame } from "@/components/GameProvider";
import {
  INVESTOR_MASTERY_HERO_SRC,
  InvestorMasteryHeroScreen
} from "@/components/opening/InvestorMasteryHeroScreen";
import { clearDemoFreshStart } from "@/lib/demo/demoSessionReset";
import { resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";
import { isSchoolsDemoStoryModeActive } from "@/lib/schools/schoolsDemoStoryMode";
import { markFunnelTransition, releaseFunnelTransition } from "@/lib/startup/funnelTransition";

const OPENING_LOGO_SRC = "/logos/investor-quest-logo.png";

/** Screen 1: logo power-on + EDU stamp beside logo. */
const OPENING_BLANK_MS = 800;
const OPENING_FADE_IN_MS = 1100;
const OPENING_HOLD_MS = 520;
const STAMP_PAUSE_MS = 400;
const STAMP_ANIM_MS = 620;
const STAMP_HOLD_MS = 900;

/** Screen 2: full-bleed mastery hero. */
const CROSSFADE_MS = 800;
const MASTERY_FADE_MS = 920;
const MASTERY_HOLD_MS = 4500;

/** Fixed particle field — hydration-safe (no Math.random). */
const INTRO_PARTICLES = [
  { left: "8%", top: "18%", size: 3, delay: "0s", dur: "12s", dx: "10px", dy: "-26px" },
  { left: "22%", top: "72%", size: 2, delay: "-2s", dur: "10s", dx: "-8px", dy: "-22px" },
  { left: "78%", top: "24%", size: 3, delay: "-4s", dur: "11s", dx: "6px", dy: "-30px" },
  { left: "88%", top: "58%", size: 2, delay: "-1s", dur: "13s", dx: "-12px", dy: "-18px" },
  { left: "48%", top: "12%", size: 2, delay: "-3s", dur: "9s", dx: "4px", dy: "-20px" },
  { left: "62%", top: "82%", size: 3, delay: "-5s", dur: "14s", dx: "8px", dy: "-24px" },
  { left: "14%", top: "44%", size: 2, delay: "-6s", dur: "11s", dx: "-6px", dy: "-28px" },
  { left: "92%", top: "36%", size: 2, delay: "-2.5s", dur: "10s", dx: "10px", dy: "-16px" }
] as const;

type IntroPhase = "logo" | "mastery";

function IntroBackdrop() {
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0 iq-opening-vignette" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(88vw,520px)] w-[min(88vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full iq-schools-intro-pulse"
      />
      {INTRO_PARTICLES.map((p, i) => (
        <span
          key={i}
          aria-hidden
          className="premium-particle pointer-events-none"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            ["--pp-delay" as string]: p.delay,
            ["--pp-dur" as string]: p.dur,
            ["--pp-dx" as string]: p.dx,
            ["--pp-dy" as string]: p.dy
          }}
        />
      ))}
    </>
  );
}

type AcademyStampProps = {
  reduceMotion: boolean | null;
  stampDelayS: number;
};

/** EDU badge — sits beside the logo on screen 1 (not its own screen). */
function AcademyEditionStamp({ reduceMotion, stampDelayS }: AcademyStampProps) {
  return (
    <motion.div
      aria-hidden
      className={[
        "pointer-events-none absolute top-1/2 z-[2] -translate-y-1/2",
        "-right-[2.75rem] sm:-right-[3rem] md:-right-[3.25rem]",
        "w-[3.75rem] sm:w-[4.25rem] md:w-[4.75rem]"
      ].join(" ")}
      initial={
        reduceMotion
          ? { opacity: 1, scale: 1, rotate: -2 }
          : { opacity: 0, scale: 1.55, rotate: -6, y: -8 }
      }
      animate={
        reduceMotion
          ? undefined
          : {
              opacity: [0, 1, 1],
              scale: [1.55, 0.94, 1.02, 1],
              rotate: [-6, -2, -2, -2],
              y: [-8, 0, 0, 0],
              filter: ["blur(1px)", "blur(0px)", "blur(0px)", "blur(0px)"]
            }
      }
      transition={
        reduceMotion
          ? undefined
          : {
              delay: stampDelayS,
              duration: STAMP_ANIM_MS / 1000,
              ease: [0.16, 1, 0.3, 1],
              times: [0, 0.48, 0.78, 1]
            }
      }
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-[110%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/25 iq-schools-stamp-ripple"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.75 }}
        animate={
          reduceMotion
            ? undefined
            : {
                opacity: [0, 0.55, 0],
                scale: [0.75, 2.15, 2.35]
              }
        }
        transition={
          reduceMotion
            ? undefined
            : {
                delay: stampDelayS + 0.42,
                duration: 0.95,
                ease: [0.22, 1, 0.36, 1]
              }
        }
      />
      <div className="iq-academy-stamp iq-academy-stamp--edu">
        <span className="iq-academy-stamp-line">EDU</span>
      </div>
    </motion.div>
  );
}

export default function SchoolsOpeningPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { actions } = useGame();
  const demoStory = useDemoStory();
  const schoolsDemo = useSchoolsDemoStory();
  const leavingRef = useRef(false);
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<IntroPhase>("logo");

  useEffect(() => {
    releaseFunnelTransition();
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = INVESTOR_MASTERY_HERO_SRC;
  }, []);

  const demoStoryActiveRef = useRef(demoStory.active);
  demoStoryActiveRef.current = demoStory.active;
  const schoolsDemoActiveRef = useRef(schoolsDemo.active);
  schoolsDemoActiveRef.current = schoolsDemo.active;
  const advanceSchoolsStoryRef = useRef(schoolsDemo.advance);
  advanceSchoolsStoryRef.current = schoolsDemo.advance;

  const finishIntro = useCallback(() => {
    if (leavingRef.current) return;
    leavingRef.current = true;

    if (schoolsDemoActiveRef.current || isSchoolsDemoStoryModeActive()) {
      queueMicrotask(() => {
        actions.completeOpeningScreen();
        actions.completeWelcomeScreen();
      });
      advanceSchoolsStoryRef.current("avatar");
      return;
    }

    if (!demoStoryActiveRef.current) {
      clearDemoFreshStart();
    }

    markFunnelTransition("avatar");
    router.replace(resolveSchoolsLearnerHref("/schools/avatar", pathname));
    queueMicrotask(() => {
      actions.completeOpeningScreen();
      actions.completeWelcomeScreen();
    });
  }, [actions, pathname, router]);

  const stampDelayS = useMemo(() => {
    const ms =
      OPENING_BLANK_MS + OPENING_FADE_IN_MS + OPENING_HOLD_MS + STAMP_PAUSE_MS;
    return ms / 1000;
  }, []);

  const logoPhaseMs = useMemo(
    () =>
      OPENING_BLANK_MS +
      OPENING_FADE_IN_MS +
      OPENING_HOLD_MS +
      STAMP_PAUSE_MS +
      STAMP_ANIM_MS +
      STAMP_HOLD_MS,
    []
  );

  const masteryPhaseMs = CROSSFADE_MS + MASTERY_FADE_MS + MASTERY_HOLD_MS;

  useEffect(() => {
    if (reduceMotion) {
      const masteryTimer = window.setTimeout(() => setPhase("mastery"), 900);
      const leaveTimer = window.setTimeout(finishIntro, 2800);
      return () => {
        window.clearTimeout(masteryTimer);
        window.clearTimeout(leaveTimer);
      };
    }

    const toMastery = window.setTimeout(() => setPhase("mastery"), logoPhaseMs);
    const toAvatar = window.setTimeout(
      finishIntro,
      logoPhaseMs + masteryPhaseMs
    );

    return () => {
      window.clearTimeout(toMastery);
      window.clearTimeout(toAvatar);
    };
  }, [finishIntro, logoPhaseMs, masteryPhaseMs, reduceMotion]);

  return (
    <div
      className="relative min-h-[100dvh] overflow-hidden bg-[#030308]"
      role="main"
      aria-label="Investor Quest opening (EDU)"
    >
      <AnimatePresence mode="wait">
        {phase === "logo" ? (
          <motion.div
            key="logo-phase"
            className="relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-center bg-[#030308] px-4 py-8"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.985, filter: "blur(8px)" }}
            transition={{ duration: CROSSFADE_MS / 1000, ease: [0.4, 0, 0.2, 1] }}
          >
            <IntroBackdrop />

            <div className="relative flex w-full max-w-5xl flex-col items-center iq-opening-logo-sequence">
              <span
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-[min(70vw,420px)] w-[min(92vw,680px)] -translate-x-1/2 -translate-y-1/2 rounded-full iq-opening-logo-bloom"
              />

              <div className="relative inline-flex items-center justify-center px-6 sm:px-10 md:px-14">
                <img
                  src={OPENING_LOGO_SRC}
                  alt="Investor Quest"
                  width={520}
                  height={160}
                  decoding="async"
                  fetchPriority="high"
                  className="relative z-[1] h-auto w-[min(82vw,36rem)] max-w-none object-contain object-center select-none sm:w-[min(76vw,40rem)] lg:w-[min(70vw,44rem)] [filter:drop-shadow(0_0_22px_rgba(167,139,250,0.34))_drop-shadow(0_0_54px_rgba(139,92,246,0.22))]"
                />
                <AcademyEditionStamp
                  reduceMotion={reduceMotion}
                  stampDelayS={stampDelayS}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <InvestorMasteryHeroScreen reduceMotion={reduceMotion} />
        )}
      </AnimatePresence>
    </div>
  );
}
