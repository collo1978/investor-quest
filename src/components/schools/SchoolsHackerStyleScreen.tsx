"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  buildHackerStyleQueue,
  HACKER_CODE_FRAGMENTS,
  HACKER_STYLE_BEATS,
  HACKER_STYLE_CHAR_MS,
  HACKER_STYLE_FINALE,
  HACKER_STYLE_FINALE_FADE_MS,
  HACKER_STYLE_FINALE_GLITCH_MS,
  HACKER_STYLE_LINE_GAP_MS,
  type HackerStyleLine,
  type HackerStyleLineVariant,
  type HackerStyleQueueItem
} from "@/lib/schools/hackerStyleContent";
import {
  playMissionBriefKeystroke,
  primeMissionBriefAudio,
  stopMissionBriefAudio
} from "@/lib/schools/missionBriefTypewriterSound";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const FADE_MS = 560;

type ScriptPhase = "typing" | "fade" | "pause" | "done";

function lineClass(variant: HackerStyleLineVariant, glitch = false): string {
  const base = "iq-hack-line";
  const glitchClass = glitch ? " iq-hack-line--glitch" : "";
  switch (variant) {
    case "system":
      return `${base} iq-hack-line--system${glitchClass}`;
    case "granted":
      return `${base} iq-hack-line--granted${glitchClass}`;
    case "threat-word":
      return `${base} iq-hack-line--threat${glitchClass}`;
    case "heading":
      return `${base} iq-hack-line--heading${glitchClass}`;
    case "body-sm":
      return `${base} iq-hack-line--body-sm${glitchClass}`;
    case "body":
    default:
      return `${base} iq-hack-line--body${glitchClass}`;
  }
}

function useHackerStyleScript(
  queue: HackerStyleQueueItem[],
  active: boolean,
  instant: boolean,
  soundEnabled: boolean
) {
  const [queueIndex, setQueueIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [beatLines, setBeatLines] = useState<HackerStyleLine[]>([]);
  const [phase, setPhase] = useState<ScriptPhase>("typing");
  const [fadeLineId, setFadeLineId] = useState<string | null>(null);
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
    setFadeLineId(null);
    setGlitchActive(false);
  }, [clearTimer]);

  const finishLineRef = useRef<(item: HackerStyleQueueItem) => void>(() => {});
  const tickRef = useRef<() => void>(() => {});
  const runFadeRef = useRef<(item: HackerStyleQueueItem) => void>(() => {});

  const advanceBeatPause = useCallback(
    (item: HackerStyleQueueItem) => {
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
        setFadeLineId(null);
        setGlitchActive(false);
        phaseRef.current = "typing";
        setPhase("typing");
        schedule(() => tickRef.current(), 0);
      }, item.beatPauseAfterMs);
    },
    [schedule]
  );

  finishLineRef.current = (item: HackerStyleQueueItem) => {
    if (item.line.revealMode === "glitch") {
      setGlitchActive(true);
    }
    setBeatLines((prev) => [...prev, item.line]);
    setFadeLineId(null);
    charCountRef.current = 0;
    setCharCount(0);

    const pauseMs =
      item.line.pauseAfterMs ??
      (item.isLastInBeat ? 0 : HACKER_STYLE_LINE_GAP_MS);

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

  runFadeRef.current = (item: HackerStyleQueueItem) => {
    phaseRef.current = "fade";
    setPhase("fade");
    setFadeLineId(item.line.id);
    activeBeatIdRef.current = item.beatId;
    const pauseMs = item.line.pauseAfterMs ?? HACKER_STYLE_LINE_GAP_MS;
    schedule(() => finishLineRef.current(item), FADE_MS + pauseMs);
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

    if (line.revealMode === "fade") {
      runFadeRef.current(item);
      return;
    }

    if (charCountRef.current < line.text.length) {
      charCountRef.current += 1;
      setCharCount(charCountRef.current);
      if (soundEnabledRef.current) {
        playMissionBriefKeystroke({ char: line.text.charAt(charCountRef.current - 1) });
      }
      schedule(() => tickRef.current(), HACKER_STYLE_CHAR_MS);
      return;
    }

    finishLineRef.current(item);
  };

  const revealCurrent = useCallback(() => {
    if (phaseRef.current === "done") return;
    clearTimer();

    const item = queueRef.current[queueIndexRef.current];
    if (!item) return;

    if (phaseRef.current === "fade") {
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
      setFadeLineId(null);
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

    schedule(() => tickRef.current(), 320);

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

  const showCurrentLine =
    currentLine &&
    phase !== "done" &&
    currentLine.revealMode !== "fade" &&
    !beatLines.some((l) => l.id === currentLine.id);

  return {
    beatLines,
    currentLine,
    charCount,
    displayText,
    isTyping,
    showCurrentLine,
    fadeLineId,
    glitchActive,
    done: phase === "done",
    revealCurrent,
    skipToEnd,
    reset
  };
}

function HackerCodeStream({ reduceMotion }: { reduceMotion: boolean | null }) {
  const lines = useMemo(
    () => [...HACKER_CODE_FRAGMENTS, ...HACKER_CODE_FRAGMENTS],
    []
  );

  return (
    <div aria-hidden className="iq-hack-code-stream pointer-events-none absolute inset-0 overflow-hidden opacity-[0.22]">
      <motion.div
        className="iq-hack-code-column font-mono text-[0.62rem] leading-relaxed text-emerald-400/80"
        animate={reduceMotion ? undefined : { y: ["0%", "-50%"] }}
        transition={
          reduceMotion
            ? undefined
            : { duration: 14, repeat: Infinity, ease: "linear" }
        }
      >
        {lines.map((line, index) => (
          <p key={`${line}-${index}`} className="m-0 px-6 py-0.5">
            <span className="text-cyan-400/50">{"> "}</span>
            {line}
          </p>
        ))}
      </motion.div>
    </div>
  );
}

/** Standalone hacker-style investor unlock briefing (preview only). */
export function SchoolsHackerStyleScreen() {
  const reduceMotion = useReducedMotion();
  const [runId, setRunId] = useState(0);
  const [screenPhase, setScreenPhase] = useState<"terminal" | "finale">("terminal");
  const [terminalGlitching, setTerminalGlitching] = useState(false);
  const [terminalHidden, setTerminalHidden] = useState(false);
  const finaleTimerRef = useRef<number | null>(null);
  const glitchTimerRef = useRef<number | null>(null);

  const queue = useMemo(() => buildHackerStyleQueue(HACKER_STYLE_BEATS), []);
  const soundEnabled = screenPhase === "terminal" && !reduceMotion;

  const {
    beatLines,
    currentLine,
    charCount,
    displayText,
    isTyping,
    showCurrentLine,
    fadeLineId,
    glitchActive,
    done,
    revealCurrent,
    skipToEnd,
    reset
  } = useHackerStyleScript(queue, screenPhase === "terminal", !!reduceMotion, soundEnabled);

  const handleReplay = useCallback(() => {
    if (finaleTimerRef.current != null) {
      window.clearTimeout(finaleTimerRef.current);
      finaleTimerRef.current = null;
    }
    if (glitchTimerRef.current != null) {
      window.clearTimeout(glitchTimerRef.current);
      glitchTimerRef.current = null;
    }
    setTerminalGlitching(false);
    setTerminalHidden(false);
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

    setTerminalGlitching(true);
    glitchTimerRef.current = window.setTimeout(() => {
      setTerminalHidden(true);
      setTerminalGlitching(false);
      finaleTimerRef.current = window.setTimeout(() => {
        setScreenPhase("finale");
        setTerminalHidden(false);
      }, reduceMotion ? 0 : HACKER_STYLE_FINALE_FADE_MS);
    }, reduceMotion ? 0 : HACKER_STYLE_FINALE_GLITCH_MS);

    return () => {
      if (finaleTimerRef.current != null) {
        window.clearTimeout(finaleTimerRef.current);
      }
      if (glitchTimerRef.current != null) {
        window.clearTimeout(glitchTimerRef.current);
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
      className="iq-hack-screen relative h-[100dvh] w-full overflow-hidden bg-[#020403]"
      aria-label="Hacker style briefing preview"
    >
      <HackerCodeStream reduceMotion={reduceMotion} />
      <div aria-hidden className="iq-hack-scanlines pointer-events-none absolute inset-0" />
      <div aria-hidden className="iq-hack-glow pointer-events-none absolute inset-0" />

      <div className="pointer-events-none absolute inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-30 flex justify-between px-4">
        <button type="button" onClick={handleReplay} className="iq-hack-ctrl pointer-events-auto">
          Replay
        </button>
        {screenPhase === "terminal" ? (
          <button type="button" onClick={handleSkip} className="iq-hack-ctrl pointer-events-auto">
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
            aria-label="Reveal current terminal beat"
            initial={{ opacity: 1 }}
            animate={{
              opacity: terminalHidden ? 0 : 1,
              x: terminalGlitching ? [0, -4, 3, -2, 0] : 0,
              filter: terminalGlitching
                ? [
                    "hue-rotate(0deg) blur(0px)",
                    "hue-rotate(12deg) blur(1px)",
                    "hue-rotate(-8deg) blur(0px)",
                    "hue-rotate(0deg) blur(0px)"
                  ]
                : "hue-rotate(0deg) blur(0px)"
            }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: HACKER_STYLE_FINALE_FADE_MS / 1000, ease: EASE_OUT },
              x: { duration: 0.35, ease: "easeInOut" },
              filter: { duration: 0.35 }
            }}
            onClick={revealCurrent}
            className="pointer-events-auto absolute inset-0 z-10 flex items-center justify-center px-5 py-16"
          >
            <div className="iq-hack-terminal w-full max-w-2xl px-5 py-7 sm:px-7 sm:py-8">
              <div className="iq-hack-prompt mb-4 text-left" aria-hidden>
                root@investor-quest:~$
              </div>

              <div aria-live="polite" className="space-y-2.5 text-left">
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

                {currentLine && fadeLineId === currentLine.id ? (
                  <motion.p
                    key={currentLine.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: FADE_MS / 1000, ease: EASE_OUT }}
                    className={lineClass(currentLine.variant)}
                  >
                    {currentLine.text}
                  </motion.p>
                ) : null}

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
                      <span className="iq-hack-cursor" aria-hidden>
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
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.62, ease: EASE_OUT, delay: 0.06 }}
              className="iq-hack-finale-title font-[var(--font-grotesk)]"
            >
              {HACKER_STYLE_FINALE.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.48, ease: EASE_OUT, delay: 0.24 }}
              className="iq-hack-finale-tagline mt-3 font-[var(--font-grotesk)]"
            >
              {HACKER_STYLE_FINALE.tagline}
            </motion.p>

            <motion.button
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.42 }}
              className="iq-hack-finale-cta mt-10 font-[var(--font-grotesk)]"
              onClick={() => {
                /* Standalone preview — no onboarding hookup yet. */
              }}
            >
              {HACKER_STYLE_FINALE.cta}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
