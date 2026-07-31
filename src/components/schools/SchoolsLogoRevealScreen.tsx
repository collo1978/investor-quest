"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject
} from "react";

import {
  SCHOOLS_LOGO_REVEAL,
  SCHOOLS_LOGO_REVEAL_CTA_UNLOCK_PULSE_MS,
  SCHOOLS_LOGO_REVEAL_GLOW_BUILD_MS,
  SCHOOLS_LOGO_REVEAL_GLOW_DELAY_MS,
  SCHOOLS_LOGO_REVEAL_JOURNEY_HEADLINE_DELAY_MS,
  SCHOOLS_LOGO_REVEAL_JOURNEY_METER_DELAY_MS,
  SCHOOLS_LOGO_REVEAL_LOGO_ENTER_MS,
  SCHOOLS_LOGO_REVEAL_ORB_TRAVEL_MAX_PCT,
  SCHOOLS_LOGO_REVEAL_QUEST_MILESTONES,
  SCHOOLS_LOGO_REVEAL_UNLOCK_PROGRESS
} from "@/lib/schools/schoolsLogoRevealContent";
import { useGame } from "@/components/GameProvider";
import { navigateSchoolsDemoStep } from "@/lib/schools/navigateSchoolsDemoStep";
import { isSchoolsDemoPath, resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";
import { markFunnelTransition } from "@/lib/startup/funnelTransition";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const MAX_TRAIL_PARTICLES = 18;
const TRAIL_SPAWN_DISTANCE_PX = 6;

function questPathLeft(pathProgress: number): string {
  return `${pathProgress * SCHOOLS_LOGO_REVEAL_ORB_TRAVEL_MAX_PCT}%`;
}

function QuestTrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="iq-slr-quest-trophy-icon" aria-hidden>
      <path
        d="M6 5h12v2.2c0 2.4-1.6 4.4-3.8 5.1L13 18H11l-1.2-5.7C7.6 11.6 6 9.6 6 7.2V5Z"
        fill="currentColor"
        opacity="0.92"
      />
      <path
        d="M8 3h8v2H8V3ZM5 7H4a2 2 0 0 0 2 2M19 7h1a2 2 0 0 1-2 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M9 20h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

type TrailParticle = {
  id: number;
  x: number;
  y: number;
};

const COSMIC_MOTES: ReadonlyArray<{
  x: number;
  y: number;
  size: number;
  opacity: number;
  dur: number;
  delay: number;
  driftX: number;
}> = [
  { x: 8, y: 12, size: 1.2, opacity: 0.32, dur: 26, delay: 0, driftX: 6 },
  { x: 18, y: 28, size: 1, opacity: 0.24, dur: 31, delay: 0.6, driftX: -4 },
  { x: 32, y: 8, size: 1.3, opacity: 0.28, dur: 28, delay: 1.1, driftX: 5 },
  { x: 46, y: 22, size: 1, opacity: 0.22, dur: 33, delay: 0.4, driftX: -6 },
  { x: 58, y: 14, size: 1.1, opacity: 0.3, dur: 24, delay: 0.9, driftX: 4 },
  { x: 72, y: 34, size: 1, opacity: 0.26, dur: 29, delay: 1.4, driftX: -5 },
  { x: 86, y: 18, size: 1.2, opacity: 0.24, dur: 27, delay: 0.2, driftX: 3 },
  { x: 14, y: 62, size: 1, opacity: 0.2, dur: 34, delay: 0.8, driftX: -3 },
  { x: 38, y: 74, size: 1.1, opacity: 0.22, dur: 30, delay: 1.2, driftX: 5 },
  { x: 64, y: 68, size: 1, opacity: 0.24, dur: 25, delay: 0.5, driftX: -4 },
  { x: 82, y: 78, size: 1.2, opacity: 0.18, dur: 32, delay: 1.6, driftX: 6 }
];

function CosmicStarfield({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="iq-slr-cosmic-glow absolute inset-0" />
      {COSMIC_MOTES.map((mote, index) => (
        <motion.span
          key={index}
          className="absolute rounded-full bg-violet-100/70"
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
                  x: [0, mote.driftX, 0],
                  y: [0, -3, 0]
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
  );
}

function CtaLockIcon({ showCheck, opening }: { showCheck: boolean; opening: boolean }) {
  if (showCheck) {
    return (
      <svg viewBox="0 0 20 20" className="iq-slr-cta-check-icon" aria-hidden>
        <circle
          cx="10"
          cy="10"
          r="8.25"
          className="iq-slr-cta-check-ring"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M6.4 10.2 8.8 12.6 13.7 7.7"
          className="iq-slr-cta-check-mark"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.85"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className={[
        "iq-slr-cta-lock-icon",
        opening ? "iq-slr-cta-lock-icon--opening" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect
        x="6"
        y="11"
        width="12"
        height="9"
        rx="2.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="15.2" r="1.2" fill="currentColor" />
    </svg>
  );
}

function segmentFillPct(progress: number, from: number, to: number): number {
  if (progress <= from) return 0;
  if (progress >= to) return 100;
  return ((progress - from) / (to - from)) * 100;
}

const QUEST_SEGMENTS: ReadonlyArray<{ from: number; to: number }> = [
  { from: 0, to: 0.25 },
  { from: 0.25, to: 0.5 },
  { from: 0.5, to: 0.75 },
  { from: 0.75, to: 1 }
];

function DraggableJourneyPanel({
  showHeadline,
  showMeter,
  progress,
  unlocked,
  endPulse,
  energyPulse,
  dragging,
  trail,
  onOrbPointerDown,
  onTrackPointerDown,
  onTrackKeyDown,
  trackRef,
  pathRowRef
}: {
  showHeadline: boolean;
  showMeter: boolean;
  progress: number;
  unlocked: boolean;
  endPulse: boolean;
  energyPulse: boolean;
  dragging: boolean;
  trail: TrailParticle[];
  onOrbPointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
  onTrackPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onTrackKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  trackRef: RefObject<HTMLDivElement | null>;
  pathRowRef: RefObject<HTMLDivElement | null>;
}) {
  const glowStrength = 0.45 + progress * 0.55;
  const trophyNear = unlocked || progress >= 0.82;

  return (
    <div className="iq-slr-journey w-full max-w-[min(42rem,96vw)]" role="group" aria-label="Quest progression">
      <motion.h2
        initial={false}
        animate={showHeadline ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.55, ease: EASE_OUT }}
        className="iq-slr-journey-headline m-0 font-[var(--font-grotesk)]"
      >
        {SCHOOLS_LOGO_REVEAL.dragHeadline}
      </motion.h2>

      <motion.div
        initial={false}
        animate={showMeter ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="iq-slr-journey-panel"
      >
        <div
          className={[
            "iq-slr-journey-line font-[var(--font-grotesk)]",
            endPulse ? "iq-slr-journey-line--unlock-pulse" : "",
            unlocked ? "iq-slr-journey-line--unlocked" : ""
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span className="iq-slr-journey-label iq-slr-journey-label--beginner">
            {SCHOOLS_LOGO_REVEAL.beginnerLabel}
          </span>

          <div
            ref={trackRef}
            className="iq-slr-quest-track"
            role="slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            aria-label={`Drag the orb across quest milestones to reach ${SCHOOLS_LOGO_REVEAL.smartInvestorLabel}`}
            tabIndex={unlocked ? -1 : 0}
            onPointerDown={onTrackPointerDown}
            onKeyDown={onTrackKeyDown}
          >
            <div ref={pathRowRef} className="iq-slr-quest-path-row">
              {QUEST_SEGMENTS.map((segment, index) => (
                <div key={index} className="iq-slr-quest-path-step">
                  <div className="iq-slr-quest-segment" aria-hidden>
                    <div className="iq-slr-quest-segment-rail" />
                    <div
                      className="iq-slr-quest-segment-fill"
                      style={{ width: `${segmentFillPct(progress, segment.from, segment.to)}%` }}
                    />
                    {dragging && segmentFillPct(progress, segment.from, segment.to) > 8 ? (
                      <div
                        className="iq-slr-quest-segment-spark"
                        style={{ width: `${segmentFillPct(progress, segment.from, segment.to)}%` }}
                      />
                    ) : null}
                  </div>

                  {index < SCHOOLS_LOGO_REVEAL_QUEST_MILESTONES.length ? (
                    <span
                      className={[
                        "iq-slr-quest-milestone",
                        progress >= SCHOOLS_LOGO_REVEAL_QUEST_MILESTONES[index] - 0.015 || unlocked
                          ? "iq-slr-quest-milestone--lit"
                          : ""
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      aria-hidden
                    />
                  ) : (
                    <span
                      className={[
                        "iq-slr-quest-trophy",
                        trophyNear ? "iq-slr-quest-trophy--glow" : "",
                        endPulse ? "iq-slr-quest-trophy--pulse" : "",
                        unlocked ? "iq-slr-quest-trophy--won" : ""
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      aria-hidden
                    >
                      <QuestTrophyIcon />
                    </span>
                  )}
                </div>
              ))}
            </div>

            {energyPulse ? <span className="iq-slr-quest-energy" aria-hidden /> : null}

            {trail.map((particle) => (
              <span
                key={particle.id}
                className="iq-slr-trail-particle"
                style={{ left: particle.x, top: particle.y }}
                aria-hidden
              />
            ))}

            <button
              type="button"
              className={[
                "iq-slr-orb",
                dragging ? "iq-slr-orb--dragging" : "",
                unlocked ? "iq-slr-orb--unlocked" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              style={
                {
                  left: questPathLeft(progress),
                  "--orb-glow": glowStrength
                } as CSSProperties
              }
              aria-label={unlocked ? "Quest complete" : "Drag orb along quest path"}
              disabled={unlocked}
              onPointerDown={onOrbPointerDown}
            />
          </div>

          <span
            className={[
              "iq-slr-journey-label iq-slr-journey-label--goal",
              unlocked ? "iq-slr-journey-label--goal-lit" : ""
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {SCHOOLS_LOGO_REVEAL.smartInvestorLabel}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

/** Cinematic logo reveal after mission brief cards (standalone preview). */
export function SchoolsLogoRevealScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { actions } = useGame();
  const reduceMotion = useReducedMotion();
  const [runId, setRunId] = useState(0);
  const [glowStrength, setGlowStrength] = useState(0);
  const [logoRevealed, setLogoRevealed] = useState(false);
  const [showJourneyHeadline, setShowJourneyHeadline] = useState(false);
  const [showJourneyMeter, setShowJourneyMeter] = useState(false);
  const [progress, setProgress] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [endPulse, setEndPulse] = useState(false);
  const [energyPulse, setEnergyPulse] = useState(false);
  const [ctaUnlockPulse, setCtaUnlockPulse] = useState(false);
  const [ctaLockCheck, setCtaLockCheck] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [trail, setTrail] = useState<TrailParticle[]>([]);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pathRowRef = useRef<HTMLDivElement | null>(null);
  const glowFrameRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const trailIdRef = useRef(0);
  const lastTrailRef = useRef<{ x: number; y: number } | null>(null);
  const draggingRef = useRef(false);
  const unlockedRef = useRef(false);
  const progressRef = useRef(0);

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

  const resetJourney = useCallback(() => {
    setProgress(0);
    setUnlocked(false);
    setEndPulse(false);
    setEnergyPulse(false);
    setCtaUnlockPulse(false);
    setCtaLockCheck(false);
    setDragging(false);
    setTrail([]);
    draggingRef.current = false;
    unlockedRef.current = false;
    progressRef.current = 0;
    lastTrailRef.current = null;
  }, []);

  const spawnTrail = useCallback(
    (x: number, y: number) => {
      const last = lastTrailRef.current;
      if (last) {
        const dx = x - last.x;
        const dy = y - last.y;
        if (dx * dx + dy * dy < TRAIL_SPAWN_DISTANCE_PX * TRAIL_SPAWN_DISTANCE_PX) {
          return;
        }
      }

      lastTrailRef.current = { x, y };
      trailIdRef.current += 1;
      const id = trailIdRef.current;

      setTrail((particles) => [...particles, { id, x, y }].slice(-MAX_TRAIL_PARTICLES));

      schedule(() => {
        setTrail((particles) => particles.filter((particle) => particle.id !== id));
      }, 520);
    },
    [schedule]
  );

  const completeUnlock = useCallback(() => {
    if (unlockedRef.current) return;

    unlockedRef.current = true;
    draggingRef.current = false;
    progressRef.current = 1;
    setProgress(1);
    setUnlocked(true);
    setDragging(false);
    setEndPulse(true);
    setEnergyPulse(true);
    setCtaUnlockPulse(true);
    setCtaLockCheck(false);
    schedule(() => setEndPulse(false), 820);
    schedule(() => setEnergyPulse(false), 900);
    schedule(() => setCtaLockCheck(true), 420);
    schedule(() => setCtaUnlockPulse(false), SCHOOLS_LOGO_REVEAL_CTA_UNLOCK_PULSE_MS);
  }, [schedule]);

  const setProgressFromClientX = useCallback(
    (clientX: number, spawnParticles: boolean) => {
      if (unlockedRef.current) return;

      const track = trackRef.current;
      if (!track) return;

      const pathRow = pathRowRef.current;
      if (!pathRow) return;

      const rect = pathRow.getBoundingClientRect();
      const travelRatio = SCHOOLS_LOGO_REVEAL_ORB_TRAVEL_MAX_PCT / 100;
      const usable = Math.max(rect.width * travelRatio, 1);
      const x = Math.min(Math.max(clientX - rect.left, 0), usable);
      const next = x / usable;

      progressRef.current = next;
      setProgress(next);

      if (spawnParticles) {
        const trackRect = track.getBoundingClientRect();
        const orbX = x + (rect.left - trackRect.left);
        const y = trackRect.height * 0.5 + ((trailIdRef.current % 3) - 1) * 2;
        spawnTrail(orbX, y);
      }

      if (next >= SCHOOLS_LOGO_REVEAL_UNLOCK_PROGRESS) {
        completeUnlock();
      }
    },
    [completeUnlock, spawnTrail]
  );

  const handlePointerMove = useCallback(
    (event: globalThis.PointerEvent) => {
      if (!draggingRef.current || unlockedRef.current) return;
      setProgressFromClientX(event.clientX, true);
    },
    [setProgressFromClientX]
  );

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false;
    setDragging(false);
    lastTrailRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const jumpToReady = useCallback(() => {
    clearAllTimers();
    setLogoRevealed(true);
    setGlowStrength(1);
    setShowJourneyHeadline(true);
    setShowJourneyMeter(true);
    progressRef.current = 1;
    unlockedRef.current = true;
    setProgress(1);
    setUnlocked(true);
    setEndPulse(false);
    setEnergyPulse(false);
    setCtaUnlockPulse(false);
    setCtaLockCheck(true);
    setDragging(false);
    setTrail([]);
  }, [clearAllTimers]);

  const startJourneySequence = useCallback(() => {
    const logoDoneAt =
      80 + SCHOOLS_LOGO_REVEAL_LOGO_ENTER_MS + SCHOOLS_LOGO_REVEAL_JOURNEY_HEADLINE_DELAY_MS;
    const meterAt = logoDoneAt + SCHOOLS_LOGO_REVEAL_JOURNEY_METER_DELAY_MS;

    setShowJourneyHeadline(false);
    setShowJourneyMeter(false);
    resetJourney();

    schedule(() => setShowJourneyHeadline(true), logoDoneAt);
    schedule(() => setShowJourneyMeter(true), meterAt);
  }, [resetJourney, schedule]);

  const startSequence = useCallback(() => {
    clearAllTimers();
    setGlowStrength(0);
    setLogoRevealed(false);
    resetJourney();
    setShowJourneyHeadline(false);
    setShowJourneyMeter(false);

    if (reduceMotion === true) {
      jumpToReady();
      return;
    }

    schedule(() => setLogoRevealed(true), 80);

    schedule(() => {
      const glowStart = performance.now();
      const tickGlow = (now: number) => {
        const elapsed = now - glowStart;
        const next = Math.min(1, elapsed / SCHOOLS_LOGO_REVEAL_GLOW_BUILD_MS);
        setGlowStrength(next);
        if (next < 1) {
          glowFrameRef.current = window.requestAnimationFrame(tickGlow);
        }
      };
      glowFrameRef.current = window.requestAnimationFrame(tickGlow);
    }, SCHOOLS_LOGO_REVEAL_GLOW_DELAY_MS);

    startJourneySequence();
  }, [clearAllTimers, jumpToReady, reduceMotion, resetJourney, schedule, startJourneySequence]);

  useEffect(() => {
    startSequence();
    return () => clearAllTimers();
  }, [clearAllTimers, runId, startSequence]);

  const handleOrbPointerDown = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (unlockedRef.current) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      draggingRef.current = true;
      setDragging(true);
      setProgressFromClientX(event.clientX, true);
    },
    [setProgressFromClientX]
  );

  const handleTrackPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (unlockedRef.current) return;
      if ((event.target as HTMLElement).closest(".iq-slr-orb, .iq-slr-quest-trophy")) return;

      draggingRef.current = true;
      setDragging(true);
      setProgressFromClientX(event.clientX, true);
    },
    [setProgressFromClientX]
  );

  const handleTrackKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (unlockedRef.current) return;

      if (event.key === "ArrowRight" || event.key === "ArrowUp") {
        event.preventDefault();
        const next = Math.min(1, progressRef.current + 0.08);
        progressRef.current = next;
        setProgress(next);
        if (next >= SCHOOLS_LOGO_REVEAL_UNLOCK_PROGRESS) completeUnlock();
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
        event.preventDefault();
        const next = Math.max(0, progressRef.current - 0.08);
        progressRef.current = next;
        setProgress(next);
      }
    },
    [completeUnlock]
  );

  const handleReplay = useCallback(() => {
    setRunId((id) => id + 1);
  }, []);

  const handleSkip = useCallback(() => {
    jumpToReady();
  }, [jumpToReady]);

  const handleStartQuest = useCallback(() => {
    if (!unlockedRef.current) return;

    actions.completeOpeningScreen();
    actions.completeWelcomeScreen();

    if (isSchoolsDemoPath(pathname)) {
      navigateSchoolsDemoStep("name", pathname, router);
      return;
    }

    markFunnelTransition("name");
    router.replace(resolveSchoolsLearnerHref("/schools/name", pathname));
  }, [actions, pathname, router]);

  return (
    <main
      key={runId}
      className="iq-slr-screen relative h-[100dvh] w-full overflow-hidden bg-[#04050a]"
      aria-label="Investor Quest logo reveal"
    >
      <CosmicStarfield reduceMotion={reduceMotion} />

      <div className="pointer-events-none absolute inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-30 flex justify-between px-4">
        <button type="button" onClick={handleReplay} className="iq-slr-ctrl pointer-events-auto">
          Replay
        </button>
        <button type="button" onClick={handleSkip} className="iq-slr-ctrl pointer-events-auto">
          Skip
        </button>
      </div>

      <div className="pointer-events-auto absolute inset-0 z-10 flex flex-col items-center justify-center overflow-y-auto px-4 pb-[max(3.75rem,env(safe-area-inset-bottom))] pt-12 sm:px-6 sm:pb-20">
        <div className="iq-slr-stage flex w-full max-w-6xl -translate-y-2 flex-col items-center sm:-translate-y-3">
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
                duration: SCHOOLS_LOGO_REVEAL_LOGO_ENTER_MS / 1000,
                ease: EASE_OUT
              }}
            >
              <motion.img
                src={SCHOOLS_LOGO_REVEAL.logoSrc}
                alt="Investor Quest"
                width={960}
                height={420}
                draggable={false}
                animate={
                  logoRevealed && reduceMotion !== true ? { y: [0, -10, 0] } : { y: 0 }
                }
                transition={
                  logoRevealed && reduceMotion !== true
                    ? {
                        duration: 5.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: SCHOOLS_LOGO_REVEAL_LOGO_ENTER_MS / 1000
                      }
                    : { duration: 0 }
                }
                className="iq-slr-logo object-contain"
              />
            </motion.div>
          </div>

          <div className="iq-slr-below-logo flex w-full flex-col items-center">
            <DraggableJourneyPanel
              showHeadline={showJourneyHeadline}
              showMeter={showJourneyMeter}
              progress={progress}
              unlocked={unlocked}
              endPulse={endPulse}
              energyPulse={energyPulse}
              dragging={dragging}
              trail={trail}
              onOrbPointerDown={handleOrbPointerDown}
              onTrackPointerDown={handleTrackPointerDown}
              onTrackKeyDown={handleTrackKeyDown}
              trackRef={trackRef}
              pathRowRef={pathRowRef}
            />

            <motion.div
              initial={false}
              animate={showJourneyMeter ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              className="iq-slr-cta-wrap"
            >
              <button
                type="button"
                disabled={!unlocked}
                aria-disabled={!unlocked}
                className={[
                  "iq-slr-cta font-[var(--font-grotesk)]",
                  unlocked ? "iq-slr-cta--active" : "iq-slr-cta--locked",
                  ctaUnlockPulse ? "iq-slr-cta--unlock-pulse" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={handleStartQuest}
              >
                <span
                  className={[
                    "iq-slr-cta-lock",
                    ctaLockCheck ? "iq-slr-cta-lock--success" : ""
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-hidden
                >
                  <CtaLockIcon showCheck={ctaLockCheck} opening={unlocked && !ctaLockCheck} />
                </span>
                <span>{SCHOOLS_LOGO_REVEAL.cta}</span>
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
