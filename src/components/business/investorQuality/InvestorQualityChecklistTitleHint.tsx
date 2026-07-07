"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export const INVESTOR_QUALITY_CHECKLIST_INTRO =
  "The criteria great investors use to judge the quality of a stock before investing.";

type Props = {
  title?: string;
  className?: string;
  titleClassName?: string;
  /** Prevent parent card/button from receiving icon taps (compact hub chip). */
  isolateIconClicks?: boolean;
};

/**
 * “Investor Quality Checklist” title with ? — hover on desktop, tap on mobile.
 */
export function InvestorQualityChecklistTitleHint({
  title = "Investor Quality Checklist",
  className,
  titleClassName,
  isolateIconClicks = false
}: Props) {
  const tooltipId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const [canHover, setCanHover] = useState(false);

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
    const panelWidth = Math.min(280, window.innerWidth - 24);
    const gap = 8;
    let left = rect.left + rect.width / 2 - panelWidth / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - panelWidth - 12));
    const top = rect.bottom + gap;
    setPosition({ top, left });
  }, []);

  const show = useCallback(() => {
    updatePosition();
    setOpen(true);
  }, [updatePosition]);

  const hide = useCallback(() => {
    setOpen(false);
  }, []);

  const toggle = useCallback(() => {
    if (open) {
      hide();
      return;
    }
    show();
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
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      hide();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, hide]);

  const handleIconPointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (isolateIconClicks) event.stopPropagation();
    },
    [isolateIconClicks]
  );

  const handleIconClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isolateIconClicks) event.stopPropagation();
      if (!canHover) toggle();
    },
    [isolateIconClicks, canHover, toggle]
  );

  return (
    <>
      <span
        className={["iq-investor-quality-title-hint", className].filter(Boolean).join(" ")}
      >
        <span className={titleClassName}>{title}</span>
        <button
          ref={triggerRef}
          type="button"
          className="iq-investor-quality-title-hint__icon"
          aria-label="About the Investor Quality Checklist"
          aria-describedby={open ? tooltipId : undefined}
          aria-expanded={open}
          onMouseEnter={canHover ? show : undefined}
          onMouseLeave={canHover ? hide : undefined}
          onFocus={show}
          onBlur={hide}
          onPointerDown={handleIconPointerDown}
          onClick={handleIconClick}
        >
          ?
        </button>
      </span>

      {mounted && open && position
        ? createPortal(
            <div
              id={tooltipId}
              role="tooltip"
              className="iq-investor-quality-title-hint__panel"
              style={{
                top: position.top,
                left: position.left,
                width: Math.min(280, window.innerWidth - 24)
              }}
            >
              <strong>{INVESTOR_QUALITY_CHECKLIST_INTRO}</strong>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
