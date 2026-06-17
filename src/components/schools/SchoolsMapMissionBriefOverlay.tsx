"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";

import { SCHOOLS_MISSION_BRIEF_IMG_SRC } from "@/lib/schools/schoolsMapConfig";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;
const MAP_DIM_SCRIM = "rgba(0, 0, 0, 0.55)";

/** Intrinsic size of `public/logos/schools-mission-brief.png`. */
const BRIEF_IMG_W = 1024;
const BRIEF_IMG_H = 1536;

type Props = {
  open: boolean;
  onDismiss: () => void;
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
 * First-visit Schools map brief — sits on the map stage over the live map.
 * Canonical `/schools/map` only (not bank/broker `/map`).
 */
export function SchoolsMapMissionBriefOverlay({ open, onDismiss }: Props) {
  const reduceMotion = useReducedMotion();

  useModalScrollLock(open);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="schools-map-mission-brief-title"
      className="pointer-events-auto absolute inset-0 z-[200] flex items-center justify-center overflow-hidden rounded-3xl"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: MAP_DIM_SCRIM }}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
      />

      <motion.div
        className="relative z-10 flex max-h-full max-w-full flex-col items-center justify-center overflow-hidden px-4 py-4"
        initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={
          reduceMotion
            ? { duration: 0.2 }
            : { duration: 0.55, ease: EASE_OUT_EXPO, delay: 0.06 }
        }
      >
        <h2 id="schools-map-mission-brief-title" className="sr-only">
          Schools mission brief
        </h2>

        <img
          src={SCHOOLS_MISSION_BRIEF_IMG_SRC}
          alt="Your first quest mission brief"
          width={BRIEF_IMG_W}
          height={BRIEF_IMG_H}
          decoding="async"
          fetchPriority="high"
          className="block h-auto w-auto max-h-[75vh] max-w-[60vw] shrink object-contain object-center select-none drop-shadow-[0_16px_40px_rgba(0,0,0,0.42)]"
        />

        <button
          type="button"
          onClick={onDismiss}
          className={[
            "iq-schools-map-brief-cta mt-5 w-full max-w-sm shrink-0",
            "inline-flex min-h-[54px] items-center justify-center rounded-full px-8 py-3.5",
            "border-2 border-violet-300/45",
            "text-sm font-bold uppercase tracking-[0.14em]",
            "transition-[transform,box-shadow] duration-200 active:translate-y-[0.5px]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/50"
          ].join(" ")}
        >
          START QUEST
        </button>
      </motion.div>
    </div>
  );
}
