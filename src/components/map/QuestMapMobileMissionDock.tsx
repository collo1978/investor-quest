"use client";

import { motion } from "framer-motion";

type Props = {
  objectiveTitle: string;
  hint: string;
};

/**
 * @deprecated Mission dock removed from bank map — kept for optional reuse.
 */
export function QuestMapMobileMissionDock({ objectiveTitle, hint }: Props) {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[30] flex justify-center px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="w-full max-w-[min(92vw,18.5rem)] rounded-xl border border-[rgba(245,197,71,0.32)] bg-[rgba(6,5,14,0.82)] px-3 py-2 backdrop-blur-md">
        <p className="truncate font-[var(--font-grotesk)] text-[11px] font-bold text-white">
          {objectiveTitle}
        </p>
        <p className="mt-0.5 truncate text-[10px] text-ink-2">{hint}</p>
      </div>
    </motion.footer>
  );
}
