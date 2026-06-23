"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { SCHOOLS_MISSION_BRIEF_CARDS_ROUTE } from "@/lib/schools/missionBriefCardsContent";
import { navigateSchoolsDemoStep } from "@/lib/schools/navigateSchoolsDemoStep";
import { isSchoolsDemoPath, resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";
import {
  SCHOOLS_LOGO_INTRO_ENTER_MS,
  SCHOOLS_LOGO_INTRO_GLOW_BUILD_MS,
  SCHOOLS_LOGO_INTRO_GLOW_DELAY_MS,
  SCHOOLS_LOGO_INTRO_HOLD_MS,
  SCHOOLS_LOGO_INTRO_LOGO_SRC
} from "@/lib/schools/schoolsLogoIntroContent";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const INTRO_MOTES: ReadonlyArray<{
  x: number;
  y: number;
  size: number;
  opacity: number;
  dur: number;
  delay: number;
}> = [
  { x: 12, y: 18, size: 1.1, opacity: 0.3, dur: 24, delay: 0 },
  { x: 28, y: 32, size: 1, opacity: 0.22, dur: 28, delay: 0.5 },
  { x: 72, y: 22, size: 1.1, opacity: 0.26, dur: 26, delay: 0.8 },
  { x: 84, y: 64, size: 1, opacity: 0.2, dur: 30, delay: 0.3 }
];

/** Cinematic logo float-in — auto-advances to mission brief cards. */
export function SchoolsLogoIntroScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [logoRevealed, setLogoRevealed] = useState(false);
  const [glowStrength, setGlowStrength] = useState(0);
  const leavingRef = useRef(false);
  const sequenceStartedRef = useRef(false);
  const routerRef = useRef(router);
  const pathnameRef = useRef(pathname);
  const timersRef = useRef<number[]>([]);
  const glowFrameRef = useRef<number | null>(null);

  routerRef.current = router;
  pathnameRef.current = pathname;

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    if (glowFrameRef.current != null) {
      window.cancelAnimationFrame(glowFrameRef.current);
      glowFrameRef.current = null;
    }
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  const goToMissionBriefCards = useCallback(() => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    clearAllTimers();

    const path = pathnameRef.current;
    const activeRouter = routerRef.current;

    if (isSchoolsDemoPath(path)) {
      navigateSchoolsDemoStep("mission-brief-cards", path, activeRouter);
      return;
    }

    activeRouter.replace(resolveSchoolsLearnerHref(SCHOOLS_MISSION_BRIEF_CARDS_ROUTE, path));
  }, [clearAllTimers]);

  useEffect(() => {
    if (sequenceStartedRef.current) return;
    sequenceStartedRef.current = true;

    const prefersReducedMotion =
      reduceMotion === true ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    leavingRef.current = false;
    setLogoRevealed(false);
    setGlowStrength(0);

    if (prefersReducedMotion) {
      setLogoRevealed(true);
      setGlowStrength(1);
      schedule(goToMissionBriefCards, 220);
    } else {
      schedule(() => setLogoRevealed(true), 40);

      schedule(() => {
        const glowStart = performance.now();
        const tickGlow = (now: number) => {
          const elapsed = now - glowStart;
          const next = Math.min(1, elapsed / SCHOOLS_LOGO_INTRO_GLOW_BUILD_MS);
          setGlowStrength(next);
          if (next < 1) {
            glowFrameRef.current = window.requestAnimationFrame(tickGlow);
          }
        };
        glowFrameRef.current = window.requestAnimationFrame(tickGlow);
      }, SCHOOLS_LOGO_INTRO_GLOW_DELAY_MS);

      schedule(
        goToMissionBriefCards,
        40 + SCHOOLS_LOGO_INTRO_ENTER_MS + SCHOOLS_LOGO_INTRO_HOLD_MS
      );
    }

    return () => {
      sequenceStartedRef.current = false;
      clearAllTimers();
    };
    // Mount once — timers must not be cleared when unrelated hooks update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = SCHOOLS_LOGO_INTRO_LOGO_SRC;
    router.prefetch(resolveSchoolsLearnerHref(SCHOOLS_MISSION_BRIEF_CARDS_ROUTE, pathname));
  }, [pathname, router]);

  const handleSkip = useCallback(() => {
    goToMissionBriefCards();
  }, [goToMissionBriefCards]);

  return (
    <main
      className="iq-sli-screen relative h-[100dvh] w-full overflow-hidden bg-[#04050a]"
      aria-label="Investor Quest logo intro"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="iq-slr-cosmic-glow absolute inset-0" />
        {INTRO_MOTES.map((mote, index) => (
          <motion.span
            key={index}
            className="absolute rounded-full bg-violet-100/65"
            style={{
              left: `${mote.x}%`,
              top: `${mote.y}%`,
              width: mote.size,
              height: mote.size,
              opacity: mote.opacity
            }}
            animate={
              reduceMotion
                ? undefined
                : {
                    opacity: [mote.opacity * 0.4, mote.opacity, mote.opacity * 0.45],
                    y: [0, -2, 0]
                  }
            }
            transition={
              reduceMotion
                ? undefined
                : {
                    duration: mote.dur,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: mote.delay
                  }
            }
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-30 flex justify-end px-4">
        <button type="button" onClick={handleSkip} className="iq-slr-ctrl pointer-events-auto">
          Skip
        </button>
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-4">
        <div className="iq-sli-stage flex w-full max-w-6xl flex-col items-center justify-center">
          <div className="iq-slr-logo-wrap relative flex w-full items-center justify-center">
            <motion.div
              aria-hidden
              className="iq-slr-quest-glow pointer-events-none absolute"
              style={{ opacity: glowStrength }}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={
                logoRevealed
                  ? { opacity: glowStrength, scale: 0.94 + glowStrength * 0.1 }
                  : { opacity: 0, scale: 0.88 }
              }
              transition={{ duration: 0.45, ease: EASE_OUT }}
            />

            <motion.div
              className="iq-slr-logo-float relative z-10 flex w-full justify-center"
              initial={false}
              animate={
                logoRevealed
                  ? { opacity: 1, y: 0, scale: 1, filter: "brightness(1)" }
                  : { opacity: 0.34, y: 48, scale: 0.74, filter: "brightness(0.62)" }
              }
              transition={{
                duration: SCHOOLS_LOGO_INTRO_ENTER_MS / 1000,
                ease: EASE_OUT
              }}
            >
              <motion.img
                src={SCHOOLS_LOGO_INTRO_LOGO_SRC}
                alt="Investor Quest"
                width={960}
                height={420}
                draggable={false}
                animate={
                  logoRevealed && reduceMotion !== true ? { y: [0, -8, 0] } : { y: 0 }
                }
                transition={
                  logoRevealed && reduceMotion !== true
                    ? {
                        duration: 4.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: SCHOOLS_LOGO_INTRO_ENTER_MS / 1000
                      }
                    : { duration: 0 }
                }
                className="iq-slr-logo object-contain"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
