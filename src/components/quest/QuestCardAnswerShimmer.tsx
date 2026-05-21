"use client";

import { motion } from "framer-motion";

/** Shimmer placeholder while a quest card answer is generating. */
export function QuestCardAnswerShimmer({ label }: { label?: string }) {
  return (
    <div
      className="space-y-3 rounded-lg border border-white/[0.06] bg-black/20 px-3 py-4 sm:px-3.5"
      aria-busy="true"
      aria-label={label ?? "Generating answer"}
    >
      <div className="h-3 w-[88%] animate-pulse rounded bg-white/[0.08]" />
      <div className="h-3 w-[72%] animate-pulse rounded bg-white/[0.06]" />
      <div className="h-3 w-[64%] animate-pulse rounded bg-white/[0.05]" />
      <motion.div
        aria-hidden
        className="pointer-events-none mt-2 h-0.5 overflow-hidden rounded-full bg-white/[0.04]"
      >
        <motion.div
          className="h-full w-1/3 rounded-full bg-white/20"
          animate={{ x: ["-100%", "320%"] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
      <p className="text-[11px] text-ink-2/70">
        {label ?? "Drafting your plain-English answer…"}
      </p>
    </div>
  );
}
