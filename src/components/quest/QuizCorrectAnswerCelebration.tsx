"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  /** Unique per correct-answer moment — retriggers the XP pop. */
  triggerKey: string;
  xp?: number;
};

/** Floating +XP badge for a correct quiz answer (confetti fires separately). */
export function QuizCorrectAnswerCelebration({ triggerKey, xp }: Props) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 2400);
    return () => window.clearTimeout(timer);
  }, [triggerKey]);

  if (!mounted || !visible || xp == null || xp <= 0) return null;

  return createPortal(
    <motion.div
      aria-live="polite"
      aria-label={`Plus ${xp} experience points`}
      className="pointer-events-none fixed left-1/2 top-[20%] z-[10001] -translate-x-1/2"
      key={triggerKey}
      initial={{ opacity: 0, scale: 0.4, y: 24, rotate: -10 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0.4, 1.16, 1, 0.92],
        y: [24, -8, -4, -32],
        rotate: [-10, 6, 0, 0]
      }}
      transition={{
        duration: 1.85,
        times: [0, 0.28, 0.62, 1],
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      <div className="flex flex-col items-center rounded-full border-2 border-[rgba(245,197,71,0.62)] bg-[rgba(7,7,18,0.9)] px-7 py-3.5 shadow-[0_0_42px_rgba(245,197,71,0.38)] backdrop-blur-md">
        <span className="font-[var(--font-grotesk)] text-[clamp(2rem,6vw,2.75rem)] font-black tabular-nums text-[#F5C547]">
          +{xp}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#F5C547]/90">
          XP
        </span>
      </div>
    </motion.div>,
    document.body
  );
}
