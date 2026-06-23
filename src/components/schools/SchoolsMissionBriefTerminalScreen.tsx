"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  buildMissionBriefTerminalQueue,
  MISSION_BRIEF_TERMINAL_CHAR_MS,
  MISSION_BRIEF_TERMINAL_FADE_MS,
  MISSION_BRIEF_TERMINAL_FINALE,
  MISSION_BRIEF_TERMINAL_FINALE_FADE_MS,
  MISSION_BRIEF_TERMINAL_LINE_GAP_MS,
  MISSION_BRIEF_TERMINAL_SEGMENTS,
  type MissionBriefTerminalLine,
  type MissionBriefTerminalLineVariant,
  type MissionBriefTerminalQueueItem
} from "@/lib/schools/missionBriefTerminalContent";
import {
  playMissionBriefKeystroke,
  primeMissionBriefAudio,
  stopMissionBriefAudio
} from "@/lib/schools/missionBriefTypewriterSound";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Deterministic starfield — no Math.random() during render. */
const TERMINAL_STARS: ReadonlyArray<{
  x: number;
  y: number;
  size: number;
  opacity: number;
  dur: number;
  delay: number;
}> = [
  { x: 8, y: 12, size: 1.2, opacity: 0.45, dur: 14, delay: 0 },
  { x: 18, y: 28, size: 1, opacity: 0.32, dur: 18, delay: 0.4 },
  { x: 32, y: 8, size: 1.4, opacity: 0.38, dur: 16, delay: 1.1 },
  { x: 44, y: 22, size: 1, opacity: 0.28, dur: 20, delay: 0.2 },
  { x: 56, y: 14, size: 1.1, opacity: 0.42, dur: 15, delay: 0.8 },
  { x: 68, y: 34, size: 1, opacity: 0.3, dur: 17, delay: 1.4 },
  { x: 78, y: 10, size: 1.3, opacity: 0.36, dur: 19, delay: 0.6 },
  { x: 88, y: 26, size: 1, opacity: 0.34, dur: 16, delay: 1.8 },
  { x: 12, y: 52, size: 1, opacity: 0.26, dur: 21, delay: 0.9 },
  { x: 26, y: 68, size: 1.2, opacity: 0.33, dur: 18, delay: 1.2 },
  { x: 40, y: 78, size: 1, opacity: 0.24, dur: 22, delay: 0.3 },
  { x: 54, y: 58, size: 1.1, opacity: 0.31, dur: 17, delay: 1.6 },
  { x: 66, y: 72, size: 1, opacity: 0.27, dur: 19, delay: 0.5 },
  { x: 80, y: 62, size: 1.3, opacity: 0.35, dur: 15, delay: 1.0 },
  { x: 92, y: 84, size: 1, opacity: 0.29, dur: 20, delay: 1.3 },
  { x: 6, y: 88, size: 1.1, opacity: 0.22, dur: 23, delay: 0.7 },
  { x: 36, y: 42, size: 1, opacity: 0.2, dur: 24, delay: 2.0 },
  { x: 72, y: 46, size: 1.2, opacity: 0.25, dur: 18, delay: 1.5 }
];

type ScriptPhase = "typing" | "pause" | "done";

type CompletedLine = MissionBriefTerminalLine;

function lineClass(variant: MissionBriefTerminalLineVariant): string {
  const base = "iq-mbt-line";
  switch (variant) {
    case "system":
      return `${base} iq-mbt-line--system`;
    case "heading":
      return `${base} iq-mbt-line--heading`;
    case "banner":
      return `${base} iq-mbt-line--banner`;
    case "body":
    default:
      return `${base} iq-mbt-line--body`;
  }
}

function useTerminalScript(
  queue: MissionBriefTerminalQueueItem[],
  active: boolean,
  instant: boolean,
  soundEnabled: boolean
) {
  const [queueIndex, setQueueIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [completedLines, setCompletedLines] = useState<CompletedLine[]>([]);
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

  const schedule = useCallback((fn: () => void, ms: number) => {
    clearTimer();
    timerRef.current = window.setTimeout(fn, ms);
  }, [clearTimer]);

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

  const finishLineRef = useRef<(item: MissionBriefTerminalQueueItem) => void>(() => {});
  const startFadeLineRef = useRef<(item: MissionBriefTerminalQueueItem) => void>(() => {});
  const tickRef = useRef<() => void>(() => {});

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
      schedule(() => tickRef.current(), MISSION_BRIEF_TERMINAL_CHAR_MS);
      return;
    }

    finishLineRef.current(item);
  };

  finishLineRef.current = (item: MissionBriefTerminalQueueItem) => {
    setCompletedLines((prev) => [...prev, item.line]);
    setFadeLineId(null);
    charCountRef.current = 0;
    setCharCount(0);

    const pauseMs =
      item.line.pauseAfterMs ??
      (item.isLastInSegment ? item.segmentPauseAfterMs : MISSION_BRIEF_TERMINAL_LINE_GAP_MS);

    const nextIndex = queueIndexRef.current + 1;
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
    }, pauseMs);
  };

  startFadeLineRef.current = (item: MissionBriefTerminalQueueItem) => {
    setFadeLineId(item.line.id);
    const pauseMs = item.line.pauseAfterMs ?? MISSION_BRIEF_TERMINAL_LINE_GAP_MS;
    schedule(
      () => finishLineRef.current(item),
      MISSION_BRIEF_TERMINAL_FADE_MS + pauseMs
    );
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
    setCompletedLines(queueRef.current.map((entry) => entry.line));
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

    schedule(() => tickRef.current(), 280);

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
    currentItem,
    displayText,
    fadeLineId,
    isTyping,
    phase,
    done: phase === "done",
    revealCurrent,
    skipToEnd,
    reset
  };
}

function TerminalStarfield({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="iq-mbt-glow absolute inset-0" />
      {TERMINAL_STARS.map((star, index) => (
        <motion.span
          key={index}
          className="absolute rounded-full bg-sky-200/80"
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
                  opacity: [star.opacity * 0.45, star.opacity, star.opacity * 0.45],
                  y: [0, -3, 0]
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

/** Standalone cinematic investor terminal briefing (preview only). */
export function SchoolsMissionBriefTerminalScreen() {
  const reduceMotion = useReducedMotion();
  const [runId, setRunId] = useState(0);
  const [screenPhase, setScreenPhase] = useState<"terminal" | "reveal">("terminal");
  const [terminalExiting, setTerminalExiting] = useState(false);
  const finaleTimerRef = useRef<number | null>(null);

  const queue = useMemo(
    () => buildMissionBriefTerminalQueue(MISSION_BRIEF_TERMINAL_SEGMENTS),
    []
  );

  const soundEnabled = screenPhase === "terminal" && !reduceMotion;

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
  } = useTerminalScript(queue, screenPhase === "terminal", !!reduceMotion, soundEnabled);

  const handleReplay = useCallback(() => {
    if (finaleTimerRef.current != null) {
      window.clearTimeout(finaleTimerRef.current);
      finaleTimerRef.current = null;
    }
    setTerminalExiting(false);
    setScreenPhase("terminal");
    reset();
    setRunId((id) => id + 1);
    primeMissionBriefAudio();
  }, [reset]);

  const handleSkip = useCallback(() => {
    skipToEnd();
  }, [skipToEnd]);

  useEffect(() => {
    if (!done || screenPhase !== "terminal") return;

    setTerminalExiting(true);
    finaleTimerRef.current = window.setTimeout(() => {
      setScreenPhase("reveal");
      setTerminalExiting(false);
    }, reduceMotion ? 0 : MISSION_BRIEF_TERMINAL_FINALE_FADE_MS);

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
      className="iq-mbt-screen relative h-[100dvh] w-full overflow-hidden bg-[#05070A]"
      aria-label="Mission brief terminal preview"
    >
      <TerminalStarfield reduceMotion={reduceMotion} />

      <div className="pointer-events-none absolute inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-30 flex justify-between px-4">
        <button
          type="button"
          onClick={handleReplay}
          className="iq-mbt-ctrl pointer-events-auto"
        >
          Replay
        </button>
        {screenPhase === "terminal" ? (
          <button
            type="button"
            onClick={handleSkip}
            className="iq-mbt-ctrl pointer-events-auto"
          >
            Skip
          </button>
        ) : (
          <span aria-hidden className="w-[4.5rem]" />
        )}
      </div>

      <AnimatePresence mode="wait">
        {screenPhase === "terminal" ? (
          <motion.button
            key="terminal"
            type="button"
            aria-label="Reveal current terminal text"
            initial={{ opacity: 1 }}
            animate={{ opacity: terminalExiting ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MISSION_BRIEF_TERMINAL_FINALE_FADE_MS / 1000, ease: EASE_OUT }}
            onClick={revealCurrent}
            className="iq-mbt-terminal-stage pointer-events-auto absolute inset-0 z-10 flex items-center justify-center px-5 py-16 sm:px-8"
          >
            <div className="iq-mbt-terminal-panel w-full max-w-2xl text-left">
              <div aria-live="polite" className="space-y-3">
                {completedLines.map((line) => (
                  <p key={line.id} className={lineClass(line.variant)}>
                    {line.text}
                  </p>
                ))}

                {currentLine && fadeLineId === currentLine.id ? (
                  <motion.p
                    key={currentLine.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: MISSION_BRIEF_TERMINAL_FADE_MS / 1000, ease: EASE_OUT }}
                    className={lineClass(currentLine.variant)}
                  >
                    {currentLine.text}
                  </motion.p>
                ) : null}

                {currentLine && currentLine.revealMode !== "fade" && !done ? (
                  <p className={lineClass(currentLine.variant)}>
                    {displayText}
                    {isTyping ? (
                      <span className="iq-mbt-cursor" aria-hidden>
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
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, ease: EASE_OUT }}
            className="pointer-events-auto absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.65, ease: EASE_OUT, delay: 0.08 }}
              className="iq-mbt-finale-headline font-[var(--font-grotesk)]"
            >
              {MISSION_BRIEF_TERMINAL_FINALE.headline}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.28 }}
              className="iq-mbt-finale-subtitle mt-4 font-[var(--font-grotesk)]"
            >
              {MISSION_BRIEF_TERMINAL_FINALE.subtitle}
            </motion.p>

            <motion.button
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.48 }}
              className="iq-mbt-finale-cta mt-10 font-[var(--font-grotesk)]"
              onClick={() => {
                /* Standalone preview — no onboarding hookup yet. */
              }}
            >
              {MISSION_BRIEF_TERMINAL_FINALE.cta}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
