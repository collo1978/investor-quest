"use client";

import { motion, useReducedMotion } from "framer-motion";

import { NeonButton } from "@/components/NeonButton";

type Props = {
  onStartQuest: () => void;
};

/** Screen 2 CTAs — Duolingo-style bottom dock for Schools opening. */
export function SchoolsOpeningMasteryCTAs({ onStartQuest }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="iq-schools-opening-cta-dock relative z-30 w-full"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mx-auto flex w-full max-w-[22rem] flex-col gap-2.5">
        <NeonButton
          type="button"
          className={[
            "iq-schools-opening-cta-primary w-full",
            "min-h-[52px] rounded-full px-6 py-3.5",
            "text-xs font-black uppercase tracking-[0.22em]",
            "border-2 border-violet-300/45"
          ].join(" ")}
          onClick={onStartQuest}
        >
          START YOUR QUEST
        </NeonButton>
        <button
          type="button"
          aria-disabled="true"
          tabIndex={-1}
          className="iq-schools-opening-cta-secondary w-full"
        >
          I ALREADY HAVE AN ACCOUNT
        </button>
      </div>
    </motion.div>
  );
}
