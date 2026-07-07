"use client";

import { motion, useReducedMotion } from "framer-motion";

import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import { MARK_AS_READ_LABEL } from "@/lib/quests/gameActionCopy";

/** Mark-as-read CTA — matches quest card footer on schools mission cards. */
export function InvestorEvidenceMarkAsReadButton({
  theme,
  onClick
}: {
  theme: PillarQuestTheme;
  onClick: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const isMission = theme.cardChrome === "mission";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label="Mark this evidence as read"
      whileHover={reduceMotion ? undefined : { y: -1 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      className={
        isMission
          ? "iq-schools-mission-cta group relative inline-flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-black uppercase tracking-[0.08em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/75"
          : "group relative inline-flex items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-[13.5px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/75"
      }
      style={
        isMission
          ? { cursor: "pointer" }
          : {
              borderColor: theme.border,
              background: theme.glowSoft,
              color: theme.hi,
              cursor: "pointer",
              boxShadow: `0 0 24px -10px ${theme.glow}`
            }
      }
    >
      <span
        aria-hidden
        className="flex h-5 w-5 items-center justify-center rounded-md border text-[11px]"
        style={
          isMission
            ? {
                borderColor: "rgba(180, 83, 9, 0.35)",
                background: "rgba(255, 255, 255, 0.55)",
                color: "#92400e"
              }
            : {
                borderColor: theme.borderSoft,
                background: "rgba(255,255,255,0.06)",
                color: theme.hi
              }
        }
      >
        ✓
      </span>
      {MARK_AS_READ_LABEL}
    </motion.button>
  );
}
