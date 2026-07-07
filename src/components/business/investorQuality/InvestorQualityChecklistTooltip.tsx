"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { resolveChecklistItem } from "@/lib/business/investorQualityChecklist";
import type { InvestorQualityChecklistItemId } from "@/lib/business/investorQualityChecklist";

type Props = {
  itemId: InvestorQualityChecklistItemId;
  /** Row contents — tooltip trigger is the whole row (`li` or inner `div`). */
  children?: ReactNode;
  className?: string;
  /** Standalone info affordance (rating screen). */
  variant?: "row" | "icon" | "hint";
  /** Row wrapper tag when nested inside an existing list item. */
  triggerElement?: "li" | "div";
};

function InfoIcon() {
  return (
    <svg
      className="iq-investor-quality-tooltip__svg"
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

/** Visible ? affordance — row hover/focus still opens the explanation. */
export function ChecklistItemHintIcon({ className }: { className?: string }) {
  return (
    <span
      className={["iq-investor-quality-row-hint", className].filter(Boolean).join(" ")}
      aria-hidden
    >
      ?
    </span>
  );
}

/** Plain-English tooltip for a checklist principle — portaled so it is not clipped. */
export function InvestorQualityChecklistTooltip({
  itemId,
  children,
  className,
  variant = children ? "row" : "icon",
  triggerElement = "li"
}: Props) {
  const item = resolveChecklistItem(itemId);
  const tooltipId = useId();
  const triggerRef = useRef<HTMLLIElement | HTMLDivElement | HTMLSpanElement | null>(
    null
  );

  const setTriggerRef = useCallback(
    (node: HTMLLIElement | HTMLDivElement | HTMLSpanElement | null) => {
      triggerRef.current = node;
    },
    []
  );
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const panelWidth = Math.min(260, window.innerWidth * 0.78);
    const gap = 10;
    let left = rect.right + gap;
    if (left + panelWidth > window.innerWidth - 12) {
      left = Math.max(12, rect.left - panelWidth - gap);
    }
    setPosition({
      top: rect.top + rect.height / 2,
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

  const isRow = variant === "row" && children;
  const isHint = variant === "hint";
  const TriggerTag = isRow ? triggerElement : isHint ? "button" : "span";

  if (isHint) {
    return (
      <>
        <button
          ref={setTriggerRef as (node: HTMLButtonElement | null) => void}
          type="button"
          className={[
            "iq-investor-quality-tooltip",
            "iq-investor-quality-tooltip--hint",
            className
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label={`About ${item.label}`}
          aria-describedby={open ? tooltipId : undefined}
          aria-expanded={open}
          onClick={(event) => {
            event.stopPropagation();
            if (open) hide();
            else show();
          }}
          onMouseEnter={show}
          onMouseLeave={hide}
          onFocus={show}
          onBlur={hide}
        >
          <ChecklistItemHintIcon className="iq-investor-quality-row-hint--quest-panel" />
        </button>

        {mounted && open && position
          ? createPortal(
              <div
                id={tooltipId}
                role="tooltip"
                className="iq-investor-quality-tooltip__panel iq-investor-quality-tooltip__panel--fixed"
                style={{
                  top: position.top,
                  left: position.left
                }}
              >
                <span className="iq-investor-quality-tooltip__why">
                  <strong>Why it matters:</strong> {item.tooltipWhy}
                </span>
              </div>,
              document.body
            )
          : null}
      </>
    );
  }

  return (
    <>
      <TriggerTag
        ref={setTriggerRef}
        className={[
          isRow ? className : "",
          "iq-investor-quality-tooltip",
          isRow ? "iq-investor-quality-tooltip--row" : "iq-investor-quality-tooltip--icon"
        ]
          .filter(Boolean)
          .join(" ")}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        tabIndex={isRow ? 0 : undefined}
        aria-describedby={open ? tooltipId : undefined}
      >
        {isRow ? (
          children
        ) : (
          <button
            type="button"
            className="iq-investor-quality-tooltip__trigger"
            aria-label={`About ${item.label}`}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
              updatePosition();
            }}
          >
            <InfoIcon />
          </button>
        )}
      </TriggerTag>

      {mounted && open && position
        ? createPortal(
            <div
              id={tooltipId}
              role="tooltip"
              className="iq-investor-quality-tooltip__panel iq-investor-quality-tooltip__panel--fixed"
              style={{
                top: position.top,
                left: position.left
              }}
            >
              <span className="iq-investor-quality-tooltip__why">
                <strong>Why it matters:</strong> {item.tooltipWhy}
              </span>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
