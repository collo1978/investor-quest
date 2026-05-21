"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { CompanyLogo } from "@/components/CompanyLogo";
import { NeonButton } from "@/components/NeonButton";
import { pickQuestMatchWinner } from "@/lib/onboarding/questMatchFallback";
import type { RecommendedCompanyCard } from "@/lib/onboarding/types";

type Phase = "scanning" | "slowing" | "locked" | "complete";

type Props = {
  companies: RecommendedCompanyCard[];
  interestLabelById: Map<string, string>;
  onWinnerChosen: (card: RecommendedCompanyCard) => void;
  onEnterQuest: () => void;
};

const STATUS_SCAN = ["Matching detected", "Scanning interests", "Quest signals found"];
const STATUS_SLOW = ["Narrowing matches", "Almost there", "Quest company found"];

function InterestTags({
  ids,
  labelById
}: {
  ids: string[];
  labelById: Map<string, string>;
}) {
  if (!ids.length) return null;
  return (
    <motion.div className="mt-1.5 flex flex-wrap justify-center gap-1">
      {ids.slice(0, 2).map((id) => (
        <span
          key={id}
          className="rounded-full border border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.12)] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-neon-300"
        >
          {labelById.get(id) ?? id.replace(/_/g, " ")}
        </span>
      ))}
    </motion.div>
  );
}

function BoardCard({
  card,
  active,
  dimmed
}: {
  card: RecommendedCompanyCard;
  active: boolean;
  dimmed: boolean;
}) {
  return (
    <motion.div
      layout
      animate={{
        scale: active ? 1.06 : 1,
        opacity: dimmed ? 0.35 : 1
      }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={[
        "relative flex flex-col items-center rounded-2xl border px-2 py-3 text-center transition-shadow duration-150",
        active
          ? "border-[rgba(245,197,71,0.55)] bg-[rgba(139,92,246,0.16)] shadow-[0_0_28px_rgba(139,92,246,0.35),0_0_12px_rgba(245,197,71,0.25)]"
          : "border-panel-border bg-[rgba(255,255,255,0.04)]"
      ].join(" ")}
    >
      {active ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(135deg,rgba(139,92,246,0.2),rgba(245,197,71,0.08))]"
        />
      ) : null}
      <CompanyLogo src={card.logo} alt={card.companyName} className="relative h-10 w-10 sm:h-11 sm:w-11" />
      <p className="relative mt-2 line-clamp-2 text-[10px] font-semibold leading-tight text-ink-0">
        {card.companyName}
      </p>
      <p className="relative text-[9px] text-ink-2">{card.ticker}</p>
    </motion.div>
  );
}

export function QuestMatchReveal({
  companies,
  interestLabelById,
  onWinnerChosen,
  onEnterQuest
}: Props) {
  const reduceMotion = useReducedMotion();
  const pool = useMemo(() => companies.slice(0, 9), [companies]);
  const onWinnerChosenRef = useRef(onWinnerChosen);
  onWinnerChosenRef.current = onWinnerChosen;

  const [phase, setPhase] = useState<Phase>("scanning");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [statusLine, setStatusLine] = useState(STATUS_SCAN[0]);
  const [winner, setWinner] = useState<RecommendedCompanyCard | null>(null);

  useEffect(() => {
    if (pool.length === 0) return;

    const chosen = pickQuestMatchWinner(pool);

    if (reduceMotion) {
      setWinner(chosen);
      setPhase("complete");
      onWinnerChosenRef.current(chosen);
      return;
    }

    setPhase("scanning");
    setHighlightIndex(0);
    setWinner(null);

    let tick = 0;
    const fast = window.setInterval(() => {
      tick += 1;
      setHighlightIndex((i) => (i + 1) % pool.length);
      setStatusLine(STATUS_SCAN[tick % STATUS_SCAN.length]!);
    }, 90);

    let slow: number | null = null;
    let lockTimer: number | null = null;
    let completeTimer: number | null = null;

    const slowStart = window.setTimeout(() => {
      window.clearInterval(fast);
      setPhase("slowing");
      let slowTick = 0;
      slow = window.setInterval(() => {
        slowTick += 1;
        setHighlightIndex((i) => (i + 1) % pool.length);
        setStatusLine(STATUS_SLOW[slowTick % STATUS_SLOW.length]!);
      }, 220);

      lockTimer = window.setTimeout(() => {
        if (slow) window.clearInterval(slow);
        const winnerIdx = pool.findIndex((c) => c.id === chosen.id);
        setHighlightIndex(winnerIdx >= 0 ? winnerIdx : 0);
        setPhase("locked");
        setStatusLine("Quest company found");
        setWinner(chosen);
        onWinnerChosenRef.current(chosen);

        completeTimer = window.setTimeout(() => setPhase("complete"), 700);
      }, 1400);
    }, 2200);

    return () => {
      window.clearInterval(fast);
      window.clearTimeout(slowStart);
      if (slow) window.clearInterval(slow);
      if (lockTimer) window.clearTimeout(lockTimer);
      if (completeTimer) window.clearTimeout(completeTimer);
    };
  }, [pool, reduceMotion]);
  const gridCols =
    pool.length <= 4 ? "grid-cols-2" : pool.length <= 6 ? "grid-cols-3" : "grid-cols-3";

  return (
    <motion.div className="space-y-5">
      <motion.div className="text-center">
        <AnimatePresence mode="wait">
          {phase !== "complete" ? (
            <motion.div
              key="scan-headline"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xl font-[var(--font-grotesk)] font-extrabold text-ink-0 sm:text-2xl"
            >
              Scanning your investor interests…
            </motion.div>
          ) : (
            <motion.div
              key="complete-headline"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neon-300">
                Your first quest is unlocked
              </p>
              <p className="text-2xl font-[var(--font-grotesk)] font-extrabold text-ink-0 sm:text-3xl">
                {winner?.companyName}
              </p>
              <p className="text-sm text-ink-2">{winner?.ticker}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {phase !== "complete" ? (
          <motion.p
            key={statusLine}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(245,197,71,0.85)]"
          >
            {statusLine}
          </motion.p>
        ) : null}
      </motion.div>

      <div className="relative min-h-[280px] sm:min-h-[300px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(139,92,246,0.14),transparent_70%)]"
        />

        <AnimatePresence mode="wait">
          {phase !== "complete" && pool.length > 0 ? (
            <motion.div
              key="board"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === "locked" ? 0.25 : 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35 }}
              className={`relative grid ${gridCols} gap-2.5 sm:gap-3`}
            >
              {pool.map((card, i) => (
                <BoardCard
                  key={card.id}
                  card={card}
                  active={highlightIndex === i}
                  dimmed={phase === "locked" && highlightIndex !== i}
                />
              ))}
            </motion.div>
          ) : null}

          {winner && (phase === "locked" || phase === "complete") ? (
            <motion.div
              key="winner"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{
                opacity: 1,
                scale: phase === "complete" ? 1 : 1.08
              }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className={
                phase === "complete"
                  ? "relative mx-auto flex max-w-[240px] flex-col items-center"
                  : "absolute inset-0 z-10 flex items-center justify-center"
              }
            >
              <div className="relative w-full max-w-[220px] rounded-3xl border border-[rgba(245,197,71,0.5)] bg-[rgba(12,10,24,0.92)] px-6 py-7 text-center shadow-[0_0_48px_rgba(139,92,246,0.4),0_0_24px_rgba(245,197,71,0.2),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-1 rounded-3xl bg-[radial-gradient(ellipse_90%_80%_at_50%_30%,rgba(139,92,246,0.35),transparent_65%)] blur-md"
                />
                <CompanyLogo
                  src={winner.logo}
                  alt={winner.companyName}
                  className="relative mx-auto h-20 w-20 sm:h-24 sm:w-24"
                />
                {phase === "locked" ? (
                  <>
                    <p className="relative mt-4 text-lg font-[var(--font-grotesk)] font-extrabold text-ink-0">
                      {winner.companyName}
                    </p>
                    <p className="relative text-sm text-ink-2">{winner.ticker}</p>
                    <InterestTags
                      ids={winner.matchingInterests}
                      labelById={interestLabelById}
                    />
                  </>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {phase === "complete" ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <NeonButton className="w-full justify-center" onClick={onEnterQuest}>
            Enter Quest
          </NeonButton>
        </motion.div>
      ) : (
        <p className="text-center text-[11px] text-ink-2">
          Investor Quest is matching your first company quest…
        </p>
      )}
    </motion.div>
  );
}
