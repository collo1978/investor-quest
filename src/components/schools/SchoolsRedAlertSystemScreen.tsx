"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  buildRedAlertQueue,
  RED_ALERT_BEATS,
  RED_ALERT_CHAR_MS,
  RED_ALERT_FINALE,
  RED_ALERT_FINALE_FADE_MS,
  RED_ALERT_LINE_GAP_MS,
  RED_ALERT_WARNING_FLASH_MS,
  type RedAlertLine,
  type RedAlertLineVariant,
  type RedAlertQueueItem
} from "@/lib/schools/redAlertSystemContent";
import {
  playMissionBriefKeystroke,
  primeMissionBriefAudio,
  stopMissionBriefAudio
} from "@/lib/schools/missionBriefTypewriterSound";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

type ScriptPhase = "flash" | "typing" | "pause" | "done";

function lineClass(variant: RedAlertLineVariant, glitch = false): string {
  const base = "iq-ras-line";
  const glitchClass = glitch ? " iq-ras-line--glitch" : "";
  switch (variant) {
    case "warning-flash":
      return `${base} iq-ras-line--warning${glitchClass}`;
    case "threat-label":
      return `${base} iq-ras-line--threat-label${glitchClass}`;
    case "threat-word":
      return `${base} iq-ras-line--threat-word${glitchClass}`;
    case "heading":
      return `${base} iq-ras-line--heading${glitchClass}`;
    case "body":
    default:
      return `${base} iq-ras-line--body${glitchClass}`;
  }
}

function useRedAlertScript(
  queue: RedAlertQueueItem[],
  active: boolean,
  instant: boolean,
  soundEnabled: boolean
) {
  const [queueIndex, setQueueIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [beatLines, setBeatLines] = useState<RedAlertLine[]>([]);
  const [phase, setPhase] = useState<ScriptPhase>("typing");
  const [flashVisible, setFlashVisible] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const timerRef = useRef<number | null>(null);
  const queueIndexRef = useRef(0);
  const charCountRef = useRef(0);
  const phaseRef = useRef<ScriptPhase>("typing");
  const queueRef = useRef(queue);
  const soundEnabledRef = useRef(soundEnabled);
  const activeBeatIdRef = useRef<string | null>(null);

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
    activeBeatIdRef.current = null;
    setQueueIndex(0);
    setCharCount(0);
    setBeatLines([]);
    setPhase("typing");
    setFlashVisible(false);
    setGlitchActive(false);
  }, [clearTimer]);

  const finishLineRef = useRef<(item: RedAlertQueueItem) => void>(() => {});
  const tickRef = useRef<() => void>(() => {});
  const runFlashRef = useRef<(item: RedAlertQueueItem) => void>(() => {});

  const advanceBeatPause = useCallback(
    (item: RedAlertQueueItem) => {
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
        const nextItem = queueRef.current[nextIndex];
        const nextBeatId = nextItem?.beatId ?? null;
        if (nextBeatId !== item.beatId) {
          setBeatLines([]);
          activeBeatIdRef.current = nextBeatId;
        }
        queueIndexRef.current = nextIndex;
        setQueueIndex(nextIndex);
        setFlashVisible(false);
        setGlitchActive(false);
        phaseRef.current = "typing";
        setPhase("typing");
        schedule(() => tickRef.current(), 0);
      }, item.beatPauseAfterMs);
    },
    [schedule]
  );

  finishLineRef.current = (item: RedAlertQueueItem) => {
    if (item.line.revealMode === "glitch") {
      setGlitchActive(true);
    }
    setBeatLines((prev) => [...prev, item.line]);
    charCountRef.current = 0;
    setCharCount(0);

    const pauseMs =
      item.line.pauseAfterMs ??
      (item.isLastInBeat ? 0 : RED_ALERT_LINE_GAP_MS);

    const nextIndex = queueIndexRef.current + 1;
    const hasMoreInBeat =
      !item.isLastInBeat && nextIndex < queueRef.current.length;

    if (hasMoreInBeat) {
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

    schedule(() => advanceBeatPause(item), pauseMs);
  };

  runFlashRef.current = (item: RedAlertQueueItem) => {
    phaseRef.current = "flash";
    setPhase("flash");
    setFlashVisible(true);
    activeBeatIdRef.current = item.beatId;

    schedule(() => {
      setBeatLines([item.line]);
      setFlashVisible(false);
      finishLineRef.current(item);
    }, RED_ALERT_WARNING_FLASH_MS);
  };

  tickRef.current = () => {
    const item = queueRef.current[queueIndexRef.current];
    if (!item) {
      phaseRef.current = "done";
      setPhase("done");
      return;
    }

    if (activeBeatIdRef.current !== item.beatId) {
      activeBeatIdRef.current = item.beatId;
      setBeatLines([]);
    }

    const line = item.line;

    if (line.revealMode === "flash") {
      runFlashRef.current(item);
      return;
    }

    if (charCountRef.current < line.text.length) {
      charCountRef.current += 1;
      setCharCount(charCountRef.current);
      if (soundEnabledRef.current) {
        playMissionBriefKeystroke({ char: line.text.charAt(charCountRef.current - 1) });
      }
      schedule(() => tickRef.current(), RED_ALERT_CHAR_MS);
      return;
    }

    finishLineRef.current(item);
  };

  const revealCurrent = useCallback(() => {
    if (phaseRef.current === "done") return;
    clearTimer();

    const item = queueRef.current[queueIndexRef.current];
    if (!item) return;

    if (phaseRef.current === "flash") {
      setFlashVisible(false);
      setBeatLines([item.line]);
      finishLineRef.current(item);
      return;
    }

    if (phaseRef.current === "pause") {
      const nextIndex = queueIndexRef.current + 1;
      if (nextIndex >= queueRef.current.length) {
        phaseRef.current = "done";
        setPhase("done");
        setQueueIndex(queueRef.current.length);
        queueIndexRef.current = queueRef.current.length;
        return;
      }
      const nextItem = queueRef.current[nextIndex];
      if (nextItem.beatId !== item.beatId) {
        setBeatLines([]);
        activeBeatIdRef.current = nextItem.beatId;
      }
      queueIndexRef.current = nextIndex;
      setQueueIndex(nextIndex);
      setGlitchActive(false);
      phaseRef.current = "typing";
      setPhase("typing");
      schedule(() => tickRef.current(), 0);
      return;
    }

    charCountRef.current = item.line.text.length;
    setCharCount(item.line.text.length);
    if (item.line.revealMode === "glitch") {
      setGlitchActive(true);
    }
    finishLineRef.current(item);
  }, [clearTimer, schedule]);

  const skipToEnd = useCallback(() => {
    clearTimer();
    phaseRef.current = "done";
    setPhase("done");
    setFlashVisible(false);
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

    schedule(() => tickRef.current(), 360);

    return () => clearTimer();
  }, [active, clearTimer, instant, reset, schedule, skipToEnd]);

  const displayText = useMemo(() => {
    if (!currentLine || currentLine.revealMode === "flash") return "";
    if (phase === "done") return currentLine.text;
    return currentLine.text.slice(0, charCount);
  }, [charCount, currentLine, phase]);

  const isTyping =
    phase === "typing" &&
    currentLine?.revealMode !== "flash" &&
    charCount < (currentLine?.text.length ?? 0);

  const showCurrentLine =
    currentLine &&
    phase !== "done" &&
    currentLine.revealMode !== "flash" &&
    !beatLines.some((l) => l.id === currentLine.id);

  return {
    beatLines,
    currentLine,
    charCount,
    displayText,
    isTyping,
    showCurrentLine,
    flashVisible,
    glitchActive,
    phase,
    done: phase === "done",
    revealCurrent,
    skipToEnd,
    reset
  };
}

function RedAlertBackdrop({
  reduceMotion,
  stabilized
}: {
  reduceMotion: boolean | null;
  stabilized: boolean;
}) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="iq-ras-glow absolute inset-0"
        animate={
          stabilized
            ? { opacity: 1 }
            : { opacity: reduceMotion ? 0.85 : [0.72, 0.95, 0.78, 0.92] }
        }
        transition={
          stabilized
            ? { duration: 1.1, ease: EASE_OUT }
            : reduceMotion
              ? { duration: 0 }
              : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
        }
        data-stabilized={stabilized ? "true" : "false"}
      />
      <div className="iq-ras-scanlines absolute inset-0" />
      <div className="iq-ras-vignette absolute inset-0" />
    </div>
  );
}

/** Standalone red alert system briefing preview (not wired to onboarding). */
export function SchoolsRedAlertSystemScreen() {
  const reduceMotion = useReducedMotion();
  const [runId, setRunId] = useState(0);
  const [screenPhase, setScreenPhase] = useState<"alert" | "finale">("alert");
  const [alertExiting, setAlertExiting] = useState(false);
  const finaleTimerRef = useRef<number | null>(null);

  const queue = useMemo(() => buildRedAlertQueue(RED_ALERT_BEATS), []);
  const soundEnabled = screenPhase === "alert" && !reduceMotion;

  const {
    beatLines,
    currentLine,
    charCount,
    displayText,
    isTyping,
    showCurrentLine,
    flashVisible,
    glitchActive,
    done,
    revealCurrent,
    skipToEnd,
    reset
  } = useRedAlertScript(queue, screenPhase === "alert", !!reduceMotion, soundEnabled);

  const handleReplay = useCallback(() => {
    if (finaleTimerRef.current != null) {
      window.clearTimeout(finaleTimerRef.current);
      finaleTimerRef.current = null;
    }
    setAlertExiting(false);
    setScreenPhase("alert");
    reset();
    setRunId((id) => id + 1);
    primeMissionBriefAudio();
  }, [reset]);

  const handleSkip = useCallback(() => {
    skipToEnd();
  }, [skipToEnd]);

  useEffect(() => {
    if (!done || screenPhase !== "alert") return;

    setAlertExiting(true);
    finaleTimerRef.current = window.setTimeout(() => {
      setScreenPhase("finale");
      setAlertExiting(false);
    }, reduceMotion ? 0 : RED_ALERT_FINALE_FADE_MS);

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
      className="iq-ras-screen relative h-[100dvh] w-full overflow-hidden bg-[#080406]"
      aria-label="Red alert system preview"
    >
      <RedAlertBackdrop reduceMotion={reduceMotion} stabilized={screenPhase === "finale"} />

      <div className="pointer-events-none absolute inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-30 flex justify-between px-4">
        <button type="button" onClick={handleReplay} className="iq-ras-ctrl pointer-events-auto">
          Replay
        </button>
        {screenPhase === "alert" ? (
          <button type="button" onClick={handleSkip} className="iq-ras-ctrl pointer-events-auto">
            Skip
          </button>
        ) : (
          <span aria-hidden className="w-[4.5rem]" />
        )}
      </div>

      <AnimatePresence mode="wait">
        {screenPhase === "alert" ? (
          <motion.button
            key="alert"
            type="button"
            aria-label="Reveal current alert beat"
            initial={{ opacity: 1 }}
            animate={{ opacity: alertExiting ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: RED_ALERT_FINALE_FADE_MS / 1000, ease: EASE_OUT }}
            onClick={revealCurrent}
            className="pointer-events-auto absolute inset-0 z-10 flex items-center justify-center px-5 py-16"
          >
            <motion.div
              className="iq-ras-frame relative w-full max-w-xl px-6 py-8 sm:px-8 sm:py-10"
              animate={
                reduceMotion
                  ? undefined
                  : {
                      boxShadow: [
                        "0 0 0 1px rgba(239,68,68,0.35), 0 0 32px rgba(239,68,68,0.18), inset 0 0 24px rgba(239,68,68,0.06)",
                        "0 0 0 1px rgba(248,113,113,0.55), 0 0 48px rgba(239,68,68,0.32), inset 0 0 32px rgba(239,68,68,0.1)",
                        "0 0 0 1px rgba(239,68,68,0.35), 0 0 32px rgba(239,68,68,0.18), inset 0 0 24px rgba(239,68,68,0.06)"
                      ]
                    }
              }
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <div aria-live="polite" className="relative z-[1] space-y-3 text-left">
                {flashVisible ? (
                  <motion.p
                    key="warning-flash"
                    className={lineClass("warning-flash")}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={
                      reduceMotion
                        ? { opacity: 1, scale: 1 }
                        : { opacity: [0, 1, 0.35, 1, 0.5, 1], scale: [0.96, 1.04, 1, 1.02, 1] }
                    }
                    transition={{ duration: RED_ALERT_WARNING_FLASH_MS / 1000, ease: "easeOut" }}
                  >
                    WARNING
                  </motion.p>
                ) : null}

                {beatLines.map((line) => (
                  <p
                    key={line.id}
                    className={lineClass(
                      line.variant,
                      line.revealMode === "glitch" && glitchActive
                    )}
                  >
                    {line.text}
                  </p>
                ))}

                {showCurrentLine && currentLine ? (
                  <p
                    className={lineClass(
                      currentLine.variant,
                      currentLine.revealMode === "glitch" &&
                        charCount >= currentLine.text.length &&
                        glitchActive
                    )}
                  >
                    {displayText}
                    {isTyping ? (
                      <span className="iq-ras-cursor" aria-hidden>
                        |
                      </span>
                    ) : null}
                  </p>
                ) : null}
              </div>
            </motion.div>
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
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.62, ease: EASE_OUT, delay: 0.06 }}
              className="iq-ras-finale-title font-[var(--font-grotesk)]"
            >
              {RED_ALERT_FINALE.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.48, ease: EASE_OUT, delay: 0.24 }}
              className="iq-ras-finale-tagline mt-3 font-[var(--font-grotesk)]"
            >
              {RED_ALERT_FINALE.tagline}
            </motion.p>

            <motion.button
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.42 }}
              className="iq-ras-finale-cta mt-10 font-[var(--font-grotesk)]"
              onClick={() => {
                /* Standalone preview — no onboarding hookup yet. */
              }}
            >
              {RED_ALERT_FINALE.cta}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
