"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  /** Accessible name for the trigger button. */
  label: string;
  /** Tooltip body — plain copy, no prefix. */
  content: string;
  className?: string;
  /** Header rows use a circled info icon; section rows use ? */
  variant?: "info" | "question";
};

function InfoGlyph() {
  return (
    <svg
      className="iq-business-checklist-info-hint__svg"
      viewBox="0 0 16 16"
      width={14}
      height={14}
      aria-hidden
      focusable="false"
    >
      <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="8" cy="5.25" r="0.85" fill="currentColor" />
      <path
        d="M8 7.5v4.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Hover/tap info affordance — header intro or section reminder. */
export function BusinessChecklistInfoHint({
  label,
  content,
  className,
  variant = "info"
}: Props) {
  const tooltipId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null
  );
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setCanHover(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const panelWidth = Math.min(280, window.innerWidth * 0.82);
    const gap = 10;
    let left = rect.left + rect.width / 2 - panelWidth / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - panelWidth - 12));
    setPosition({
      top: rect.bottom + gap,
      left
    });
  }, []);

  const show = useCallback(() => {
    updatePosition();
    setOpen(true);
  }, [updatePosition]);

  const hide = useCallback(() => {
    setOpen(false);
  }, []);

  const toggle = useCallback(() => {
    if (open) hide();
    else show();
  }, [open, show, hide]);

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => updatePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open || canHover) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      hide();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, canHover, hide]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={[
          "iq-business-checklist-info-hint",
          variant === "question" ? "iq-business-checklist-info-hint--question" : "",
          className
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label={label}
        aria-describedby={open ? tooltipId : undefined}
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          if (!canHover) toggle();
        }}
        onMouseEnter={canHover ? show : undefined}
        onMouseLeave={canHover ? hide : undefined}
        onFocus={show}
        onBlur={hide}
      >
        {variant === "question" ? "?" : <InfoGlyph />}
      </button>

      {mounted && open && position
        ? createPortal(
            <div
              id={tooltipId}
              role="tooltip"
              className="iq-investor-quality-tooltip__panel iq-investor-quality-tooltip__panel--fixed iq-business-checklist-info-hint__panel"
              style={{
                top: position.top,
                left: position.left,
                width: Math.min(280, window.innerWidth * 0.82)
              }}
            >
              <p className="iq-business-checklist-info-hint__copy">{content}</p>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
