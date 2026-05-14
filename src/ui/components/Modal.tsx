"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  /** "sheet" docks on the right; "center" overlays in the middle. */
  variant?: "sheet" | "center";
  /** ARIA label for the dialog. */
  label: string;
  /** Optional header content; if provided, replaces the default title row. */
  header?: React.ReactNode;
  /** Optional footer row pinned to the bottom of the modal. */
  footer?: React.ReactNode;
  children: React.ReactNode;
  /** Max width when in `center` variant. */
  maxWidth?: number;
};

/**
 * Reusable, accessible modal framework. Used by quest details, level-up
 * celebrations, badge reveals, and ad-hoc dialogs.
 *
 * - Closes on ESC and backdrop click.
 * - Locks body scroll while open.
 * - Visually consistent with the existing premium glass look (no redesign).
 */
export function Modal({
  open,
  onClose,
  variant = "sheet",
  label,
  header,
  footer,
  children,
  maxWidth = 920
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />

          {variant === "sheet" ? (
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label={label}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[520px] flex-col border-l border-panel-border bg-[rgba(7,7,18,0.92)] backdrop-blur-xl"
              initial={{ x: 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 24, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {header ? (
                <div className="border-b border-panel-border p-5">{header}</div>
              ) : null}
              <div className="flex-1 overflow-auto p-5">{children}</div>
              {footer ? (
                <div className="border-t border-panel-border p-5">{footer}</div>
              ) : null}
            </motion.aside>
          ) : (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={label}
              className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
              style={{ width: `min(${maxWidth}px, calc(100vw - 28px))` }}
              initial={{ opacity: 0, y: 18, scale: 0.98, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 10, scale: 0.98, filter: "blur(10px)" }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative overflow-hidden rounded-[28px] border border-[rgba(139,92,246,0.35)] bg-[rgba(7,7,18,0.92)] shadow-glow backdrop-blur-xl">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgba(139,92,246,0.16)] via-transparent to-[rgba(59,130,246,0.06)]" />
                <div className="relative flex flex-col">
                  {header ? (
                    <div className="border-b border-panel-border p-5">
                      {header}
                    </div>
                  ) : null}
                  <div className="max-h-[min(80vh,720px)] overflow-auto p-5">
                    {children}
                  </div>
                  {footer ? (
                    <div className="border-t border-panel-border p-5">
                      {footer}
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}
        </>
      ) : null}
    </AnimatePresence>
  );
}
