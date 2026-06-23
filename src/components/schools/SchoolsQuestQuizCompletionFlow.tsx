"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import { BACK_TO_ISLAND_LABEL } from "@/lib/quests/gameActionCopy";
import { playSchoolsQuestCompleteSound } from "@/lib/schools/schoolsQuestCompleteSound";
import {
  resolveSchoolsQuestCompletionCopy,
  SCHOOLS_COMPLETION_HEADLINE,
  SCHOOLS_COMPLETION_SKILL_HEADING,
  SCHOOLS_MENTOR_CLOSING
} from "@/lib/schools/schoolsQuestRewardFlow";
import { FallingConfettiRain } from "@/ui/effects/FallingConfettiRain";
import { ConfettiBurst } from "@/ui/effects/ConfettiBurst";

const GREEN_HI = "#22C58B";

type Props = {
  rewardXp: number;
  quizMicroXp?: number;
  prideLine: string;
  takeaways: readonly string[];
  accent: PillarQuestTheme;
  onBackToIsland: () => void;
  questSlug?: string;
};

const CONFETTI_WAVES = [
  { delayMs: 0, key: "rain-1", count: 88 },
  { delayMs: 1200, key: "rain-2", count: 72 },
  { delayMs: 2400, key: "rain-3", count: 60 }
] as const;

const CONFETTI_VISIBLE_MS = 6800;

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function useXpCountUp(
  target: number,
  active: boolean,
  durationMs = 900
): number {
  const [value, setValue] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!active || target <= 0) {
      setValue(target);
      return;
    }
    if (reduceMotion) {
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      setValue(Math.round(target * easeOutCubic(progress)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, durationMs, reduceMotion, target]);

  return value;
}

function FullscreenCelebration({
  celebrateKey,
  reduceMotion
}: {
  celebrateKey: string;
  reduceMotion: boolean | null;
}) {
  const [mounted, setMounted] = useState(false);
  const [waves, setWaves] = useState<readonly string[]>([]);
  const [showLayer, setShowLayer] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setShowLayer(false);
      setWaves([]);
      return;
    }

    setShowLayer(true);
    setWaves([]);

    const timers = CONFETTI_WAVES.map((wave) =>
      window.setTimeout(() => {
        setWaves((prev) => {
          const id = `${celebrateKey}-${wave.key}`;
          return prev.includes(id) ? prev : [...prev, id];
        });
      }, wave.delayMs)
    );
    const hide = window.setTimeout(() => {
      setShowLayer(false);
      setWaves([]);
    }, CONFETTI_VISIBLE_MS);

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.clearTimeout(hide);
    };
  }, [celebrateKey, reduceMotion]);

  if (!mounted || reduceMotion || !showLayer) return null;

  return createPortal(
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
    >
      <ConfettiBurst
        triggerKey={celebrateKey}
        count={56}
        activeDurationMs={5200}
        particleDurationSec={2.6}
        maxParticleDelaySec={1.4}
        spreadX={340}
        fallDistance={480}
        originTopPct={6}
      />
      {CONFETTI_WAVES.map((wave) =>
        waves.includes(`${celebrateKey}-${wave.key}`) ? (
          <FallingConfettiRain
            key={`${celebrateKey}-${wave.key}`}
            triggerKey={`${celebrateKey}-${wave.key}`}
            count={wave.count}
            durationMs={4500}
          />
        ) : null
      )}
    </div>,
    document.body
  );
}

function FloatingXpBurst({
  totalXp,
  reduceMotion
}: {
  totalXp: number;
  reduceMotion: boolean | null;
}) {
  const [visible, setVisible] = useState(true);
  const displayXp = useXpCountUp(totalXp, visible);

  useEffect(() => {
    if (reduceMotion) {
      const t = window.setTimeout(() => setVisible(false), 1000);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setVisible(false), 2200);
    return () => window.clearTimeout(t);
  }, [reduceMotion]);

  if (!visible || totalXp <= 0) return null;

  return (
    <motion.div
      aria-live="polite"
      className="pointer-events-none absolute right-0 top-[10%] z-30 sm:right-1"
      initial={{ opacity: 0, scale: 0.55, x: 12, y: 8 }}
      animate={
        reduceMotion
          ? { opacity: [0, 1, 0], scale: 1, x: 0, y: -16 }
          : {
              opacity: [0, 1, 1, 0],
              scale: [0.55, 1.08, 1, 0.9],
              x: [12, 0, -6, -10],
              y: [8, -4, -28, -48]
            }
      }
      transition={{
        duration: reduceMotion ? 0.95 : 2.1,
        delay: 0.35,
        ease: [0.22, 1, 0.36, 1],
        times: [0, 0.14, 0.58, 1]
      }}
    >
      <p
        className="whitespace-nowrap font-[var(--font-grotesk)] text-[clamp(1.15rem,3.6vw,1.45rem)] font-bold uppercase tracking-[0.05em]"
        style={{
          color: GREEN_HI,
          textShadow:
            "0 0 18px rgba(34,197,139,0.5), 0 0 36px rgba(34,197,139,0.24)"
        }}
      >
        <span aria-hidden className="mr-0.5">
          ✨
        </span>
        +{displayXp} XP
      </p>
    </motion.div>
  );
}

/**
 * Schools level-complete — unlock moment, one screen, no permanent XP slot.
 */
export function SchoolsQuestQuizCompletionFlow({
  rewardXp,
  quizMicroXp = 0,
  prideLine,
  takeaways,
  accent,
  onBackToIsland,
  questSlug
}: Props) {
  const reduceMotion = useReducedMotion();
  const [celebrationId] = useState(
    () => `${questSlug ?? "schools-quest-complete"}-${Date.now()}`
  );
  const totalXp = rewardXp + quizMicroXp;

  const completionCopy = questSlug
    ? resolveSchoolsQuestCompletionCopy(questSlug)
    : null;
  const headline = completionCopy?.headline ?? SCHOOLS_COMPLETION_HEADLINE;

  const learnedLine = useMemo(() => {
    const raw =
      completionCopy?.whatYouLearned?.trim() ||
      takeaways[0]?.trim() ||
      prideLine.trim();
    return raw.replace(/^🧠\s*/, "");
  }, [completionCopy?.whatYouLearned, takeaways, prideLine]);

  const skillIntro = completionCopy?.skillIntro;
  const skillBullets = completionCopy?.skillBullets ?? [];
  const skillClosingLines = (
    completionCopy ? completionCopy.investorSkillLines : SCHOOLS_MENTOR_CLOSING
  ).slice(0, skillBullets.length > 0 ? 1 : 2);

  const skillLines = skillBullets.length
    ? []
    : (completionCopy ? completionCopy.investorSkillLines : SCHOOLS_MENTOR_CLOSING).slice(
        0,
        2
      );

  const skillTitle =
    completionCopy?.investorSkillHeading ?? SCHOOLS_COMPLETION_SKILL_HEADING;
  const learnedLabel =
    completionCopy?.whatYouLearnedLabel ?? "Remember This";
  const ctaLabel = completionCopy?.ctaLabel ?? BACK_TO_ISLAND_LABEL;
  const showLearnedSection =
    skillBullets.length === 0 &&
    Boolean(completionCopy?.whatYouLearned?.trim() || (!completionCopy && learnedLine));

  useEffect(() => {
    if (reduceMotion) return;
    playSchoolsQuestCompleteSound();
  }, [reduceMotion]);

  return (
    <>
      <FullscreenCelebration
        celebrateKey={celebrationId}
        reduceMotion={reduceMotion}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto flex w-full max-w-xl flex-col justify-center gap-7 overflow-visible px-1 py-1 sm:gap-8"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-[-10%] top-[-10%] h-56 bg-[radial-gradient(ellipse_70%_60%_at_50%_20%,rgba(139,92,246,0.2),transparent_72%)]"
        />

        <FloatingXpBurst totalXp={totalXp} reduceMotion={reduceMotion} />

        {/* 1 — Quest complete */}
        <div className="relative z-10 shrink-0 text-center">
          <motion.span
            aria-hidden
            initial={{ scale: 0, rotate: -28, opacity: 0 }}
            animate={{ scale: [0, 1.22, 1], rotate: 0, opacity: 1 }}
            transition={{
              duration: 0.6,
              times: [0, 0.62, 1],
              ease: [0.22, 1, 0.36, 1],
              delay: 0.04
            }}
            className="mb-4 inline-block text-[clamp(2.85rem,10vw,3.75rem)] leading-none"
            style={{ filter: `drop-shadow(0 0 24px ${accent.glow})` }}
          >
            🏆
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.34 }}
            className="font-[var(--font-grotesk)] text-[clamp(1.85rem,5.8vw,2.45rem)] font-bold uppercase leading-[1.04] tracking-[0.09em]"
            style={{
              color: accent.hi,
              textShadow: `0 0 40px ${accent.glowSoft}`
            }}
          >
            {headline}
          </motion.h2>
        </div>

        {/* 2 — Investor skill unlocked */}
        <motion.section
          initial={{ opacity: 0, y: 14, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.22, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full shrink-0 overflow-hidden rounded-2xl border px-5 py-6 sm:px-7 sm:py-7"
          style={{
            borderColor: `color-mix(in srgb, ${accent.hi} 52%, transparent)`,
            background: `linear-gradient(145deg, color-mix(in srgb, ${accent.hi} 18%, rgba(8,8,22,0.96)) 0%, rgba(4,4,12,0.98) 100%)`,
            boxShadow: `0 0 40px -4px ${accent.glow}`
          }}
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            animate={
              reduceMotion ? undefined : { opacity: [0.3, 0.75, 0.3] }
            }
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background: `radial-gradient(ellipse 95% 85% at 50% 0%, ${accent.glowSoft}, transparent 70%)`
            }}
          />
          <div className="relative text-center">
            <span aria-hidden className="mb-3 block text-[clamp(1.75rem,5vw,2.25rem)] leading-none">
              🧠
            </span>
            <h3
              className="font-[var(--font-grotesk)] text-[clamp(1.45rem,4.8vw,2.05rem)] font-bold uppercase leading-tight tracking-[0.06em]"
              style={{
                color: accent.hi,
                textShadow: `0 0 28px ${accent.glowSoft}`
              }}
            >
              {skillTitle}
            </h3>
          </div>

          {skillBullets.length > 0 ? (
            <div className="relative mt-5 space-y-4 text-center sm:mt-6">
              {skillIntro ? (
                <p className="text-[clamp(1rem,2.8vw,1.12rem)] font-medium leading-snug text-ink-0">
                  {skillIntro}
                </p>
              ) : null}
              <ul className="mx-auto inline-block space-y-2.5 text-left">
                {skillBullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-start gap-2.5 text-[clamp(0.98rem,2.7vw,1.08rem)] leading-snug text-ink-0"
                  >
                    <span
                      aria-hidden
                      className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: accent.hi }}
                    />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              {skillClosingLines.map((line) => (
                <p
                  key={line}
                  className="text-[clamp(0.98rem,2.7vw,1.08rem)] font-medium leading-snug text-ink-1"
                >
                  {line}
                </p>
              ))}
            </div>
          ) : (
            <ul className="relative mt-5 space-y-3 text-center sm:mt-6">
              {skillLines.map((line, index) => (
                <li
                  key={line}
                  className={
                    index === skillLines.length - 1
                      ? "text-[clamp(1rem,2.8vw,1.1rem)] font-semibold leading-snug text-ink-0"
                      : "text-[clamp(0.92rem,2.5vw,1rem)] leading-snug text-ink-1"
                  }
                >
                  {line}
                </li>
              ))}
            </ul>
          )}
        </motion.section>

        {showLearnedSection ? (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.28 }}
            className="relative z-10 shrink-0 space-y-2 text-center"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-2">
              {learnedLabel}
            </p>
            <p className="text-[clamp(0.98rem,2.7vw,1.08rem)] font-medium leading-snug text-ink-0">
              {learnedLine}
            </p>
          </motion.section>
        ) : null}

        <motion.button
          type="button"
          onClick={onBackToIsland}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.28 }}
          className="relative z-10 mt-1 w-full shrink-0 rounded-2xl border px-6 py-4 text-center text-[clamp(11px,2.8vw,13px)] font-semibold uppercase tracking-[0.14em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/75"
          style={{
            borderColor: accent.border,
            background: `color-mix(in srgb, ${accent.hi} 26%, transparent)`,
            color: accent.hi,
            boxShadow: `0 0 24px -8px ${accent.glow}`
          }}
        >
          {ctaLabel}
        </motion.button>
      </motion.div>
    </>
  );
}
