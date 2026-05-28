"use client";

import { motion } from "framer-motion";

import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import type { Company } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import {
  getInvestorMasteryContent,
  investorMasteryTitle
} from "@/lib/quests/investorMasteryCopy";
import { START_QUIZ_CTA } from "@/lib/quests/quizFlowCopy";

type Props = {
  company: Company;
  pillarId: PillarId;
  questSlug: string;
  questTitle: string;
  theme: PillarQuestTheme;
  cardsRead: number;
  cardsTotal: number;
  onContinue: () => void;
  onReviewCards?: () => void;
};

export function InvestorMasteryScreen({
  company,
  pillarId,
  questSlug,
  questTitle,
  theme,
  cardsRead,
  cardsTotal,
  onContinue,
  onReviewCards
}: Props) {
  const content = getInvestorMasteryContent({
    companyName: company.name,
    pillarId,
    questSlug,
    questTitle
  });
  const pct =
    cardsTotal > 0 ? Math.min(100, Math.round((cardsRead / cardsTotal) * 100)) : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className="mx-auto w-full max-w-2xl"
      role="region"
      aria-label={`${company.name} investor mastery`}
    >
      <div
        className="overflow-hidden rounded-[1.35rem] border-2 bg-[rgba(6,6,12,0.97)] backdrop-blur-xl"
        style={{
          borderColor: theme.border,
          boxShadow: `0 0 40px -8px ${theme.glow}`
        }}
      >
        <header
          className="border-b px-5 py-5 sm:px-6"
          style={{ borderColor: theme.borderSoft }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-[0.28em]"
            style={{ color: theme.hi }}
          >
            {content.kicker}
          </p>
          <h2 className="mt-2 font-[var(--font-grotesk)] text-[clamp(1.35rem,4vw,1.75rem)] font-semibold leading-tight text-ink-0">
            {investorMasteryTitle(company.name)}
          </h2>
          <p className="mt-1 text-[13px] text-ink-2">{questTitle}</p>
          <motion.div
            className="relative mt-4 h-2 overflow-hidden rounded-full bg-black/55"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Quest section progress"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.85, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${theme.hi}, ${theme.whyHi ?? theme.lo})`,
                boxShadow: `0 0 18px ${theme.glow}`
              }}
            />
          </motion.div>
        </header>

        <div className="px-5 py-6 sm:px-6 sm:py-7">
          <p className="text-pretty text-[15px] leading-relaxed text-ink-0/95 sm:text-[16px]">
            {content.message}
          </p>

          <motion.div
            className="mt-6 rounded-xl border px-4 py-4 sm:px-5 sm:py-5"
            style={{
              borderColor: theme.borderSoft,
              background: theme.glowSoft
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{ color: theme.hi }}
            >
              {content.learnedIntro}
            </p>
            <ul className="mt-3 space-y-2.5">
              {content.learned.map((item) => (
                <li
                  key={item}
                  className="flex gap-2.5 text-[13.5px] leading-snug text-ink-0/92 sm:text-[14px]"
                >
                  <span
                    aria-hidden
                    className="mt-0.5 shrink-0 text-emerald-400"
                  >
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[12.5px] leading-snug text-ink-2">
              {content.momentum}
            </p>
          </motion.div>

          <motion.div
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.button
              type="button"
              onClick={onContinue}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-full border px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.2em] sm:w-auto"
              style={{
                borderColor: theme.border,
                background: `linear-gradient(135deg, ${theme.glowSoft}, rgba(0,0,0,0.35))`,
                color: theme.hi,
                boxShadow: `0 0 28px -8px ${theme.glow}`
              }}
            >
              {START_QUIZ_CTA}
            </motion.button>
            {onReviewCards ? (
              <button
                type="button"
                onClick={onReviewCards}
                className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-2 transition hover:text-ink-0"
              >
                Review cards
              </button>
            ) : null}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
