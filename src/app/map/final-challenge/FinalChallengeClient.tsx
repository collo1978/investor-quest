"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { QuestQuizPanel } from "@/components/QuestQuizPanel";
import { useGame } from "@/components/GameProvider";
import { companyById } from "@/data/companies";
import { PILLAR_META, type PillarId } from "@/data/pillars";
import {
  TEN_K_ROOKIE_CHALLENGE_XP,
  TEN_K_ROOKIE_FINAL_QUIZ
} from "@/data/quests/tenKRookieFinalChallenge";
import { fillQuizConfigTokens } from "@/lib/quests/fillQuestTokens";
import {
  getTenKFinalChallengeGateRows,
  isTenKFinalChallengeUnlocked
} from "@/engine";
import { loadConvictionRecords } from "@/lib/conviction";

const GOLD_HI = "#F5C547";
const GOLD_BORDER = "rgba(245, 197, 71, 0.40)";
const GOLD_GLOW = "rgba(245, 197, 71, 0.45)";
const VIOLET_HI = "#C4B5FD";

const GOLD_BORDER_SOFT = "rgba(245, 197, 71, 0.22)";

export default function FinalChallengeClient() {
  const { raw, actions } = useGame();
  const company = companyById(raw.activeCompanyId);
  const prog = raw.companies[raw.activeCompanyId];
  const record = prog?.tenKRookieChallenge ?? null;
  const unlocked = isTenKFinalChallengeUnlocked(raw);
  const gate = getTenKFinalChallengeGateRows(raw);

  const [celebrateBadge, setCelebrateBadge] = useState(false);
  const hadRecordOnMount = useRef(record != null);

  useEffect(() => {
    hadRecordOnMount.current = record != null;
  }, [company.id, record]);

  useEffect(() => {
    if (!celebrateBadge) return;
    const t = window.setTimeout(() => setCelebrateBadge(false), 2400);
    return () => window.clearTimeout(t);
  }, [celebrateBadge]);

  const finalQuiz = useMemo(
    () => fillQuizConfigTokens(TEN_K_ROOKIE_FINAL_QUIZ, company),
    [company]
  );

  const convictionLines = useMemo(() => {
    const rows = loadConvictionRecords().filter(
      (r) => r.ticker === company.ticker
    );
    const byIsland = new Map<string, { confident: number; cautious: number }>();
    for (const r of rows) {
      const cur = byIsland.get(r.island) ?? { confident: 0, cautious: 0 };
      if (r.conviction === "confident") cur.confident += 1;
      else cur.cautious += 1;
      byIsland.set(r.island, cur);
    }
    return PILLAR_META.map((p) => {
      const c = byIsland.get(p.title);
      return {
        pillar: p.title,
        confident: c?.confident ?? 0,
        cautious: c?.cautious ?? 0
      };
    });
  }, [company.ticker]);

  const onPass = (result: { fraction: number }) => {
    actions.completeTenKRookieChallenge(result.fraction);
    if (!hadRecordOnMount.current) {
      hadRecordOnMount.current = true;
      setCelebrateBadge(true);
    }
  };

  if (!unlocked) {
    return (
      <main className="pointer-events-auto relative mx-auto max-w-lg px-5 py-14 md:px-6">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-ink-2">
          Final Challenge
        </p>
        <h1
          className="mt-2 font-[var(--font-grotesk)] text-2xl text-ink-0 md:text-3xl"
          style={{ textShadow: `0 0 42px ${GOLD_GLOW}` }}
        >
          Reactor sealed
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-1">
          Prove you understand the full company picture — Business, Forces,
          Financials, and Management — then claim your{" "}
          <span className="font-semibold text-ink-0">10-K Rookie Badge</span>.
          Finish each island path below first.
        </p>
        <ul className="mt-6 space-y-3">
          {PILLAR_META.map((meta) => {
            const g = gate[meta.id as PillarId];
            const ok =
              g.pillarComplete && g.readingComplete && g.convictionDone;
            return (
              <li
                key={meta.id}
                className="flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm"
                style={{
                  borderColor: ok ? "rgba(34,197,139,0.45)" : GOLD_BORDER_SOFT,
                  background: ok
                    ? "rgba(34,197,139,0.08)"
                    : "rgba(245,197,71,0.06)"
                }}
              >
                <div>
                  <p className="font-semibold text-ink-0">{meta.title}</p>
                  <p className="mt-1 text-[12.5px] text-ink-2">
                    {!g.readingComplete
                      ? "Mark every quest card read."
                      : !g.pillarComplete
                      ? "Pass every section quiz."
                      : !g.convictionDone
                      ? "Submit your island conviction pulse."
                      : "Island path cleared."}
                  </p>
                </div>
                <span
                  className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: ok ? "#22C58B" : VIOLET_HI }}
                >
                  {ok ? "Ready" : "Open"}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="mt-8">
          <Link
            href="/map"
            className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition"
            style={{
              borderColor: GOLD_BORDER,
              background: "rgba(245,197,71,0.10)",
              color: GOLD_HI
            }}
          >
            Back to Quest Map
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pointer-events-auto relative mx-auto max-w-xl px-5 py-10 md:px-6 md:py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-ink-2">
            Final Challenge
          </p>
          <h1
            className="mt-1 font-[var(--font-grotesk)] text-2xl text-ink-0 md:text-3xl"
            style={{ textShadow: `0 0 38px ${GOLD_GLOW}` }}
          >
            Claim your 10-K Rookie Badge
          </h1>
        </div>
        <Link
          href="/map"
          className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-2 underline-offset-4 transition hover:text-ink-0 hover:underline"
          style={{ color: GOLD_HI }}
        >
          Map
        </Link>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink-1">
        Twelve draws from every island — mixed formats, shuffled each run. Hold{" "}
        <span className="font-semibold text-ink-0">70%+</span> to clear; hit{" "}
        <span className="font-semibold text-ink-0">90%+</span> for a High
        Conviction Rookie callout.
      </p>

      <AnimatePresence>
        {celebrateBadge ? (
          <motion.div
            key="badge-burst"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.08 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="pointer-events-none relative mt-6 flex justify-center"
            aria-hidden
          >
            <div
              className="relative flex h-24 w-24 items-center justify-center rounded-full border-2"
              style={{
                borderColor: GOLD_HI,
                boxShadow: `0 0 48px ${GOLD_GLOW}, inset 0 0 22px rgba(245,197,71,0.25)`,
                background:
                  "radial-gradient(circle at 50% 40%, rgba(245,197,71,0.35), rgba(20,12,40,0.9))"
              }}
            >
              <span className="font-[var(--font-grotesk)] text-[11px] font-bold uppercase tracking-[0.2em] text-ink-0">
                10-K
              </span>
              <motion.span
                className="absolute inset-[-18%] rounded-full border border-amber-200/40"
                initial={{ opacity: 0.9, scale: 0.85 }}
                animate={{ opacity: 0, scale: 1.45 }}
                transition={{ duration: 1.1, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="mt-8">
        <QuestQuizPanel
          pillarId="business"
          slug="__meta_ten_k_rookie__"
          quiz={finalQuiz}
          unlocked
          title="10-K Rookie finale"
          rewardXp={record ? 0 : TEN_K_ROOKIE_CHALLENGE_XP}
          uiVariant="ten-k-final"
          honorSeed={record?.highConviction ?? false}
          metaCompletion={{
            completed: record != null,
            onPass: (r) => onPass({ fraction: r.fraction })
          }}
        />
      </div>

      {record ? (
        <section className="mt-10 rounded-2xl border px-4 py-5 text-sm" style={{ borderColor: GOLD_BORDER_SOFT }}>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-2">
            Conviction pulse — {company.ticker}
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-1">
            How you felt clearing each island (saved locally when you finished
            the conviction modal).
          </p>
          <ul className="mt-3 space-y-2 text-[13px] text-ink-1">
            {convictionLines.map((row) => (
              <li key={row.pillar} className="flex justify-between gap-3">
                <span className="font-medium text-ink-0">{row.pillar}</span>
                <span className="text-ink-2">
                  {row.confident + row.cautious === 0
                    ? "—"
                    : `${row.confident} confident · ${row.cautious} cautious`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
