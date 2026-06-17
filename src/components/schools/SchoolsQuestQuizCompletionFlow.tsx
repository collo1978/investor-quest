"use client";

import { motion } from "framer-motion";

import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import { BACK_TO_ISLAND_LABEL } from "@/lib/quests/gameActionCopy";
import {
  SCHOOLS_COMPLETION_HEADLINE,
  SCHOOLS_MENTOR_CLOSING
} from "@/lib/schools/schoolsQuestRewardFlow";

const GREEN_HI = "#22C58B";
const GREEN_BORDER = "rgba(34, 197, 139, 0.55)";

type Props = {
  rewardXp: number;
  prideLine: string;
  takeaways: readonly string[];
  accent: PillarQuestTheme;
  onBackToIsland: () => void;
};

/**
 * Schools post-quiz mentor screen — pride, recap, identity, XP.
 */
export function SchoolsQuestQuizCompletionFlow({
  rewardXp,
  prideLine,
  takeaways,
  accent,
  onBackToIsland
}: Props) {
  const bullets = takeaways.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto flex max-w-lg flex-col items-center px-2 py-4"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[14%] h-44 w-[min(100%,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(ellipse 90% 80% at 50% 50%, ${accent.glowSoft}, transparent 72%)`
        }}
      />

      <h2
        className="relative text-center font-[var(--font-grotesk)] text-[clamp(1.65rem,5vw,2rem)] font-bold uppercase leading-none tracking-[0.12em]"
        style={{ color: accent.hi }}
      >
        {SCHOOLS_COMPLETION_HEADLINE}
      </h2>

      <div className="relative mt-8 w-full space-y-6 text-left">
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="text-[16px] font-medium leading-relaxed text-ink-0"
        >
          {prideLine}
        </motion.p>

        <ul className="space-y-3">
          {bullets.map((line, index) => (
            <motion.li
              key={line}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.16 + index * 0.07, duration: 0.28 }}
              className="flex items-start gap-2.5 text-[15px] leading-snug text-ink-0"
            >
              <span aria-hidden className="mt-0.5 shrink-0 text-[14px]">
                ✅
              </span>
              <span>{line}</span>
            </motion.li>
          ))}
        </ul>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.32 }}
          className="space-y-2.5 border-t border-white/[0.08] pt-6"
        >
          {SCHOOLS_MENTOR_CLOSING.map((line, index) => (
            <p
              key={line}
              className={
                index === SCHOOLS_MENTOR_CLOSING.length - 1
                  ? "text-[15px] font-semibold leading-relaxed"
                  : "text-[14px] leading-relaxed text-ink-1"
              }
              style={
                index === SCHOOLS_MENTOR_CLOSING.length - 1
                  ? { color: accent.hi }
                  : undefined
              }
            >
              {line}
            </p>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.48, type: "spring", stiffness: 320, damping: 22 }}
        className="relative mt-9 inline-flex items-center rounded-full border px-6 py-2.5 text-[13px] font-bold uppercase tracking-[0.16em]"
        style={{
          borderColor: GREEN_BORDER,
          background: "rgba(34,197,139,0.12)",
          color: GREEN_HI,
          boxShadow: "0 0 28px rgba(34,197,139,0.32)"
        }}
      >
        +{rewardXp} XP earned
      </motion.div>

      <motion.button
        type="button"
        onClick={onBackToIsland}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.56, duration: 0.28 }}
        className="relative mt-9 w-full max-w-sm rounded-2xl border px-6 py-3.5 text-center text-[12px] font-semibold uppercase tracking-[0.18em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/75"
        style={{
          borderColor: accent.border,
          background: `color-mix(in srgb, ${accent.hi} 24%, transparent)`,
          color: accent.hi,
          boxShadow: `0 0 24px -10px ${accent.glow}`
        }}
      >
        {BACK_TO_ISLAND_LABEL}
      </motion.button>
    </motion.div>
  );
}
