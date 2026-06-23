"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { useDemoStory } from "@/components/demo/DemoStoryProvider";
import { useGame } from "@/components/GameProvider";
import { MOBILE_PREVIEW_SEARCH_PARAM } from "@/lib/bank/mobilePreviewEmbed";
import { clearDemoFreshStart } from "@/lib/demo/demoSessionReset";
import { navigateSchoolsDemoStep } from "@/lib/schools/navigateSchoolsDemoStep";
import {
  isSchoolsDemoPath,
  resolveSchoolsLearnerHref
} from "@/lib/schools/schoolsDemoHref";
import {
  SCHOOLS_OPENING_LOGO_PATH,
  SCHOOLS_OPENING_POSTER_NATURAL,
  SCHOOLS_OPENING_SCREEN2_PATH
} from "@/lib/screenAssetUrls";
import { markFunnelTransition, releaseFunnelTransition } from "@/lib/startup/funnelTransition";

const OPENING_LOGO_SRC = SCHOOLS_OPENING_LOGO_PATH;
const SCHOOLS_OPENING_SCREEN2_BG_SRC = SCHOOLS_OPENING_SCREEN2_PATH;

const { width: POSTER_W, height: POSTER_H } = SCHOOLS_OPENING_POSTER_NATURAL;
const POSTER_ASPECT = POSTER_W / POSTER_H;

/** Centers 16:9 poster art with letterboxing — no crop on desktop. */
function SchoolsPosterStage({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative mx-auto w-full max-h-[100dvh]"
      style={{
        maxWidth: `min(100vw, calc(100dvh * ${POSTER_ASPECT}))`,
        aspectRatio: `${POSTER_W} / ${POSTER_H}`
      }}
    >
      {children}
    </div>
  );
}

/** Screen 1: logo power-on. */
const OPENING_BLANK_MS = 800;
const OPENING_FADE_IN_MS = 1200;
const OPENING_HOLD_MS = 520;

/** Screen 2: full poster — user taps CONTINUE to choose armor. */
const CROSSFADE_MS = 600;
const MASTERY_FADE_MS = 650;
const MASTERY_FADE_S = MASTERY_FADE_MS / 1000;

type IntroPhase = "logo" | "mastery";

function SchoolsScreen2Portal({
  reduceMotion,
  onContinue
}: {
  reduceMotion: boolean | null;
  onContinue: () => void;
}) {
  return (
    <motion.div
      key="schools-screen-2"
      className="fixed inset-0 z-20 flex items-center justify-center bg-[#030308] pointer-events-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: reduceMotion ? 0.35 : MASTERY_FADE_S,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      <SchoolsPosterStage>
        <img
          src={SCHOOLS_OPENING_SCREEN2_BG_SRC}
          alt=""
          aria-hidden
          width={POSTER_W}
          height={POSTER_H}
          decoding="async"
          fetchPriority="high"
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-fill"
        />

        <footer className="pointer-events-auto absolute inset-x-0 bottom-[2%] z-30 flex justify-center px-[10%]">
          <button
            type="button"
            aria-label="Continue to choose your investor armor"
            onClick={onContinue}
            className="iq-schools-choose-continue-btn iq-schools-choose-continue-btn--armed pointer-events-auto cursor-pointer touch-manipulation"
          >
            CONTINUE
          </button>
        </footer>
      </SchoolsPosterStage>
    </motion.div>
  );
}

export default function SchoolsOpeningPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { actions } = useGame();
  const demoStory = useDemoStory();
  const leavingRef = useRef(false);
  const reduceMotion = useReducedMotion();
  const openOnScreen2 = searchParams.get("screen") === "2";
  const previewScreen2Inspect =
    searchParams.get(MOBILE_PREVIEW_SEARCH_PARAM) === "1" &&
    openOnScreen2;
  const [phase, setPhase] = useState<IntroPhase>(() =>
    openOnScreen2 ? "mastery" : "logo"
  );

  useEffect(() => {
    releaseFunnelTransition();
  }, []);

  useEffect(() => {
    const logo = new Image();
    logo.src = OPENING_LOGO_SRC;
    const screen2 = new Image();
    screen2.src = SCHOOLS_OPENING_SCREEN2_BG_SRC;
  }, []);

  const demoStoryActiveRef = useRef(demoStory.active);
  demoStoryActiveRef.current = demoStory.active;

  const finishIntro = useCallback(() => {
    if (previewScreen2Inspect) return;

    if (leavingRef.current) return;
    leavingRef.current = true;

    if (isSchoolsDemoPath(pathname)) {
      navigateSchoolsDemoStep("logo-reveal", pathname, router);
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
  }, [actions, pathname, previewScreen2Inspect, router]);

  const logoPhaseMs = useMemo(
    () => OPENING_BLANK_MS + OPENING_FADE_IN_MS + OPENING_HOLD_MS,
    []
  );

  useEffect(() => {
    if (openOnScreen2) return;

    if (reduceMotion) {
      const masteryTimer = window.setTimeout(() => setPhase("mastery"), 900);
      return () => window.clearTimeout(masteryTimer);
    }

    const toMastery = window.setTimeout(() => setPhase("mastery"), logoPhaseMs);

    return () => {
      window.clearTimeout(toMastery);
    };
  }, [logoPhaseMs, openOnScreen2, reduceMotion]);

  return (
    <div
      className="relative min-h-[100dvh] overflow-x-hidden bg-[#030308]"
      role="main"
      aria-label="Investor Quest opening"
    >
      <AnimatePresence mode="wait">
        {phase === "logo" ? (
          <motion.div
            key="logo-phase"
            className="fixed inset-0 z-10 flex items-center justify-center bg-[#030308]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.985, filter: "blur(8px)" }}
            transition={{ duration: CROSSFADE_MS / 1000, ease: [0.4, 0, 0.2, 1] }}
          >
            <SchoolsPosterStage>
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(139,92,246,0.38) 0%, rgba(109,40,217,0.16) 42%, transparent 72%)",
                  filter: "blur(26px)"
                }}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={
                  reduceMotion
                    ? { opacity: 0.42, scale: 1 }
                    : { opacity: [0, 0.48, 0.38, 0.48], scale: [0.98, 1, 1.02, 1] }
                }
                transition={
                  reduceMotion
                    ? {
                        delay: (OPENING_BLANK_MS + OPENING_FADE_IN_MS) / 1000,
                        duration: 0.35
                      }
                    : {
                        delay: (OPENING_BLANK_MS + OPENING_FADE_IN_MS) / 1000,
                        duration: 4.8,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "easeInOut"
                      }
                }
              />

              <motion.img
                src={OPENING_LOGO_SRC}
                alt="Investor Quest"
                width={POSTER_W}
                height={POSTER_H}
                decoding="async"
                fetchPriority="high"
                draggable={false}
                initial={
                  reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }
                }
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: OPENING_BLANK_MS / 1000,
                  duration: OPENING_FADE_IN_MS / 1000,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="relative z-[1] h-full w-full select-none object-contain object-center"
              />
            </SchoolsPosterStage>
          </motion.div>
        ) : (
          <SchoolsScreen2Portal reduceMotion={reduceMotion} onContinue={finishIntro} />
        )}
      </AnimatePresence>
    </div>
  );
}
