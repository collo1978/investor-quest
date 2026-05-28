"use client";

/**
 * Premium pillar quest card — Q/A + mark-as-read layout (React/CSS).
 * Business = gold/violet; Forces = storm red/orange; Financials = emerald;
 * Management = executive violet.
 */

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import {
  getPillarQuestTheme,
  type PillarQuestTheme
} from "@/components/quest/pillarQuestTheme";
import type { PillarId } from "@/data/pillars";

function outerRimGradient(theme: PillarQuestTheme): string {
  if (theme.cardChrome === "neon") {
    return theme.hi;
  }
  return `linear-gradient(135deg, ${theme.rim}, ${theme.hi} 28%, ${theme.whyHi} 48%, ${theme.lo} 78%, ${theme.rim})`;
}

function progressBarGradient(theme: PillarQuestTheme): string {
  if (theme.cardChrome === "neon") {
    const light = theme.light ?? theme.hi;
    return `linear-gradient(90deg, ${theme.hi}, ${light})`;
  }
  return `linear-gradient(90deg, ${theme.hi}, ${theme.whyHi}, ${theme.lo})`;
}

export type PillarQuestTemplateFrameProps = {
  pillarId: PillarId;
  questionText: string;
  answerSlot: ReactNode;
  companyName: string;
  cardIndex: number;
  cardTotal: number;
  footerSlot: ReactNode;
  trailSlot?: ReactNode;
};

/** @deprecated Use {@link PillarQuestTemplateFrame} */
export type BusinessQuestTemplateFrameProps = PillarQuestTemplateFrameProps;

function HeaderCompanyName({ name, theme }: { name: string; theme: PillarQuestTheme }) {
  const label = name.trim();
  if (!label) return null;
  return (
    <span
      className="max-w-[52%] truncate text-right font-[var(--font-grotesk)] text-[12px] font-semibold tracking-tight text-ink-0 sm:max-w-none sm:text-[13px]"
      style={{ textShadow: `0 0 20px ${theme.glow}` }}
      title={label}
    >
      {label}
    </span>
  );
}

function CircleBadge({
  label,
  theme,
  className = ""
}: {
  label: string;
  theme: PillarQuestTheme;
  className?: string;
}) {
  return (
    <motion.div
      aria-hidden
      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full sm:h-20 sm:w-20 md:h-[4.75rem] md:w-[4.75rem] ${className}`}
      style={{
        background:
          theme.cardChrome === "neon"
            ? theme.hi
            : `linear-gradient(155deg, ${theme.rim} 0%, ${theme.hi} 38%, ${theme.lo} 100%)`,
        boxShadow:
          theme.cardChrome === "neon"
            ? `0 0 0 1.5px ${theme.light ?? theme.hi}, 0 0 28px -2px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,0.35)`
            : `0 0 0 1.5px ${theme.rim}, 0 0 28px -2px ${theme.glow}, 0 0 14px ${theme.glow}, inset 0 2px 0 rgba(255,255,255,0.48), inset 0 -3px 10px rgba(0,0,0,0.28)`,
        color: theme.badgeText
      }}
    >
      <span className="font-[var(--font-grotesk)] text-[1.28rem] font-bold uppercase tracking-[0.08em] sm:text-[1.45rem] md:text-[1.7rem] md:tracking-[0.06em]">
        {label}
      </span>
    </motion.div>
  );
}

export function PillarQuestTemplateFrame({
  pillarId,
  questionText,
  answerSlot,
  companyName,
  cardIndex,
  cardTotal,
  footerSlot,
  trailSlot
}: PillarQuestTemplateFrameProps) {
  const theme = getPillarQuestTheme(pillarId);
  const isNeon = theme.cardChrome === "neon";
  const pct = Math.min(100, (cardIndex / Math.max(1, cardTotal)) * 100);
  const pulsePeakBorder = isNeon ? theme.hi : theme.rim;
  const pulsePeakGlow = isNeon ? theme.glow : theme.whyGlow;

  return (
    <motion.div className="relative mx-auto w-full max-w-2xl">
      <motion.div
        initial={false}
        animate={
          isNeon
            ? false
            : {
                boxShadow: [
                  `0 22px 64px -36px rgba(0,0,0,0.72), 0 0 0 2px ${theme.border}, 0 0 48px -14px ${theme.glow}, 0 0 80px -24px ${theme.glow}`,
                  `0 28px 76px -32px rgba(0,0,0,0.78), 0 0 0 2px ${pulsePeakBorder}, 0 0 64px -10px ${theme.glow}, 0 0 96px -20px ${pulsePeakGlow}`,
                  `0 22px 64px -36px rgba(0,0,0,0.72), 0 0 0 2px ${theme.border}, 0 0 48px -14px ${theme.glow}, 0 0 80px -24px ${theme.glow}`
                ]
              }
        }
        transition={isNeon ? undefined : { duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        className={
          isNeon
            ? "relative flex flex-col overflow-visible rounded-[1.35rem] border-2 bg-[rgba(6,6,12,0.97)] backdrop-blur-xl"
            : "relative rounded-[1.35rem] p-[2px]"
        }
        style={
          isNeon
            ? {
                borderColor: theme.hi,
                boxShadow: `0 0 0 1px ${theme.border}, 0 0 28px -4px ${theme.glow}, 0 0 0 1.5px ${theme.hi}`
              }
            : {
                background: outerRimGradient(theme),
                boxShadow: `0 0 40px -8px ${theme.glow}`
              }
        }
      >
        <motion.div
          className={
            isNeon
              ? "relative flex flex-col overflow-visible"
              : "relative flex flex-col overflow-visible rounded-[1.22rem] border-2 border-white/[0.14] bg-[rgba(6,6,12,0.97)] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-20px_40px_-24px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          }
          style={
            isNeon
              ? undefined
              : {
                  borderTopColor: theme.rim,
                  borderLeftColor: theme.border,
                  borderRightColor: theme.border,
                  borderBottomColor: theme.borderSoft,
                  boxShadow: `0 0 0 1px ${theme.borderSoft}, 0 0 36px -12px ${theme.glow}, inset 0 0 60px -40px ${theme.whyGlow}`
                }
          }
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: isNeon
                ? `radial-gradient(100% 55% at 50% -8%, ${theme.glowSoft}, transparent 52%)`
                : `radial-gradient(100% 55% at 50% -8%, ${theme.glowSoft}, transparent 52%), radial-gradient(90% 50% at 100% 30%, ${theme.whyWash}, transparent 48%), radial-gradient(80% 45% at 0% 85%, ${theme.glowSoft}, transparent 45%)`
            }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)",
              backgroundSize: "20px 20px"
            }}
          />

          <header
            className="relative z-[1] shrink-0 border-b-2 px-4 py-3.5 sm:px-5 sm:py-4"
            style={{ borderColor: theme.borderSoft }}
          >
            <motion.div className="flex min-h-[2.25rem] items-center justify-between gap-3 sm:min-h-[2.5rem]">
              <p
                className="shrink-0 text-[10px] font-bold uppercase tracking-[0.28em]"
                style={{ color: theme.hi }}
              >
                Card {cardIndex} of {cardTotal}
              </p>
              <div className="flex shrink-0 items-center justify-end gap-2">
                {trailSlot}
                <HeaderCompanyName name={companyName} theme={theme} />
              </div>
            </motion.div>
            <motion.div
              className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-black/55 ring-2 ring-offset-0"
              style={{ boxShadow: `0 0 0 2px ${theme.borderSoft}` }}
              role="presentation"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.85, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background: progressBarGradient(theme),
                  boxShadow: `0 0 18px ${theme.glow}, 0 0 8px rgba(255,255,255,0.25)`
                }}
              />
            </motion.div>
          </header>

          <section
            className="relative z-[1] shrink-0 border-b-2 px-4 py-4 sm:px-5 sm:py-5"
            style={{ borderColor: theme.borderSoft }}
          >
            <h2 className="sr-only">Question</h2>
            <motion.div className="flex gap-4 sm:gap-6">
              <CircleBadge label="Q" theme={theme} />
              <motion.div className="min-w-0 flex-1 pt-0.5">
                <p className="text-balance font-[var(--font-grotesk)] text-[clamp(1.05rem,3vw,1.45rem)] font-semibold leading-snug tracking-tight text-ink-0 sm:text-[clamp(1.1rem,2.6vw,1.55rem)]">
                  {questionText}
                </p>
              </motion.div>
            </motion.div>
          </section>

          <section className="relative z-[1]">
            <h2 className="sr-only">Answer</h2>
            <motion.div className="flex gap-4 px-4 py-4 sm:gap-5 sm:px-5 sm:py-5">
              <CircleBadge label="A" theme={theme} className="mt-0.5 shrink-0" />
              <motion.div className="min-w-0 flex-1">{answerSlot}</motion.div>
            </motion.div>
          </section>

          <footer
            className="relative z-[1] shrink-0 border-t-2 bg-black/30 px-4 py-3.5 sm:px-5 sm:py-4"
            style={{ borderColor: theme.border }}
          >
            <motion.div className="flex flex-wrap items-center gap-3">{footerSlot}</motion.div>
          </footer>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export const BusinessQuestTemplateFrame = PillarQuestTemplateFrame;

export const BUSINESS_QUEST_TEMPLATE_SRC = "/screens/business-quest-template.webp";
