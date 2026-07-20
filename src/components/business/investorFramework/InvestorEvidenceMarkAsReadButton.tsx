"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import { MARK_AS_READ_LABEL } from "@/lib/quests/gameActionCopy";

const GREEN_HI = "#22C58B";
const GREEN_BORDER = "rgba(34, 197, 139, 0.55)";

/** Mark-as-read CTA — matches quest card footer on schools mission cards. */
export function InvestorEvidenceMarkAsReadButton({
  theme,
  onClick,
  isRead = false,
  disabled = false,
  pending = false
}: {
  theme: PillarQuestTheme;
  onClick: () => void;
  isRead?: boolean;
  disabled?: boolean;
  /** True while advancing to the rating step — prevents double-tap during handoff. */
  pending?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const isMission = theme.cardChrome === "mission";
  const isInactive = disabled || pending;
  const showReadState = isRead || pending;
  const showReadLabel = !(isMission && showReadState);

  return (
    <motion.button
      type="button"
      onClick={isInactive ? undefined : onClick}
      disabled={isInactive}
      aria-pressed={showReadState}
      aria-label={
        showReadState
          ? pending
            ? "Marked as read"
            : "Card already marked as read"
          : "Mark this evidence as read"
      }
      whileHover={isInactive || reduceMotion ? undefined : { y: -1 }}
      whileTap={isInactive || reduceMotion ? undefined : { scale: 0.98 }}
      animate={
        isMission && showReadState
          ? {
              scale: pending ? [1, 1.04, 1] : 1,
              borderColor: GREEN_BORDER,
              background: "rgba(34,197,139,0.14)"
            }
          : { scale: 1 }
      }
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={
        isMission && !showReadState
          ? "iq-schools-mission-cta group relative inline-flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-black uppercase tracking-[0.08em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/75"
          : isMission && showReadState
            ? "group relative inline-flex items-center gap-2.5 rounded-full border-2 px-4 py-2.5 text-[12px] font-black uppercase tracking-[0.08em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/75"
            : "group relative inline-flex items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-[13.5px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/75"
      }
      style={
        isMission && !showReadState
          ? { cursor: isInactive ? "default" : "pointer" }
          : isMission && showReadState
            ? {
                borderColor: GREEN_BORDER,
                color: GREEN_HI,
                cursor: isInactive ? "default" : "pointer",
                boxShadow: "0 0 18px -6px rgba(34,197,139,0.45)"
              }
            : {
                borderColor: showReadState ? GREEN_BORDER : theme.border,
                background: showReadState
                  ? "rgba(34,197,139,0.10)"
                  : theme.glowSoft,
                color: showReadState ? GREEN_HI : theme.hi,
                cursor: isInactive ? "default" : "pointer",
                boxShadow: showReadState
                  ? "0 0 24px -10px rgba(34,197,139,0.55)"
                  : `0 0 24px -10px ${theme.glow}`
              }
      }
    >
      {!isMission || showReadState ? (
        <motion.span
          aria-hidden
          key={showReadState ? "read" : "unread"}
          initial={pending ? { scale: 0.6, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
          className="flex h-5 w-5 items-center justify-center rounded-md border text-[11px]"
          style={{
            borderColor: showReadState ? GREEN_BORDER : theme.borderSoft,
            background: showReadState
              ? "rgba(34,197,139,0.15)"
              : isMission
                ? "rgba(255, 255, 255, 0.55)"
                : "rgba(255,255,255,0.06)",
            color: showReadState ? GREEN_HI : isMission ? "#92400e" : theme.hi
          }}
        >
          ✓
        </motion.span>
      ) : null}
      {showReadLabel ? (
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={showReadState ? "read-label" : "mark-label"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22 }}
          >
            {MARK_AS_READ_LABEL}
          </motion.span>
        </AnimatePresence>
      ) : null}
    </motion.button>
  );
}
