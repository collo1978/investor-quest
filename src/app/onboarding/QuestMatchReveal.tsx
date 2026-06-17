"use client";

import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { CompanyLogo } from "@/components/CompanyLogo";
import { NeonButton } from "@/components/NeonButton";
import { CONTROLLED_DEMO_COMPANY_ID } from "@/lib/demo/controlledDemo";
import { NVDA_ONBOARDING } from "@/lib/demo/nvidiaDemoVoice";
import { pickQuestMatchWinner } from "@/lib/onboarding/questMatchFallback";
import type { RecommendedCompanyCard } from "@/lib/onboarding/types";

type Phase = "scanning" | "slowing" | "locked" | "flying" | "revealed";

type Props = {
  companies: RecommendedCompanyCard[];
  interestLabelById: Map<string, string>;
  onWinnerChosen: (card: RecommendedCompanyCard) => void;
  onEnterQuest: () => void;
  enterQuestDisabled?: boolean;
  /** Controlled demo: broad spin, NVIDIA is always the final unlock. */
  controlledDemoReveal?: boolean;
  /** @deprecated Reveal stays on-screen until the player taps BEGIN QUEST. */
  autoContinueMs?: number;
  /** @deprecated CTA is always shown on the reveal beat. */
  hideContinueButton?: boolean;
  continueLabel?: string;
  /** Schools laptop deck — tighter layout for 1366×768. */
  deckCompact?: boolean;
};

const STATUS_SCAN = ["Matching detected", "Scanning interests", "Quest signals found"];
const STATUS_SLOW = ["Narrowing matches", "Almost there", "Quest company found"];
const STATUS_SLOW_DEMO = [...NVDA_ONBOARDING.matchSlow, NVDA_ONBOARDING.matchLocked];

const FLY_MS = 650;
const LOCKED_HOLD_MS = 380;

const BURST_PARTICLES = [
  { id: 0, angle: 0, distance: 52, size: 4 },
  { id: 1, angle: 30, distance: 68, size: 3 },
  { id: 2, angle: 60, distance: 44, size: 5 },
  { id: 3, angle: 95, distance: 72, size: 3 },
  { id: 4, angle: 130, distance: 56, size: 4 },
  { id: 5, angle: 165, distance: 64, size: 3 },
  { id: 6, angle: 200, distance: 48, size: 5 },
  { id: 7, angle: 235, distance: 76, size: 3 },
  { id: 8, angle: 270, distance: 58, size: 4 },
  { id: 9, angle: 305, distance: 70, size: 3 },
  { id: 10, angle: 340, distance: 46, size: 5 },
  { id: 11, angle: 15, distance: 80, size: 2 }
] as const;

const WINNER_LAYOUT_ID = "quest-match-winner-card";

function revealBlurb(
  winner: RecommendedCompanyCard,
  controlledDemoReveal: boolean
): string {
  if (controlledDemoReveal || winner.id === CONTROLLED_DEMO_COMPANY_ID) {
    return "The company behind many of the AI tools and games you already use.";
  }
  return `You unlocked your first quest — dive into ${winner.companyName} and build real conviction.`;
}

function BoardCard({
  card,
  active,
  dimmed,
  locked,
  layoutId,
  tiltDeg
}: {
  card: RecommendedCompanyCard;
  active: boolean;
  dimmed: boolean;
  locked: boolean;
  layoutId?: string;
  tiltDeg: number;
}) {
  const glowing = active && locked;

  return (
    <motion.div
      layoutId={layoutId}
      layout={layoutId ? false : undefined}
      animate={{
        scale: glowing ? 1.08 : active ? 1.04 : 1,
        opacity: dimmed ? 0.3 : 1,
        rotate: locked && active ? tiltDeg : 0
      }}
      transition={{
        opacity: { duration: 0.35 },
        scale: { type: "spring", stiffness: 420, damping: 28 },
        rotate: { duration: 0.25 }
      }}
      className={[
        "relative flex flex-col items-center rounded-2xl border px-2 py-3 text-center",
        glowing
          ? "border-[rgba(196,181,253,0.75)] bg-[rgba(139,92,246,0.22)] shadow-[0_0_40px_rgba(139,92,246,0.55),0_0_20px_rgba(245,197,71,0.35),inset_0_1px_0_rgba(255,255,255,0.14)]"
          : active
            ? "border-[rgba(245,197,71,0.55)] bg-[rgba(139,92,246,0.16)] shadow-[0_0_28px_rgba(139,92,246,0.35),0_0_12px_rgba(245,197,71,0.25)]"
            : "border-panel-border bg-[rgba(255,255,255,0.04)]"
      ].join(" ")}
    >
      {glowing ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-2xl bg-[radial-gradient(ellipse_90%_80%_at_50%_30%,rgba(167,139,250,0.45),transparent_68%)] blur-sm"
        />
      ) : active ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(135deg,rgba(139,92,246,0.2),rgba(245,197,71,0.08))]"
        />
      ) : null}
      <CompanyLogo
        src={card.logo}
        alt={card.companyName}
        className="relative h-10 w-10 sm:h-11 sm:w-11"
      />
      <p className="relative mt-2 line-clamp-2 text-[10px] font-semibold leading-tight text-ink-0">
        {card.companyName}
      </p>
      <p className="relative text-[9px] text-ink-2">{card.ticker}</p>
    </motion.div>
  );
}

function HeroWinnerCard({ winner }: { winner: RecommendedCompanyCard }) {
  return (
    <motion.div
      layoutId={WINNER_LAYOUT_ID}
      className="pointer-events-none relative z-20"
      initial={false}
      animate={{ scale: 2.05, rotate: 0, y: 0 }}
      transition={{
        layout: { duration: FLY_MS / 1000, ease: [0.22, 1, 0.36, 1] },
        scale: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        rotate: { duration: FLY_MS / 1000, ease: [0.22, 1, 0.36, 1] }
      }}
    >
      <div className="relative w-[148px] rounded-3xl border border-[rgba(245,197,71,0.55)] bg-[rgba(12,10,24,0.92)] px-5 py-6 text-center shadow-[0_0_48px_rgba(139,92,246,0.45),0_0_24px_rgba(245,197,71,0.22),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md sm:w-[168px]">
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-2 rounded-3xl bg-[radial-gradient(ellipse_90%_80%_at_50%_25%,rgba(167,139,250,0.42),transparent_68%)] blur-md"
        />
        <CompanyLogo
          src={winner.logo}
          alt={winner.companyName}
          className="relative mx-auto h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]"
        />
      </div>
    </motion.div>
  );
}

const UNLOCK_SPARKLES = [
  { id: 0, x: -118, y: -72, size: 4, delay: 0 },
  { id: 1, x: 96, y: -84, size: 3, delay: 0.12 },
  { id: 2, x: -88, y: 64, size: 5, delay: 0.22 },
  { id: 3, x: 112, y: 48, size: 3, delay: 0.08 },
  { id: 4, x: 0, y: -104, size: 4, delay: 0.18 },
  { id: 5, x: -64, y: 92, size: 3, delay: 0.28 },
  { id: 6, x: 72, y: 88, size: 4, delay: 0.15 }
] as const;

function QuestUnlockAtmosphere({ active }: { active: boolean }) {
  const reduceMotion = useReducedMotion();
  if (!active) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-[38%] z-0 h-0 w-0 -translate-x-1/2"
    >
      <span className="iq-quest-unlock-rays absolute left-1/2 top-1/2 h-[min(72vw,420px)] w-[min(72vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70" />
      <span className="absolute left-1/2 top-1/2 h-[min(52vw,300px)] w-[min(52vw,300px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.42),rgba(109,40,217,0.12)_45%,transparent_72%)] blur-2xl" />
      {!reduceMotion
        ? UNLOCK_SPARKLES.map((spark) => (
            <motion.span
              key={spark.id}
              className="absolute rounded-full bg-violet-100 shadow-[0_0_10px_rgba(196,181,253,0.9)]"
              style={{
                width: spark.size,
                height: spark.size,
                left: spark.x,
                top: spark.y
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.95, 0.35, 0.95],
                scale: [0.4, 1.2, 0.85, 1.1]
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: spark.delay
              }}
            />
          ))
        : null}
    </div>
  );
}

function RevealedQuestBeat({
  winner,
  controlledDemoReveal,
  continueLabel,
  enterQuestDisabled,
  onEnterQuest,
  deckCompact
}: {
  winner: RecommendedCompanyCard;
  controlledDemoReveal: boolean;
  continueLabel: string;
  enterQuestDisabled: boolean;
  onEnterQuest: () => void;
  deckCompact: boolean;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      key="revealed-beat"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className={[
        "iq-schools-company-reveal-reveal-copy relative z-30 flex w-full max-w-xl flex-col items-center text-center",
        deckCompact ? "gap-3 px-2 py-2" : "gap-5 px-4 py-6"
      ].join(" ")}
    >
      <motion.h1
        initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 24, delay: 0.05 }}
        className="iq-quest-unlock-headline relative font-[var(--font-grotesk)] text-[clamp(2.15rem,6.5vw,3.75rem)] font-black uppercase leading-[0.92] tracking-[0.1em] text-white"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 blur-2xl"
          style={{
            background:
              "radial-gradient(ellipse 80% 55% at 50% 50%, rgba(139,92,246,0.55), transparent 70%)"
          }}
        />
        Quest unlocked
      </motion.h1>

      <motion.div
        layoutId={WINNER_LAYOUT_ID}
        initial={reduceMotion ? false : { scale: 0.72, opacity: 0, rotate: -4 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.14 }}
        className="iq-quest-unlock-card-wrap relative my-1"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.55),rgba(109,40,217,0.18)_42%,transparent_72%)] blur-3xl"
        />
        {!reduceMotion ? (
          <>
            <motion.span
              aria-hidden
              className="pointer-events-none absolute -inset-5 rounded-[2rem] border border-violet-300/35"
              animate={{ scale: [1, 1.06, 1], opacity: [0.55, 0.2, 0.55] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              aria-hidden
              className="pointer-events-none absolute -inset-8 rounded-[2.25rem] border border-violet-400/15"
              animate={{ scale: [1.04, 1.12, 1.04], opacity: [0.35, 0.12, 0.35] }}
              transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            />
          </>
        ) : null}
        <div className="iq-quest-unlock-card relative rounded-[1.75rem] border-2 border-[rgba(196,181,253,0.82)] bg-[linear-gradient(165deg,rgba(28,14,48,0.98)_0%,rgba(10,6,20,0.98)_100%)] px-10 py-9 shadow-[0_0_80px_rgba(139,92,246,0.62),0_0_36px_rgba(245,197,71,0.28),0_0_120px_rgba(109,40,217,0.32),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-md sm:px-12 sm:py-10">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[1.65rem] bg-[radial-gradient(ellipse_90%_70%_at_50%_0%,rgba(255,255,255,0.14),transparent_58%)]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(196,181,253,0.35),transparent_40%,rgba(245,197,71,0.2))] opacity-60"
          />
          <CompanyLogo
            src={winner.logo}
            alt={winner.companyName}
            className="relative mx-auto h-[5.5rem] w-[5.5rem] sm:h-28 sm:w-28 md:h-32 md:w-32"
          />
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32, duration: 0.45 }}
        className="font-[var(--font-grotesk)] text-[clamp(1.85rem,4.8vw,2.75rem)] font-black uppercase leading-none tracking-[0.05em] text-white drop-shadow-[0_0_22px_rgba(139,92,246,0.45)]"
      >
        {winner.companyName}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42, duration: 0.45 }}
        className="iq-schools-company-reveal-blurb max-w-md text-sm leading-relaxed text-violet-100/90 sm:text-base"
      >
        {revealBlurb(winner, controlledDemoReveal)}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.52, duration: 0.45 }}
        className="iq-schools-company-reveal-cta w-full max-w-md pt-1"
      >
        <NeonButton
          className="iq-schools-opening-cta-primary min-h-[56px] w-full justify-center rounded-full border-2 border-violet-300/55 text-sm font-bold uppercase tracking-[0.16em] shadow-[0_0_32px_rgba(139,92,246,0.35)]"
          onClick={onEnterQuest}
          disabled={enterQuestDisabled}
        >
          {enterQuestDisabled ? "Loading your progress…" : continueLabel}
        </NeonButton>
      </motion.div>
    </motion.div>
  );
}

function ParticleBurst({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-[38%] z-10 h-0 w-0 -translate-x-1/2"
    >
      {BURST_PARTICLES.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const x = Math.cos(rad) * (p.distance * 1.35);
        const y = Math.sin(rad) * (p.distance * 1.35);
        return (
          <motion.span
            key={p.id}
            className="absolute rounded-full bg-violet-100 shadow-[0_0_8px_rgba(196,181,253,0.85)]"
            style={{ width: p.size + 1, height: p.size + 1, left: 0, top: 0 }}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0.4, 0], scale: [0, 1.6, 1.1, 0.3], x, y }}
            transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1], delay: p.id * 0.03 }}
          />
        );
      })}
    </div>
  );
}

export function QuestMatchReveal({
  companies,
  interestLabelById: _interestLabelById,
  onWinnerChosen,
  onEnterQuest,
  enterQuestDisabled = false,
  controlledDemoReveal = false,
  continueLabel = "LET'S GO",
  deckCompact = false
}: Props) {
  const reduceMotion = useReducedMotion();
  const pool = useMemo(() => companies.slice(0, 9), [companies]);
  const onWinnerChosenRef = useRef(onWinnerChosen);
  onWinnerChosenRef.current = onWinnerChosen;

  const [phase, setPhase] = useState<Phase>("scanning");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [statusLine, setStatusLine] = useState(STATUS_SCAN[0]);
  const [winner, setWinner] = useState<RecommendedCompanyCard | null>(null);
  const [winnerTilt, setWinnerTilt] = useState(0);

  const showScanHeadline =
    phase === "scanning" || phase === "slowing" || phase === "locked";
  const showBoard = showScanHeadline || phase === "flying";
  const showFlyingHero = phase === "flying" && winner;
  const showRevealedBeat = phase === "revealed" && winner;
  const boardFading = phase === "flying";

  useEffect(() => {
    if (pool.length === 0) return;

    const chosen = pickQuestMatchWinner(pool);
    const winnerIdx = pool.findIndex((c) => c.id === chosen.id);
    const resolvedIdx = winnerIdx >= 0 ? winnerIdx : 0;
    const tilt = ((resolvedIdx % 3) - 1) * 2.5;

    if (reduceMotion) {
      setWinner(chosen);
      setWinnerTilt(tilt);
      setPhase("revealed");
      onWinnerChosenRef.current(chosen);
      return;
    }

    setPhase("scanning");
    setHighlightIndex(0);
    setWinner(null);
    setWinnerTilt(tilt);

    let tick = 0;
    const fast = window.setInterval(() => {
      tick += 1;
      setHighlightIndex((i) => (i + 1) % pool.length);
      setStatusLine(STATUS_SCAN[tick % STATUS_SCAN.length]!);
    }, 90);

    let slow: number | null = null;
    let lockTimer: number | null = null;
    let flyTimer: number | null = null;

    const scanMs = controlledDemoReveal ? 1000 : 2000;
    const lockMs = controlledDemoReveal ? 750 : 1200;

    const slowStart = window.setTimeout(() => {
      window.clearInterval(fast);
      setPhase("slowing");
      let slowTick = 0;
      const slowLines = controlledDemoReveal ? STATUS_SLOW_DEMO : STATUS_SLOW;
      slow = window.setInterval(() => {
        slowTick += 1;
        setHighlightIndex((i) => (i + 1) % pool.length);
        setStatusLine(slowLines[slowTick % slowLines.length]!);
      }, controlledDemoReveal ? 180 : 210);

      lockTimer = window.setTimeout(() => {
        if (slow) window.clearInterval(slow);
        setHighlightIndex(resolvedIdx);
        setPhase("locked");
        setStatusLine(
          controlledDemoReveal ? NVDA_ONBOARDING.matchLocked : "Quest company found"
        );
        setWinner(chosen);
        onWinnerChosenRef.current(chosen);

        flyTimer = window.setTimeout(() => setPhase("flying"), LOCKED_HOLD_MS);
      }, lockMs);
    }, scanMs);

    return () => {
      window.clearInterval(fast);
      window.clearTimeout(slowStart);
      if (slow) window.clearInterval(slow);
      if (lockTimer) window.clearTimeout(lockTimer);
      if (flyTimer) window.clearTimeout(flyTimer);
    };
  }, [pool, reduceMotion, controlledDemoReveal]);

  useEffect(() => {
    if (phase !== "flying") return;
    const timer = window.setTimeout(() => setPhase("revealed"), FLY_MS + 80);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const gridCols =
    pool.length <= 4 ? "grid-cols-2" : pool.length <= 6 ? "grid-cols-3" : "grid-cols-3";

  return (
    <LayoutGroup id="quest-match-reveal">
      <div
        className={[
          "relative flex w-full flex-col items-center justify-center overflow-hidden px-4 py-8 sm:px-6",
          deckCompact
            ? "iq-schools-company-reveal-deck iq-schools-company-reveal-inner min-h-[100dvh]"
            : "min-h-[min(100dvh,920px)]"
        ].join(" ")}
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          animate={{
            opacity: phase === "revealed" ? 1 : phase === "flying" ? 0.85 : 0.55
          }}
          transition={{ duration: 0.6 }}
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 42%, rgba(139,92,246,0.22), transparent 68%)"
          }}
        />

        <ParticleBurst active={phase === "revealed"} />
        <QuestUnlockAtmosphere active={phase === "revealed"} />

        <div className="relative z-10 flex w-full max-w-[520px] flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {showRevealedBeat ? (
              <RevealedQuestBeat
                key="revealed"
                winner={winner}
                controlledDemoReveal={controlledDemoReveal}
                continueLabel={continueLabel}
                enterQuestDisabled={enterQuestDisabled}
                onEnterQuest={onEnterQuest}
                deckCompact={deckCompact}
              />
            ) : null}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {!showRevealedBeat && showScanHeadline ? (
              <motion.div
                key="scan-ui"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.3 }}
                className="iq-schools-company-reveal-scan-headline mb-6 text-center"
              >
                <p className="text-xl font-[var(--font-grotesk)] font-extrabold text-ink-0 sm:text-2xl">
                  {controlledDemoReveal
                    ? NVDA_ONBOARDING.matchScan
                    : "Scanning your investor interests…"}
                </p>
                <motion.p
                  key={statusLine}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(245,197,71,0.85)]"
                >
                  {statusLine}
                </motion.p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {!showRevealedBeat ? (
          <div className="iq-schools-company-reveal-board relative mx-auto min-h-[300px] w-full sm:min-h-[340px]">
            <AnimatePresence>
              {showBoard && pool.length > 0 ? (
                <motion.div
                  key="board"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: boardFading ? 0 : 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.35 } }}
                  transition={{ duration: phase === "locked" ? 0.4 : 0.25 }}
                  className={`relative grid ${gridCols} gap-2.5 sm:gap-3`}
                >
                  {pool.map((card, i) => {
                    const isWinner = winner?.id === card.id;
                    const hideWinnerInGrid = isWinner && boardFading;
                    if (hideWinnerInGrid) {
                      return <div key={card.id} aria-hidden className="min-h-[88px]" />;
                    }

                    const active = highlightIndex === i;
                    const dimmed =
                      phase === "locked" && winner != null && !isWinner;

                    return (
                      <BoardCard
                        key={card.id}
                        card={card}
                        active={active}
                        dimmed={dimmed}
                        locked={phase === "locked"}
                        tiltDeg={isWinner ? winnerTilt : 0}
                        layoutId={
                          isWinner && phase === "locked" ? WINNER_LAYOUT_ID : undefined
                        }
                      />
                    );
                  })}
                </motion.div>
              ) : null}
            </AnimatePresence>

            {showFlyingHero ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <HeroWinnerCard winner={winner} />
              </div>
            ) : null}
          </div>
          ) : null}

          {!showRevealedBeat && showScanHeadline ? (
            <p className="mt-6 text-center text-[11px] text-ink-2">
              {controlledDemoReveal
                ? NVDA_ONBOARDING.questMatchWaiting
                : "Investor Quest is matching your first company quest…"}
            </p>
          ) : null}
        </div>
      </div>
    </LayoutGroup>
  );
}
