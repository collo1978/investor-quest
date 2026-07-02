"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { SchoolsTypedMissionBriefPanel } from "@/components/schools/SchoolsTypedMissionBriefPanel";
import { SCHOOLS_ENVELOPE_MISSION_BRIEF_STEPS } from "@/lib/schools/schoolsMissionBriefContent";

const OPEN_MS = 980;

type MissionEnvelopeTriggerProps = {
  label?: string;
  onOpen: () => void;
};

type MissionEnvelopeBriefSequenceProps = {
  open: boolean;
  title: string;
  onStartQuest: () => void;
};

function useModalScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active || typeof document === "undefined") return;

    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyTop = body.style.top;
    const prevBodyLeft = body.style.left;
    const prevBodyRight = body.style.right;
    const prevBodyWidth = body.style.width;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.position = prevBodyPosition;
      body.style.top = prevBodyTop;
      body.style.left = prevBodyLeft;
      body.style.right = prevBodyRight;
      body.style.width = prevBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}

function EnvelopeArt({ opened = false, label }: { opened?: boolean; label?: string }) {
  return (
    <span className="iq-mission-envelope" aria-hidden>
      <span className="iq-mission-envelope__back" />
      <span className="iq-mission-envelope__letter" />
      <motion.span
        className="iq-mission-envelope__flap"
        animate={opened ? { rotateX: -142, y: -4 } : { rotateX: 0, y: 0 }}
        transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
      />
      <span className="iq-mission-envelope__front" />
      {label ? <span className="iq-mission-envelope__text">{label}</span> : null}
      <motion.span
        className="iq-mission-envelope__seal"
        animate={
          opened
            ? { scale: [1, 1.28, 0.18], opacity: [1, 1, 0], rotate: [0, -8, 18] }
            : { scale: [1, 1.06, 1], opacity: 1 }
        }
        transition={
          opened
            ? { duration: 0.52, ease: [0.22, 1, 0.36, 1] }
            : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
        }
      />
    </span>
  );
}

function Sparkles() {
  return (
    <span className="iq-mission-envelope-sparkles" aria-hidden>
      {Array.from({ length: 10 }).map((_, index) => (
        <span key={index} className={`iq-mission-envelope-sparkle iq-mission-envelope-sparkle--${index + 1}`} />
      ))}
    </span>
  );
}

export function MissionEnvelopeTrigger({
  label = "Your mission",
  onOpen
}: MissionEnvelopeTriggerProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      className="iq-mission-envelope-trigger"
      aria-label="Open Mission Brief"
      onClick={onOpen}
      animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
      transition={reduceMotion ? undefined : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      whileHover={reduceMotion ? undefined : { y: -8, scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
    >
      <Sparkles />
      <EnvelopeArt label={label} />
    </motion.button>
  );
}

export function MissionEnvelopeBriefSequence({
  open,
  title,
  onStartQuest
}: MissionEnvelopeBriefSequenceProps) {
  const reduceMotion = useReducedMotion();
  const [briefOpen, setBriefOpen] = useState(false);

  useModalScrollLock(open);

  useEffect(() => {
    if (!open) {
      setBriefOpen(false);
      return;
    }

    if (reduceMotion) {
      setBriefOpen(true);
      return;
    }

    const id = window.setTimeout(() => setBriefOpen(true), OPEN_MS);
    return () => window.clearTimeout(id);
  }, [open, reduceMotion]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-envelope-brief-title"
      className="iq-mission-envelope-overlay pointer-events-auto fixed inset-0 z-[260] flex flex-col items-center justify-center overflow-hidden px-4 py-8 sm:px-6 sm:py-10"
    >
      <div className="iq-mission-envelope-overlay__dim pointer-events-none absolute inset-0" aria-hidden />
      <h2 id="mission-envelope-brief-title" className="sr-only">
        {title}
      </h2>

      <AnimatePresence mode="wait">
        {!briefOpen ? (
          <motion.div
            key="opening-envelope"
            className="iq-mission-envelope-open-stage relative z-10"
            initial={{ opacity: 0, y: 44, scale: 0.72 }}
            animate={{ opacity: 1, y: [44, -18, 0], scale: [0.72, 1.08, 1] }}
            exit={{ opacity: 0, y: -28, scale: 1.18 }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          >
            <Sparkles />
            <EnvelopeArt opened label="Your mission" />
            <span className="iq-mission-envelope-open-stage__label">Your mission</span>
          </motion.div>
        ) : (
          <motion.div
            key="mission-brief"
            className="relative z-10 flex w-full max-w-[min(92vw,32rem)] flex-col items-center"
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            <SchoolsTypedMissionBriefPanel
              steps={SCHOOLS_ENVELOPE_MISSION_BRIEF_STEPS}
              active={briefOpen}
              onFinalAction={onStartQuest}
              titleId="mission-envelope-brief-title"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}
