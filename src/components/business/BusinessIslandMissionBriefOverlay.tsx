"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { SCHOOLS_MISSION_BRIEF_IMG_SRC } from "@/lib/schools/schoolsMapConfig";

const HUB_DIM_SCRIM = "rgba(0, 0, 0, 0.55)";

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
 * First-visit Business Island brief — portaled over the live hub.
 * Neutral black dim only; no gradients, filters, or blend modes on the stack.
 */
export function BusinessIslandMissionBriefOverlay({ open, onDismiss }: Props) {
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useModalScrollLock(open && portalReady);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    document.body.classList.add("iq-business-mission-brief-open");
    return () => document.body.classList.remove("iq-business-mission-brief-open");
  }, [open]);

  if (!open || !portalReady) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="business-island-brief-title"
      className="iq-business-mission-brief-overlay pointer-events-auto fixed inset-0 z-50 flex flex-col items-center justify-center"
    >
      <div
        aria-hidden
        className="iq-business-mission-brief-dim pointer-events-none absolute inset-0"
        style={{ background: HUB_DIM_SCRIM }}
      />

      <h2 id="business-island-brief-title" className="sr-only">
        Business Island mission brief
      </h2>

      <img
        src={SCHOOLS_MISSION_BRIEF_IMG_SRC}
        alt="Your Business Island mission brief"
        width={BRIEF_IMG_W}
        height={BRIEF_IMG_H}
        decoding="async"
        fetchPriority="high"
        className="relative z-10 block h-auto w-auto max-h-[75vh] max-w-[60vw] shrink object-contain object-center select-none"
      />

      <button
        type="button"
        onClick={onDismiss}
        className="iq-mission-brief-cta relative z-10 mt-5 w-full max-w-sm shrink-0"
      >
        START MISSION
      </button>
    </div>,
    document.body
  );
}
