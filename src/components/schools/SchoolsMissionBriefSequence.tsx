"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { SchoolsTypedMissionBriefPanel } from "@/components/schools/SchoolsTypedMissionBriefPanel";
import { SCHOOLS_MISSION_BRIEF_STEPS } from "@/lib/schools/schoolsMissionBriefContent";
import { SCHOOLS_MISSION_BRIEF_FADE_MS } from "@/lib/schools/schoolsMapUnlockAnimation";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

type Props = {
  open: boolean;
  onDismiss: () => void;
  /** `map` = light scrim over quest map; `solid` = standalone preview backdrop. */
  overlayMode?: "map" | "solid";
  /** Dev preview — same UI, no flow assumptions */
  previewMode?: boolean;
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

/**
 * Schools map mission brief — multi-step typewriter quest briefing over the live quest map.
 */
export function SchoolsMissionBriefSequence({
  open,
  onDismiss,
  overlayMode = "map",
  previewMode = false
}: Props) {
  const reduceMotion = useReducedMotion();
  const [fadingOut, setFadingOut] = useState(false);
  const fadeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (open) setFadingOut(false);
  }, [open]);

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current != null) {
        window.clearTimeout(fadeTimerRef.current);
      }
    };
  }, []);

  useModalScrollLock(open);

  const handleFinalAction = useCallback(() => {
    setFadingOut(true);
    fadeTimerRef.current = window.setTimeout(() => {
      onDismiss();
    }, reduceMotion ? 0 : SCHOOLS_MISSION_BRIEF_FADE_MS);
  }, [onDismiss, reduceMotion]);

  if (!open) return null;

  const backdropClass =
    overlayMode === "map"
      ? "iq-schools-mission-brief-scrim"
      : "iq-schools-mission-brief-backdrop";

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="schools-mission-brief-title"
      initial={false}
      animate={{ opacity: fadingOut ? 0 : 1 }}
      transition={{ duration: SCHOOLS_MISSION_BRIEF_FADE_MS / 1000, ease: EASE_OUT }}
      className={`iq-schools-mission-brief-deck pointer-events-auto fixed inset-0 z-[200] flex flex-col overflow-hidden ${backdropClass}`}
    >
      <div className="iq-schools-mission-brief-content relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
        <SchoolsTypedMissionBriefPanel
          steps={SCHOOLS_MISSION_BRIEF_STEPS}
          active={open && !fadingOut}
          onFinalAction={handleFinalAction}
          previewMode={previewMode}
        />
      </div>
    </motion.div>
  );
}
