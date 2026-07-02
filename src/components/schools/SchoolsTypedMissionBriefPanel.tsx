"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CompanyLogo } from "@/components/CompanyLogo";
import {
  SCHOOLS_MISSION_BRIEF_NVDA_LOGO,
  type SchoolsMissionBriefStep,
  type SchoolsMissionBriefTypeLine,
  type SchoolsMissionBriefTypeVariant
} from "@/lib/schools/schoolsMissionBriefContent";
import {
  playMissionBriefComplete,
  playMissionBriefKeystroke,
  playMissionBriefLineBreak,
  primeMissionBriefAudio,
  stopMissionBriefAudio
} from "@/lib/schools/missionBriefTypewriterSound";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const CHAR_MS = 42;
const LINE_PAUSE_MS = 340;
const START_DELAY_MS = 220;

function variantClass(variant: SchoolsMissionBriefTypeVariant): string {
  const base = "iq-schools-mission-type";
  switch (variant) {
    case "title":
      return `${base} iq-schools-mission-type--title`;
    case "intro":
      return `${base} iq-schools-mission-type--intro`;
    case "label-gold":
      return `${base} iq-schools-mission-type--label-gold`;
    case "label-violet":
      return `${base} iq-schools-mission-type--label-violet`;
    case "body-hero":
      return `${base} iq-schools-mission-type--body-hero`;
    case "body-reward":
      return `${base} iq-schools-mission-type--body-reward`;
    case "body":
    default:
      return `${base} iq-schools-mission-type--body`;
  }
}

type TypewriterSoundCallbacks = {
  onKeystroke?: (line: SchoolsMissionBriefTypeLine, charIndex: number) => void;
  onLineBreak?: (nextLine: SchoolsMissionBriefTypeLine) => void;
  onComplete?: () => void;
};

function useDigitalTypewriter(
  lines: readonly SchoolsMissionBriefTypeLine[],
  enabled: boolean,
  instant: boolean,
  sound?: TypewriterSoundCallbacks
) {
  const [lineIndex, setLineIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [complete, setComplete] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const skip = useCallback(() => {
    clearTimer();
    setSkipped(true);
    setComplete(true);
    setLineIndex(lines.length);
    setCharCount(0);
  }, [clearTimer, lines.length]);

  useEffect(() => {
    if (!enabled) return;

    clearTimer();
    setLineIndex(0);
    setCharCount(0);
    setComplete(false);
    setSkipped(false);

    if (instant) {
      setComplete(true);
      setLineIndex(lines.length);
      return;
    }

    let cancelled = false;

    const schedule = (fn: () => void, ms: number) => {
      timerRef.current = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    };

    let li = 0;
    let cc = 0;

    const tick = () => {
      if (cancelled) return;

      const current = lines[li];
      if (!current) {
        setLineIndex(lines.length);
        setComplete(true);
        return;
      }

      if (cc < current.text.length) {
        cc += 1;
        setLineIndex(li);
        setCharCount(cc);
        sound?.onKeystroke?.(current, cc);
        schedule(tick, CHAR_MS);
        return;
      }

      if (li + 1 >= lines.length) {
        setLineIndex(lines.length);
        setComplete(true);
        sound?.onComplete?.();
        return;
      }

      const nextLine = lines[li + 1];
      if (nextLine) sound?.onLineBreak?.(nextLine);
      li += 1;
      cc = 0;
      setLineIndex(li);
      setCharCount(0);
      schedule(tick, LINE_PAUSE_MS);
    };

    schedule(tick, START_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimer();
    };
  }, [enabled, instant, lines, clearTimer, sound]);

  const getDisplayText = (index: number): string => {
    const line = lines[index];
    if (!line) return "";
    if (complete || skipped || index < lineIndex) return line.text;
    if (index === lineIndex) return line.text.slice(0, charCount);
    return "";
  };

  const isTypingLine = (index: number) =>
    !complete && !skipped && index === lineIndex && charCount < (lines[index]?.text.length ?? 0);

  const lineStarted = (index: number) => complete || skipped || index <= lineIndex;

  return {
    complete: complete || skipped,
    skip,
    getDisplayText,
    isTypingLine,
    lineStarted
  };
}

type Props = {
  steps: readonly SchoolsMissionBriefStep[];
  active: boolean;
  onFinalAction: () => void;
  showStepDots?: boolean;
  titleId?: string;
  previewMode?: boolean;
  className?: string;
  onSkip?: () => void;
};

/** Multi-step typewriter mission brief card — shared by map overlay + envelope flow. */
export function SchoolsTypedMissionBriefPanel({
  steps,
  active,
  onFinalAction,
  showStepDots = true,
  titleId = "schools-mission-brief-title",
  previewMode = false,
  className = "",
  onSkip
}: Props) {
  const reduceMotion = useReducedMotion();
  const soundEnabled = active && !reduceMotion;
  const [stepIndex, setStepIndex] = useState(0);
  const [actionPending, setActionPending] = useState(false);

  const currentStep = steps[stepIndex] ?? steps[0];
  const isFinalStep = stepIndex >= steps.length - 1;
  const stepLines = currentStep.lines;

  useEffect(() => {
    if (active) {
      setStepIndex(0);
      setActionPending(false);
    }
  }, [active]);

  const typewriterSound = useMemo(
    (): TypewriterSoundCallbacks => ({
      onKeystroke: (line, charIndex) => {
        if (!soundEnabled) return;
        playMissionBriefKeystroke({ char: line.text.charAt(charIndex - 1) });
      },
      onLineBreak: (nextLine) => {
        if (soundEnabled && nextLine.sectionGap) playMissionBriefLineBreak();
      },
      onComplete: () => {
        if (soundEnabled) playMissionBriefComplete();
      }
    }),
    [soundEnabled]
  );

  const { complete, skip, getDisplayText, isTypingLine, lineStarted } = useDigitalTypewriter(
    stepLines,
    active,
    !!reduceMotion,
    typewriterSound
  );

  useEffect(() => {
    if (!active || reduceMotion) return;

    primeMissionBriefAudio();

    const resumeOnGesture = () => primeMissionBriefAudio();
    window.addEventListener("pointerdown", resumeOnGesture, { passive: true });
    window.addEventListener("keydown", resumeOnGesture);

    return () => {
      window.removeEventListener("pointerdown", resumeOnGesture);
      window.removeEventListener("keydown", resumeOnGesture);
      stopMissionBriefAudio();
    };
  }, [active, reduceMotion]);

  const advanceOrFinish = useCallback(() => {
    if (isFinalStep) {
      setActionPending(true);
      onFinalAction();
      return;
    }
    setStepIndex((index) => Math.min(index + 1, steps.length - 1));
  }, [isFinalStep, onFinalAction, steps.length]);

  const handleSkip = useCallback(() => {
    if (!complete) {
      skip();
      return;
    }
    if (onSkip) {
      onSkip();
      return;
    }
    advanceOrFinish();
  }, [advanceOrFinish, complete, onSkip, skip]);

  const handleCta = useCallback(() => {
    if (!complete || actionPending) return;
    advanceOrFinish();
  }, [actionPending, advanceOrFinish, complete]);

  if (!active) return null;

  return (
    <div className={["iq-schools-mission-brief-layout w-full", className].filter(Boolean).join(" ")}>
      <button
        type="button"
        onClick={handleSkip}
        className="fixed right-4 top-[max(0.75rem,env(safe-area-inset-top))] z-[220] rounded-full border border-white/12 bg-black/40 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-2 transition hover:border-white/25 hover:text-ink-0"
      >
        {complete ? (previewMode && isFinalStep ? "Close" : "Skip") : "Skip"}
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.32, ease: EASE_OUT }}
        className="w-full"
      >
        <div className="iq-schools-mission-card iq-schools-mission-brief-type relative overflow-hidden rounded-2xl border-2 p-5 md:p-7">
          <div className="relative z-[1] mb-3 flex justify-center opacity-75">
            <CompanyLogo
              src={SCHOOLS_MISSION_BRIEF_NVDA_LOGO}
              alt="NVIDIA"
              className="h-8 w-8 sm:h-9 sm:w-9"
            />
          </div>

          {showStepDots ? (
            <div
              className="iq-schools-mission-brief-step-dots relative z-[1] mb-4 flex justify-center gap-2"
              aria-hidden
            >
              {steps.map((step, index) => (
                <span
                  key={step.id}
                  className={[
                    "h-1.5 rounded-full transition-all duration-300",
                    index === stepIndex
                      ? "w-6 bg-amber-300/90"
                      : index < stepIndex
                        ? "w-1.5 bg-amber-300/45"
                        : "w-1.5 bg-white/20"
                  ].join(" ")}
                />
              ))}
            </div>
          ) : null}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
              className="iq-schools-mission-brief-body relative z-[1] text-left"
              aria-live="polite"
            >
              {stepLines.map((line, index) =>
                lineStarted(index) ? (
                  <div
                    key={line.id}
                    className={line.sectionGap ? "iq-schools-mission-section-gap" : undefined}
                  >
                    <p
                      id={line.id === stepLines[0]?.id ? titleId : undefined}
                      className={variantClass(line.variant)}
                    >
                      {getDisplayText(index)}
                      {isTypingLine(index) ? (
                        <span className="iq-schools-mission-cursor" aria-hidden>
                          |
                        </span>
                      ) : null}
                    </p>
                  </div>
                ) : null
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div
          initial={false}
          animate={
            complete
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : { opacity: 0, y: 12, filter: "blur(6px)" }
          }
          transition={{ duration: 0.4, ease: EASE_OUT }}
          className={complete ? "pointer-events-auto" : "pointer-events-none"}
        >
          <button
            type="button"
            onClick={handleCta}
            disabled={!complete || actionPending}
            tabIndex={complete ? 0 : -1}
            className={[
              "iq-schools-mission-brief-cta mt-5 w-full",
              "inline-flex min-h-[52px] items-center justify-center rounded-full px-6 py-3",
              "font-[var(--font-grotesk)] text-[11px] font-bold uppercase tracking-[0.18em] sm:text-xs sm:tracking-[0.2em]",
              "transition-[transform,box-shadow,opacity] duration-200 active:translate-y-[0.5px]",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/45",
              complete ? "opacity-100" : "opacity-0"
            ].join(" ")}
          >
            {currentStep.ctaLabel}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
