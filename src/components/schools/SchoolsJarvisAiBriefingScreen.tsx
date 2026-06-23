"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  buildJarvisBriefQueue,
  JARVIS_BRIEF_CHAR_MS,
  JARVIS_BRIEF_FINALE,
  JARVIS_BRIEF_FINALE_FADE_MS,
  JARVIS_BRIEF_LINE_GAP_MS,
  JARVIS_BRIEF_SCAN_DURATION_MS,
  JARVIS_BRIEF_SEGMENTS,
  type JarvisBriefLine,
  type JarvisBriefLineVariant,
  type JarvisBriefQueueItem
} from "@/lib/schools/jarvisAiBriefingContent";
import {
  playMissionBriefKeystroke,
  primeMissionBriefAudio,
  stopMissionBriefAudio
} from "@/lib/schools/missionBriefTypewriterSound";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const HUD_PARTICLES: ReadonlyArray<{
  x: number;
  y: number;
  size: number;
  opacity: number;
  dur: number;
  delay: number;
}> = [
  { x: 10, y: 18, size: 1.1, opacity: 0.35, dur: 16, delay: 0 },
  { x: 24, y: 42, size: 1, opacity: 0.28, dur: 19, delay: 0.5 },
  { x: 38, y: 12, size: 1.2, opacity: 0.32, dur: 17, delay: 1.1 },
  { x: 52, y: 28, size: 1, opacity: 0.26, dur: 21, delay: 0.3 },
  { x: 66, y: 16, size: 1.1, opacity: 0.34, dur: 18, delay: 0.9 },
  { x: 78, y: 38, size: 1, opacity: 0.3, dur: 20, delay: 1.4 },
  { x: 88, y: 22, size: 1.2, opacity: 0.27, dur: 15, delay: 0.7 },
  { x: 14, y: 72, size: 1, opacity: 0.24, dur: 22, delay: 1.2 },
  { x: 42, y: 82, size: 1.1, opacity: 0.22, dur: 23, delay: 0.4 },
  { x: 70, y: 76, size: 1, opacity: 0.25, dur: 19, delay: 1.6 }
];

type ScriptPhase = "typing" | "scanning" | "pause" | "done";

function lineClass(variant: JarvisBriefLineVariant): string {
  const base = "iq-jarvis-line";
  switch (variant) {
    case "scan":
      return `${base} iq-jarvis-line--scan`;
    case "heading":
      return `${base} iq-jarvis-line--heading`;
    case "body-sm":
      return `${base} iq-jarvis-line--body-sm`;
    case "body":
    default:
      return `${base} iq-jarvis-line--body`;
  }
}

function useJarvisBriefScript(
  queue: JarvisBriefQueueItem[],
  active: boolean,
  instant: boolean,
  soundEnabled: boolean
) {
  const [queueIndex, setQueueIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [segmentLines, setSegmentLines] = useState<JarvisBriefLine[]>([]);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [phase, setPhase] = useState<ScriptPhase>("typing");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanVisible, setScanVisible] = useState(false);
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const queueIndexRef = useRef(0);
  const charCountRef = useRef(0);
  const phaseRef = useRef<ScriptPhase>("typing");
  const queueRef = useRef(queue);
  const soundEnabledRef = useRef(soundEnabled);
  const activeSegmentIdRef = useRef<string | null>(null);

  queueRef.current = queue;
  soundEnabledRef.current = soundEnabled;

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (rafRef.current != null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
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
    setSegmentLines([]);
    setActiveSegmentId(null);
    activeSegmentIdRef.current = null;
    setPhase("typing");
    setScanProgress(0);
    setScanVisible(false);
  }, [clearTimer]);

  const finishLineRef = useRef<(item: JarvisBriefQueueItem) => void>(() => {});
  const tickRef = useRef<() => void>(() => {});

  const runScanAnimation = useCallback(
    (item: JarvisBriefQueueItem, onComplete: () => void) => {
      phaseRef.current = "scanning";
      setPhase("scanning");
      setScanVisible(true);
      setScanProgress(0);

      const duration = item.scanDurationMs ?? JARVIS_BRIEF_SCAN_DURATION_MS;
      const start = performance.now();

      const frame = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        setScanProgress(Math.round(t * 100));
        if (t < 1) {
          rafRef.current = window.requestAnimationFrame(frame);
          return;
        }
        setScanProgress(100);
        onComplete();
      };

      rafRef.current = window.requestAnimationFrame(frame);
    },
    []
  );

  const advanceAfterSegmentPause = useCallback(
    (item: JarvisBriefQueueItem) => {
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
        queueIndexRef.current = nextIndex;
        setQueueIndex(nextIndex);
        setSegmentLines([]);
        setActiveSegmentId(nextItem?.segmentId ?? null);
        activeSegmentIdRef.current = nextItem?.segmentId ?? null;
        setScanVisible(false);
        setScanProgress(0);
        phaseRef.current = "typing";
        setPhase("typing");
        schedule(() => tickRef.current(), 0);
      }, item.segmentPauseAfterMs);
    },
    [schedule]
  );

  finishLineRef.current = (item: JarvisBriefQueueItem) => {
    setSegmentLines((prev) => [...prev, item.line]);
    charCountRef.current = 0;
    setCharCount(0);

    const pauseMs =
      item.line.pauseAfterMs ??
      (item.isLastInSegment ? 0 : JARVIS_BRIEF_LINE_GAP_MS);

    const nextIndex = queueIndexRef.current + 1;
    const hasMoreInSegment = !item.isLastInSegment && nextIndex < queueRef.current.length;

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

    if (item.line.showScanBar) {
      schedule(() => {
        runScanAnimation(item, () => advanceAfterSegmentPause(item));
      }, pauseMs);
      return;
    }

    schedule(() => advanceAfterSegmentPause(item), pauseMs);
  };

  tickRef.current = () => {
    const item = queueRef.current[queueIndexRef.current];
    if (!item) {
      phaseRef.current = "done";
      setPhase("done");
      return;
    }

    if (activeSegmentIdRef.current !== item.segmentId) {
      activeSegmentIdRef.current = item.segmentId;
      setActiveSegmentId(item.segmentId);
      setSegmentLines([]);
    }

    const line = item.line;
    if (charCountRef.current < line.text.length) {
      charCountRef.current += 1;
      setCharCount(charCountRef.current);
      if (soundEnabledRef.current) {
        playMissionBriefKeystroke({ char: line.text.charAt(charCountRef.current - 1) });
      }
      schedule(() => tickRef.current(), JARVIS_BRIEF_CHAR_MS);
      return;
    }

    finishLineRef.current(item);
  };

  const revealCurrent = useCallback(() => {
    if (phaseRef.current === "done") return;
    clearTimer();

    const item = queueRef.current[queueIndexRef.current];
    if (!item) return;

    if (phaseRef.current === "scanning") {
      setScanProgress(100);
      phaseRef.current = "pause";
      setPhase("pause");
      advanceAfterSegmentPause(item);
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
      queueIndexRef.current = nextIndex;
      setQueueIndex(nextIndex);
      setSegmentLines([]);
      setActiveSegmentId(nextItem?.segmentId ?? null);
      activeSegmentIdRef.current = nextItem?.segmentId ?? null;
      setScanVisible(false);
      setScanProgress(0);
      phaseRef.current = "typing";
      setPhase("typing");
      schedule(() => tickRef.current(), 0);
      return;
    }

    charCountRef.current = item.line.text.length;
    setCharCount(item.line.text.length);
    finishLineRef.current(item);
  }, [advanceAfterSegmentPause, clearTimer, schedule]);

  const skipToEnd = useCallback(() => {
    clearTimer();
    phaseRef.current = "done";
    setPhase("done");
    setScanVisible(false);
    setScanProgress(100);
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

    schedule(() => tickRef.current(), 420);

    return () => clearTimer();
  }, [active, clearTimer, instant, reset, schedule, skipToEnd]);

  const displayText = useMemo(() => {
    if (!currentLine) return "";
    if (phase === "done") return currentLine.text;
    return currentLine.text.slice(0, charCount);
  }, [charCount, currentLine, phase]);

  const isTyping =
    phase === "typing" && charCount < (currentLine?.text.length ?? 0);

  const showCurrentLine =
    currentLine && phase !== "done" && !segmentLines.some((l) => l.id === currentLine.id);

  return {
    segmentLines,
    currentLine,
    displayText,
    isTyping,
    showCurrentLine,
    scanProgress,
    scanVisible,
    phase,
    done: phase === "done",
    revealCurrent,
    skipToEnd,
    reset
  };
}

function JarvisScanHud({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <div aria-hidden className="iq-jarvis-hud-rings pointer-events-none absolute inset-0">
      <svg viewBox="0 0 320 320" className="h-full w-full">
        <circle
          cx="160"
          cy="160"
          r="148"
          fill="none"
          stroke="rgba(56,189,248,0.14)"
          strokeWidth="1"
        />
        <motion.circle
          cx="160"
          cy="160"
          r="132"
          fill="none"
          stroke="rgba(34,211,238,0.35)"
          strokeWidth="1.5"
          strokeDasharray="12 18"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 24, repeat: Infinity, ease: "linear" }
          }
          style={{ transformOrigin: "160px 160px" }}
        />
        <motion.circle
          cx="160"
          cy="160"
          r="118"
          fill="none"
          stroke="rgba(59,130,246,0.28)"
          strokeWidth="1"
          strokeDasharray="4 10"
          animate={reduceMotion ? undefined : { rotate: -360 }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 18, repeat: Infinity, ease: "linear" }
          }
          style={{ transformOrigin: "160px 160px" }}
        />
        <motion.circle
          cx="160"
          cy="160"
          r="100"
          fill="none"
          stroke="rgba(125,211,252,0.42)"
          strokeWidth="2"
          strokeDasharray="80 200"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 8, repeat: Infinity, ease: "linear" }
          }
          style={{ transformOrigin: "160px 160px" }}
        />
      </svg>
    </div>
  );
}

function JarvisBackdrop({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="iq-jarvis-grid absolute inset-0" />
      <div className="iq-jarvis-glow absolute inset-0" />
      {HUD_PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-cyan-200/70"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity
          }}
          animate={
            reduceMotion
              ? undefined
              : { opacity: [p.opacity * 0.4, p.opacity, p.opacity * 0.4], y: [0, -4, 0] }
          }
          transition={
            reduceMotion
              ? undefined
              : { duration: p.dur, repeat: Infinity, ease: "easeInOut", delay: p.delay }
          }
        />
      ))}
    </div>
  );
}

/** Standalone Jarvis-style AI briefing preview (not wired to onboarding). */
export function SchoolsJarvisAiBriefingScreen() {
  const reduceMotion = useReducedMotion();
  const [runId, setRunId] = useState(0);
  const [screenPhase, setScreenPhase] = useState<"briefing" | "finale">("briefing");
  const [hudExiting, setHudExiting] = useState(false);
  const finaleTimerRef = useRef<number | null>(null);

  const queue = useMemo(() => buildJarvisBriefQueue(JARVIS_BRIEF_SEGMENTS), []);
  const soundEnabled = screenPhase === "briefing" && !reduceMotion;

  const {
    segmentLines,
    currentLine,
    displayText,
    isTyping,
    showCurrentLine,
    scanProgress,
    scanVisible,
    done,
    revealCurrent,
    skipToEnd,
    reset
  } = useJarvisBriefScript(queue, screenPhase === "briefing", !!reduceMotion, soundEnabled);

  const handleReplay = useCallback(() => {
    if (finaleTimerRef.current != null) {
      window.clearTimeout(finaleTimerRef.current);
      finaleTimerRef.current = null;
    }
    setHudExiting(false);
    setScreenPhase("briefing");
    reset();
    setRunId((id) => id + 1);
    primeMissionBriefAudio();
  }, [reset]);

  const handleSkip = useCallback(() => {
    skipToEnd();
  }, [skipToEnd]);

  useEffect(() => {
    if (!done || screenPhase !== "briefing") return;

    setHudExiting(true);
    finaleTimerRef.current = window.setTimeout(() => {
      setScreenPhase("finale");
      setHudExiting(false);
    }, reduceMotion ? 0 : JARVIS_BRIEF_FINALE_FADE_MS);

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
      className="iq-jarvis-screen relative h-[100dvh] w-full overflow-hidden bg-[#03060c]"
      aria-label="Jarvis AI briefing preview"
    >
      <JarvisBackdrop reduceMotion={reduceMotion} />

      <div className="pointer-events-none absolute inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-30 flex justify-between px-4">
        <button type="button" onClick={handleReplay} className="iq-jarvis-ctrl pointer-events-auto">
          Replay
        </button>
        {screenPhase === "briefing" ? (
          <button type="button" onClick={handleSkip} className="iq-jarvis-ctrl pointer-events-auto">
            Skip
          </button>
        ) : (
          <span aria-hidden className="w-[4.5rem]" />
        )}
      </div>

      <AnimatePresence mode="wait">
        {screenPhase === "briefing" ? (
          <motion.button
            key="briefing"
            type="button"
            aria-label="Reveal current briefing beat"
            initial={{ opacity: 1 }}
            animate={{ opacity: hudExiting ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: JARVIS_BRIEF_FINALE_FADE_MS / 1000, ease: EASE_OUT }}
            onClick={revealCurrent}
            className="pointer-events-auto absolute inset-0 z-10 flex items-center justify-center px-4 py-16"
          >
            <div className="iq-jarvis-hud-shell relative flex h-[min(72vw,22rem)] w-[min(72vw,22rem)] items-center justify-center sm:h-[min(52vh,24rem)] sm:w-[min(52vh,24rem)]">
              <JarvisScanHud reduceMotion={reduceMotion} />

              <div className="iq-jarvis-hud-core relative z-[1] flex max-h-[62%] w-[78%] flex-col items-center justify-center text-center">
                <div aria-live="polite" className="w-full space-y-2.5">
                  {segmentLines.map((line) => (
                    <p key={line.id} className={lineClass(line.variant)}>
                      {line.text}
                    </p>
                  ))}

                  {showCurrentLine && currentLine ? (
                    <p className={lineClass(currentLine.variant)}>
                      {displayText}
                      {isTyping ? (
                        <span className="iq-jarvis-cursor" aria-hidden>
                          |
                        </span>
                      ) : null}
                    </p>
                  ) : null}
                </div>

                {scanVisible ? (
                  <div className="iq-jarvis-scan mt-5 w-full">
                    <div className="iq-jarvis-scan-track">
                      <motion.div
                        className="iq-jarvis-scan-fill"
                        initial={false}
                        animate={{ width: `${scanProgress}%` }}
                        transition={{ duration: 0.12, ease: "linear" }}
                      />
                    </div>
                    <p className="iq-jarvis-scan-label mt-1.5">
                      SCAN {scanProgress.toString().padStart(3, "0")}%
                    </p>
                  </div>
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
              className="iq-jarvis-finale-title font-[var(--font-grotesk)]"
            >
              {JARVIS_BRIEF_FINALE.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.48, ease: EASE_OUT, delay: 0.24 }}
              className="iq-jarvis-finale-tagline mt-3 font-[var(--font-grotesk)]"
            >
              {JARVIS_BRIEF_FINALE.tagline}
            </motion.p>

            <motion.button
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.42 }}
              className="iq-jarvis-finale-cta mt-10 font-[var(--font-grotesk)]"
              onClick={() => {
                /* Standalone preview — no onboarding hookup yet. */
              }}
            >
              {JARVIS_BRIEF_FINALE.cta}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
