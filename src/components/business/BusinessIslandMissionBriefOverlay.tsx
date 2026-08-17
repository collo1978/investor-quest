"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const HUB_DIM_SCRIM = "rgba(0, 0, 0, 0.55)";

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

      <div className="relative z-10 w-[calc(100%-2.5rem)] max-w-xl rounded-3xl border border-amber-300/40 bg-slate-950/95 px-7 py-9 text-center text-white shadow-2xl sm:px-12 sm:py-12">
        <h2
          id="business-island-brief-title"
          className="text-2xl font-black tracking-wide text-amber-300 sm:text-3xl"
        >
          WELCOME TO BUSINESS ISLAND
        </h2>
        <p className="mt-6 text-base font-bold leading-relaxed sm:text-lg">
          You’re about to explore the Business section of NVIDIA’s 10-K Annual Report.
        </p>
        <p className="mt-3 text-base font-bold leading-relaxed sm:text-lg">
          It’s over 5,000 words long. We’ve extracted only what matters.
        </p>
        <p className="mt-8 text-sm font-black tracking-[0.18em] text-amber-300">
          YOUR MISSION
        </p>
        <p className="mt-3 text-base font-bold leading-relaxed sm:text-lg">
          Complete the checklist to understand NVIDIA’s business like a pro.
        </p>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="iq-mission-brief-cta relative z-10 mt-5 w-full max-w-sm shrink-0"
      >
        ▶ ENTER BUSINESS ISLAND
      </button>
    </div>,
    document.body
  );
}
