"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { ForcesChecklistPanel } from "@/components/forces/hub/ForcesChecklistPanel";
import { SchoolsDemoHubResetButton } from "@/components/schools/SchoolsDemoHubResetButton";
import type { CompanyId } from "@/data/companies";

type Props = {
  open: boolean;
  onClose: () => void;
  companyId: CompanyId;
};

/**
 * Full-size Risk Island Checklist — opens from the island academy sign.
 */
export function ForcesChecklistLadderSheet({ open, onClose, companyId }: Props) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="iq-schools-principles-ladder-sheet__backdrop pointer-events-auto"
            aria-label="Close Investor Checklist"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={onClose}
          />
          <motion.div
            className="iq-schools-principles-ladder-sheet iq-schools-principles-ladder-sheet--forces pointer-events-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Investor Checklist, Risk section"
            initial={reduceMotion ? false : { x: "-105%", opacity: 0.92 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-105%", opacity: 0.88 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="iq-schools-principles-ladder-sheet__chrome">
              <button
                type="button"
                className="iq-schools-principles-ladder-sheet__close"
                onClick={onClose}
                aria-label="Close checklist"
              >
                ×
              </button>
              <SchoolsDemoHubResetButton className="iq-schools-principles-ladder-sheet__reset" />
            </div>
            <ForcesChecklistPanel
              companyId={companyId}
              variant="schools"
              presentation="ladder"
            />
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
