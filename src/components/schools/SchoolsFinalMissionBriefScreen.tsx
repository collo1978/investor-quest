"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  buildFinalMissionBriefQueue,
  FINAL_MISSION_BRIEF_CHAR_MS,
  FINAL_MISSION_BRIEF_FADE_MS,
  FINAL_MISSION_BRIEF_FINALE,
  FINAL_MISSION_BRIEF_FINALE_FADE_MS,
  FINAL_MISSION_BRIEF_LINE_GAP_MS,
  FINAL_MISSION_BRIEF_SEGMENTS,
  type FinalMissionBriefLine,
  type FinalMissionBriefLineVariant,
  type FinalMissionBriefQueueItem
} from "@/lib/schools/finalMissionBriefContent";
import {
  playMissionBriefKeystroke,
  primeMissionBriefAudio,
  stopMissionBriefAudio
} from "@/lib/schools/missionBriefTypewriterSound";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const STAR_MOTES: ReadonlyArray<{
  x: number;
  y: number;
  size: number;
  opacity: number;
  dur: number;
  delay: number;
}> = [
  { x: 12, y: 16, size: 1.1, opacity: 0.32, dur: 18, delay: 0 },
  { x: 28, y: 30, size: 1, opacity: 0.24, dur: 21, delay: 0.5 },
  { x: 42, y: 10, size: 1.2, opacity: 0.28, dur: 19, delay: 1.0 },
  { x: 58, y: 22, size: 1, opacity: 0.22, dur: 22, delay: 0.3 },
  { x: 72, y: 14, size: 1.1, opacity: 0.3, dur: 17, delay: 0.8 },
  { x: 84, y: 34, size: 1, opacity: 0.26, dur: 20, delay: 1.3 },
  { x: 18, y: 64, size: 1, opacity: 0.2, dur: 23, delay: 0.6 },
  { x: 50, y: 72, size: 1.1, opacity: 0.22, dur: 24, delay: 1.1 },
  { x: 76, y: 68, size: 1, opacity: 0.24, dur: 18, delay: 0.4 }
];

type ScriptPhase = "typing" | "pause" | "done";

function lineClass(variant: FinalMissionBriefLineVariant): string {
  const base = "iq-fmb-line";
  switch (variant) {
    case "title-lg":
      return `${base} iq-fmb-line--title-lg`;
    case "title-sm":
      return `${base} iq-fmb-line--title-sm`;
    case "heading":
      return `${base} iq-fmb-line--heading`;
    case "body":
    default:
      return `${base} iq-fmb-line--body`;
  }
}

function useFinalMissionBriefScript(
  queue: FinalMissionBriefQueueItem[],
  active: boolean,
  instant: boolean,
  soundEnabled: boolean
) {
  const [queueIndex, setQueueIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [completedLines, setCompletedLines] = useState<FinalMissionBriefLine[]>([]);
  const [phase, setPhase] = useState<ScriptPhase>("typing");
  const [fadeLineId, setFadeLineId] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const queueIndexRef = useRef(0);
  const charCountRef = useRef(0);
  const phaseRef = useRef<ScriptPhase>("typing");
  const queueRef = useRef(queue);
  const soundEnabledRef = useRef(soundEnabled);

  queueRef.current = queue;
  soundEnabledRef.current = soundEnabled;

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const schedule = useCallback(
    (fn: () => void, ms: number) => {
      clearTimer();
      timerRef.current = window.setTimeout(fn, ms);
    },
    [clearTimer]
  );

  const currentItem = queue[queueIndex] ?? null;
  const currentLine = currentItem?.line ?? null;

  const reset = useCallback(() => {
    clearTimer();
    queueIndexRef.current = 0;
    charCountRef.current = 0;
    phaseRef.current = "typing";
    setQueueIndex(0);
    setCharCount(0);
    setCompletedLines([]);
    setPhase("typing");
    setFadeLineId(null);
  }, [clearTimer]);

  const finishLineRef = useRef<(item: FinalMissionBriefQueueItem) => void>(() => {});
  const startFadeLineRef = useRef<(item: FinalMissionBriefQueueItem) => void>(() => {});
  const tickRef = useRef<() => void>(() => {});

  finishLineRef.current = (item: FinalMissionBriefQueueItem) => {
    setCompletedLines((prev) => [...prev, item.line]);
    setFadeLineId(null);
    charCountRef.current = 0;
    setCharCount(0);

    const pauseMs =
      item.line.pauseAfterMs ??
      (item.isLastInSegment ? 0 : FINAL_MISSION_BRIEF_LINE_GAP_MS);

    const nextIndex = queueIndexRef.current + 1;
    const hasMoreInSegment =
      !item.isLastInSegment && nextIndex < queueRef.current.length;

    if (hasMoreInSegment) {
      phaseRef.current = "pause";
      setPhase("pause");
      schedule(() => {
        queueIndexRef.current = nextIndex;
        setQueueIndex(nextIndex);
        phaseRef.current = "typing";
        setPhase("typing");
        schedule(() => tickRef.current(), 0);
      }, pauseMs);
      return;
    }

    if (nextIndex >= queueRef.current.length) {
      phaseRef.current = "done";
      setPhase("done");
      setQueueIndex(queueRef.current.length);
      queueIndexRef.current = queueRef.current.length;
      return;
    }

    phaseRef.current = "pause";
    setPhase("pause");
    schedule(() => {
      queueIndexRef.current = nextIndex;
      setQueueIndex(nextIndex);
      phaseRef.current = "typing";
      setPhase("typing");
      schedule(() => tickRef.current(), 0);
    }, item.segmentPauseAfterMs + pauseMs);
  };

  startFadeLineRef.current = (item: FinalMissionBriefQueueItem) => {
    setFadeLineId(item.line.id);
    const pauseMs = item.line.pauseAfterMs ?? FINAL_MISSION_BRIEF_LINE_GAP_MS;
    schedule(
      () => finishLineRef.current(item),
      FINAL_MISSION_BRIEF_FADE_MS + pauseMs
    );
  };

  tickRef.current = () => {
    const item = queueRef.current[queueIndexRef.current];
    if (!item) {
      phaseRef.current = "done";
      setPhase("done");
      return;
    }

    const line = item.line;
    if (line.revealMode === "fade") {
      startFadeLineRef.current(item);
      return;
    }

    if (charCountRef.current < line.text.length) {
      charCountRef.current += 1;
      setCharCount(charCountRef.current);
      if (soundEnabledRef.current) {
        playMissionBriefKeystroke({ char: line.text.charAt(charCountRef.current - 1) });
      }
      schedule(() => tickRef.current(), FINAL_MISSION_BRIEF_CHAR_MS);
      return;
    }

    finishLineRef.current(item);
  };

  const revealCurrent = useCallback(() => {
    if (phaseRef.current === "done") return;
    clearTimer();

    const item = queueRef.current[queueIndexRef.current];
    if (!item) return;

    if (phaseRef.current === "pause") {
      const nextIndex = queueIndexRef.current + 1;
      if (nextIndex >= queueRef.current.length) {
        phaseRef.current = "done";
        setPhase("done");
        setQueueIndex(queueRef.current.length);
        queueIndexRef.current = queueRef.current.length;
        return;
      }
      queueIndexRef.current = nextIndex;
      setQueueIndex(nextIndex);
      phaseRef.current = "typing";
      setPhase("typing");
      schedule(() => tickRef.current(), 0);
      return;
    }

    if (item.line.revealMode === "fade") {
      finishLineRef.current(item);
      return;
    }

    charCountRef.current = item.line.text.length;
    setCharCount(item.line.text.length);
    finishLineRef.current(item);
  }, [clearTimer, schedule]);

  const skipToEnd = useCallback(() => {
    clearTimer();
    phaseRef.current = "done";
    setPhase("done");
    setFadeLineId(null);
    setQueueIndex(queueRef.current.length);
    queueIndexRef.current = queueRef.current.length;
  }, [clearTimer]);

  useEffect(() => {
    if (!active) return;
    reset();

    if (instant) {
      skipToEnd();
      return;
    }

    schedule(() => tickRef.current(), 300);

    return () => clearTimer();
  }, [active, clearTimer, instant, reset, schedule, skipToEnd]);

  const displayText = useMemo(() => {
    if (!currentLine || currentLine.revealMode === "fade") return "";
    if (phase === "done") return currentLine.text;
    return currentLine.text.slice(0, charCount);
  }, [charCount, currentLine, phase]);

  const isTyping =
    phase === "typing" &&
    currentLine?.revealMode !== "fade" &&
    charCount < (currentLine?.text.length ?? 0);

  return {
    completedLines,
    currentLine,
    displayText,
    fadeLineId,
    isTyping,
    done: phase === "done",
    revealCurrent,
    skipToEnd,
    reset
  };
}

function BriefStarfield({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="iq-fmb-glow absolute inset-0" />
      {STAR_MOTES.map((star, index) => (
        <motion.span
          key={index}
          className="absolute rounded-full bg-sky-200/70"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity
          }}
          animate={
            reduceMotion
              ? undefined
              : {
                  opacity: [star.opacity * 0.5, star.opacity, star.opacity * 0.5],
                  y: [0, -2, 0]
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: star.dur,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: star.delay
                }
          }
        />
      ))}
    </div>
  );
}

/** Premium onboarding-style mission brief (standalone preview). */
export function SchoolsFinalMissionBriefScreen() {
  const reduceMotion = useReducedMotion();
  const [runId, setRunId] = useState(0);
  const [screenPhase, setScreenPhase] = useState<"brief" | "finale">("brief");
  const [panelExiting, setPanelExiting] = useState(false);
  const finaleTimerRef = useRef<number | null>(null);

  const queue = useMemo(
    () => buildFinalMissionBriefQueue(FINAL_MISSION_BRIEF_SEGMENTS),
    []
  );
  const soundEnabled = screenPhase === "brief" && !reduceMotion;

  const {
    completedLines,
    currentLine,
    displayText,
    fadeLineId,
    isTyping,
    done,
    revealCurrent,
    skipToEnd,
    reset
  } = useFinalMissionBriefScript(queue, screenPhase === "brief", !!reduceMotion, soundEnabled);

  const handleReplay = useCallback(() => {
    if (finaleTimerRef.current != null) {
      window.clearTimeout(finaleTimerRef.current);
      finaleTimerRef.current = null;
    }
    setPanelExiting(false);
    setScreenPhase("brief");
    reset();
    setRunId((id) => id + 1);
    primeMissionBriefAudio();
  }, [reset]);

  const handleSkip = useCallback(() => {
    skipToEnd();
  }, [skipToEnd]);

  useEffect(() => {
    if (!done || screenPhase !== "brief") return;

    setPanelExiting(true);
    finaleTimerRef.current = window.setTimeout(() => {
      setScreenPhase("finale");
      setPanelExiting(false);
    }, reduceMotion ? 0 : FINAL_MISSION_BRIEF_FINALE_FADE_MS);

    return () => {
      if (finaleTimerRef.current != null) {
        window.clearTimeout(finaleTimerRef.current);
      }
    };
  }, [done, reduceMotion, screenPhase]);

  useEffect(() => {
    if (reduceMotion) return;

    primeMissionBriefAudio();
    const resumeOnGesture = () => primeMissionBriefAudio();
    window.addEventListener("pointerdown", resumeOnGesture, { passive: true });
    window.addEventListener("keydown", resumeOnGesture);

    return () => {
      window.removeEventListener("pointerdown", resumeOnGesture);
      window.removeEventListener("keydown", resumeOnGesture);
      stopMissionBriefAudio();
    };
  }, [reduceMotion, runId]);

  return (
    <main
      key={runId}
      className="iq-fmb-screen relative h-[100dvh] w-full overflow-hidden bg-[#05070a]"
      aria-label="Final mission brief preview"
    >
      <BriefStarfield reduceMotion={reduceMotion} />

      <div className="pointer-events-none absolute inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-30 flex justify-between px-4">
        <button type="button" onClick={handleReplay} className="iq-fmb-ctrl pointer-events-auto">
          Replay
        </button>
        {screenPhase === "brief" ? (
          <button type="button" onClick={handleSkip} className="iq-fmb-ctrl pointer-events-auto">
            Skip
          </button>
        ) : (
          <span aria-hidden className="w-[4.5rem]" />
        )}
      </div>

      <AnimatePresence mode="wait">
        {screenPhase === "brief" ? (
          <motion.button
            key="brief"
            type="button"
            aria-label="Reveal current mission brief beat"
            initial={{ opacity: 1 }}
            animate={{ opacity: panelExiting ? 0 : 1, y: panelExiting ? -8 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: FINAL_MISSION_BRIEF_FINALE_FADE_MS / 1000, ease: EASE_OUT }}
            onClick={revealCurrent}
            className="pointer-events-auto absolute inset-0 z-10 flex items-center justify-center px-5 py-16"
          >
            <div className="iq-fmb-panel w-full max-w-lg px-6 py-7 sm:px-8 sm:py-8">
              <div aria-live="polite" className="space-y-3 text-left">
                {completedLines.map((line) => (
                  <p key={line.id} className={lineClass(line.variant)}>
                    {line.text}
                  </p>
                ))}

                {currentLine && fadeLineId === currentLine.id ? (
                  <motion.p
                    key={currentLine.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: FINAL_MISSION_BRIEF_FADE_MS / 1000, ease: EASE_OUT }}
                    className={lineClass(currentLine.variant)}
                  >
                    {currentLine.text}
                  </motion.p>
                ) : null}

                {currentLine &&
                currentLine.revealMode !== "fade" &&
                !done &&
                !completedLines.some((l) => l.id === currentLine.id) ? (
                  <p className={lineClass(currentLine.variant)}>
                    {displayText}
                    {isTyping ? (
                      <span className="iq-fmb-cursor" aria-hidden>
                        |
                      </span>
                    ) : null}
                  </p>
                ) : null}
              </div>
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="finale"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, ease: EASE_OUT }}
            className="pointer-events-auto absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.65, ease: EASE_OUT, delay: 0.08 }}
              className="iq-fmb-finale-headline font-[var(--font-grotesk)]"
            >
              {FINAL_MISSION_BRIEF_FINALE.headline}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.28 }}
              className="iq-fmb-finale-subtitle mt-4 font-[var(--font-grotesk)]"
            >
              {FINAL_MISSION_BRIEF_FINALE.subtitle}
            </motion.p>

            <motion.button
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.48 }}
              className="iq-fmb-finale-cta mt-10 font-[var(--font-grotesk)]"
              onClick={() => {
                /* Standalone preview — no onboarding hookup yet. */
              }}
            >
              {FINAL_MISSION_BRIEF_FINALE.cta}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
