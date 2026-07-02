"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import { BACK_TO_ISLAND_LABEL } from "@/lib/quests/gameActionCopy";
import { playSchoolsQuestCompleteSound } from "@/lib/schools/schoolsQuestCompleteSound";
import {
  resolveSchoolsQuestCompletionCopy,
  resolveSchoolsCompanyInsightHeading,
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
  companyName?: string;
};

const CONFETTI_WAVES = [
  { delayMs: 0, key: "rain-1", count: 36 }
] as const;

const CONFETTI_VISIBLE_MS = 4200;

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
        count={28}
        activeDurationMs={3200}
        particleDurationSec={2.2}
        maxParticleDelaySec={1.1}
        spreadX={280}
        fallDistance={360}
        originTopPct={8}
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

const MISSION_HEADING = "#92400e";
const MISSION_BODY = "#0f172a";
const MISSION_MUTED = "#475569";
const MISSION_INSIGHT_BORDER = "rgba(202, 138, 4, 0.42)";
const MISSION_ACHIEVEMENT_BG =
  "linear-gradient(168deg, rgba(255,255,255,0.92) 0%, rgba(254,243,199,0.88) 100%)";

function renderBoldSegments(text: string, keyPrefix: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-${index}`} className="font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part ? <span key={`${keyPrefix}-${index}`}>{part}</span> : null;
  });
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
  questSlug,
  companyName = ""
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
  const isPrincipleLayout = Boolean(completionCopy?.principleName);
  const principleName = completionCopy?.principleName;
  const principleBody = completionCopy?.principleBody;
  const companyInsightHeading = completionCopy?.companyInsightHeading
    ? resolveSchoolsCompanyInsightHeading(
        completionCopy.companyInsightHeading,
        companyName
      )
    : null;
  const companyInsightFields = completionCopy?.companyInsightFields ?? [];

  const learnedLine = useMemo(() => {
    const raw =
      completionCopy?.whatYouLearned?.trim() ||
      takeaways[0]?.trim() ||
      prideLine.trim();
    return raw.replace(/^🧠\s*/, "");
  }, [completionCopy?.whatYouLearned, takeaways, prideLine]);

  const skillEvaluateIntro =
    completionCopy?.skillEvaluateIntro ??
    completionCopy?.skillIntro ??
    "You can now evaluate:";
  const skillName = completionCopy?.skillName;
  const skillBullets = completionCopy?.skillBullets ?? [];
  const keyInsightLine =
    completionCopy?.investorSkillLines[0]?.trim() ||
    takeaways[0]?.trim() ||
    prideLine.trim().replace(/^🧠\s*/, "");

  const skillLines = skillBullets.length
    ? []
    : (completionCopy ? completionCopy.investorSkillLines : SCHOOLS_MENTOR_CLOSING).slice(
        0,
        2
      );

  const isMission = accent.cardChrome === "mission";
  const bodyText = accent.text ?? MISSION_BODY;
  const mutedText = accent.textMuted ?? MISSION_MUTED;
  const cardSurface =
    accent.surface ??
    "linear-gradient(168deg, #fffbeb 0%, #fef3c7 46%, #fde68a 100%)";
  const skillTitle =
    completionCopy?.investorSkillHeading ?? SCHOOLS_COMPLETION_SKILL_HEADING;
  const learnedLabel =
    completionCopy?.whatYouLearnedLabel ?? "Key Insight";
  const ctaLabel = completionCopy?.ctaLabel ?? BACK_TO_ISLAND_LABEL;
  const showLegacyLearnedSection =
    skillBullets.length === 0 &&
    Boolean(completionCopy?.whatYouLearned?.trim() || (!completionCopy && learnedLine));
  const showKeyInsightCallout =
    !isPrincipleLayout &&
    Boolean(keyInsightLine) &&
    (skillBullets.length > 0 || showLegacyLearnedSection);

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
        className="iq-schools-quest-complete relative mx-auto flex w-full max-w-xl flex-col justify-center gap-7 overflow-visible px-1 py-1 sm:gap-8"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-[-10%] top-[-10%] h-56 bg-[radial-gradient(ellipse_70%_60%_at_50%_20%,rgba(251,191,36,0.22),transparent_72%)]"
        />

        <FloatingXpBurst totalXp={totalXp} reduceMotion={reduceMotion} />

        {/* 1 — Quest complete hero */}
        <div className="relative z-10 shrink-0 text-center">
          <div className="relative mx-auto mb-4 inline-flex">
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-[-18%] rounded-full"
              animate={
                reduceMotion
                  ? undefined
                  : { opacity: [0.35, 0.7, 0.35], scale: [0.92, 1.08, 0.92] }
              }
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background:
                  "radial-gradient(circle, rgba(251,191,36,0.38) 0%, transparent 68%)"
              }}
            />
            <motion.span
              aria-hidden
              initial={{ scale: 0, rotate: -28, opacity: 0 }}
              animate={
                reduceMotion
                  ? { scale: 1, rotate: 0, opacity: 1 }
                  : {
                      scale: [0, 1.18, 1],
                      rotate: [0, -6, 4, 0],
                      y: [0, -5, 0],
                      opacity: 1
                    }
              }
              transition={
                reduceMotion
                  ? { duration: 0.45 }
                  : {
                      scale: { duration: 0.65, times: [0, 0.62, 1], ease: [0.22, 1, 0.36, 1] },
                      rotate: { duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.65 },
                      y: { duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.65 },
                      opacity: { duration: 0.35 }
                    }
              }
              className="relative inline-block text-[clamp(2.85rem,10vw,3.75rem)] leading-none"
              style={{ filter: `drop-shadow(0 0 22px ${accent.glow})` }}
            >
              {isPrincipleLayout ? "🎉" : "🏆"}
            </motion.span>
            {!reduceMotion ? (
              <>
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute -right-2 top-0 text-[14px]"
                  animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.15, 0.8] }}
                  transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                >
                  ✨
                </motion.span>
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute -left-3 bottom-1 text-[11px]"
                  animate={{ opacity: [0.15, 0.85, 0.15], scale: [0.75, 1.05, 0.75] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
                >
                  ✨
                </motion.span>
              </>
            ) : null}
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.34 }}
            className="font-[var(--font-grotesk)] text-[clamp(1.85rem,5.8vw,2.45rem)] font-bold uppercase leading-[1.04] tracking-[0.09em]"
            style={{
              color: isMission ? MISSION_HEADING : accent.hi,
              textShadow: isMission
                ? "0 2px 0 rgba(255,255,255,0.55)"
                : `0 0 40px ${accent.glowSoft}`
            }}
          >
            {headline}
          </motion.h2>
        </div>

        {/* 2 — Investor skill achievement card */}
        <motion.section
          initial={{ opacity: 0, y: 14, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.22, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="iq-schools-quest-complete__achievement relative z-10 w-full shrink-0 overflow-hidden rounded-2xl border px-5 py-6 sm:px-7 sm:py-7"
          style={
            isMission
              ? {
                  borderColor: accent.border,
                  background: cardSurface,
                  boxShadow:
                    "inset 0 1px 0 rgba(255, 255, 255, 0.78), 0 10px 26px rgba(2, 6, 23, 0.18)"
                }
              : {
                  borderColor: `color-mix(in srgb, ${accent.hi} 52%, transparent)`,
                  background: `linear-gradient(145deg, color-mix(in srgb, ${accent.hi} 18%, rgba(8,8,22,0.96)) 0%, rgba(4,4,12,0.98) 100%)`,
                  boxShadow: `0 0 40px -4px ${accent.glow}`
                }
          }
        >
          {isMission ? (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              animate={
                reduceMotion ? undefined : { opacity: [0.25, 0.55, 0.25] }
              }
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background:
                  "radial-gradient(ellipse 95% 85% at 50% 0%, rgba(251,191,36,0.16), transparent 70%)"
              }}
            />
          ) : (
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
          )}

          <div
            className="relative rounded-xl border px-4 py-5 sm:px-5 sm:py-6"
            style={
              isMission
                ? {
                    borderColor: "rgba(202, 138, 4, 0.35)",
                    background: MISSION_ACHIEVEMENT_BG,
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.82)"
                  }
                : undefined
            }
          >
            {isPrincipleLayout && principleName ? (
              <>
                <h3
                  className="iq-schools-quest-complete__principle-hero text-center font-[var(--font-grotesk)] text-[clamp(1.65rem,5.2vw,2.35rem)] font-bold leading-[1.08] tracking-[-0.02em]"
                  style={{ color: isMission ? bodyText : undefined }}
                >
                  {principleName}
                </h3>
                {principleBody ? (
                  <p
                    className="iq-schools-quest-complete__principle-body mt-4 text-center text-[clamp(1rem,2.8vw,1.12rem)] leading-relaxed sm:mt-5"
                    style={{ color: isMission ? bodyText : undefined }}
                  >
                    {renderBoldSegments(principleBody, "principle-body")}
                  </p>
                ) : null}
              </>
            ) : (
              <>
            <p
              className="text-center text-[10.5px] font-bold uppercase tracking-[0.22em]"
              style={{ color: isMission ? MISSION_HEADING : accent.hi }}
            >
              {skillTitle}
            </p>

            {skillName ? (
              <p
                className="mt-3 text-center font-[var(--font-grotesk)] text-[clamp(1.25rem,4.2vw,1.65rem)] font-bold leading-tight tracking-[-0.01em]"
                style={{ color: isMission ? bodyText : undefined }}
              >
                <span aria-hidden className="mr-1.5">
                  🧠
                </span>
                <span className={isMission ? "" : "text-ink-0"}>{skillName}</span>
              </p>
            ) : null}

            {skillBullets.length > 0 ? (
              <div className="mt-5 space-y-3 text-center sm:mt-6">
                <p
                  className="text-[clamp(0.98rem,2.7vw,1.08rem)] font-semibold leading-snug"
                  style={{ color: isMission ? mutedText : undefined }}
                >
                  <span className={isMission ? "" : "text-ink-1"}>
                    {skillEvaluateIntro}
                  </span>
                </p>
                <ul className="mx-auto inline-block space-y-2.5 text-left">
                  {skillBullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-2.5 text-[clamp(0.98rem,2.7vw,1.08rem)] leading-snug"
                      style={{ color: isMission ? bodyText : undefined }}
                    >
                      <span
                        aria-hidden
                        className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: isMission ? accent.hi : accent.hi }}
                      />
                      <span className={isMission ? "" : "text-ink-0"}>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <ul className="mt-5 space-y-3 text-center sm:mt-6">
                {skillLines.map((line, index) => (
                  <li
                    key={line}
                    className={
                      index === skillLines.length - 1
                        ? "text-[clamp(1rem,2.8vw,1.1rem)] font-semibold leading-snug"
                        : "text-[clamp(0.92rem,2.5vw,1rem)] leading-snug"
                    }
                    style={{
                      color: isMission
                        ? index === skillLines.length - 1
                          ? bodyText
                          : mutedText
                        : undefined
                    }}
                  >
                    <span
                      className={
                        isMission
                          ? ""
                          : index === skillLines.length - 1
                            ? "text-ink-0"
                            : "text-ink-1"
                      }
                    >
                      {line}
                    </span>
                  </li>
                ))}
              </ul>
            )}
              </>
            )}
          </div>
        </motion.section>

        {isPrincipleLayout && companyInsightHeading ? (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.28 }}
            className="iq-schools-quest-complete__insight relative z-10 shrink-0 rounded-xl border px-4 py-4 sm:px-5 sm:py-5"
            style={
              isMission
                ? {
                    borderColor: MISSION_INSIGHT_BORDER,
                    background:
                      "linear-gradient(168deg, rgba(255,255,255,0.88) 0%, rgba(254,243,199,0.72) 100%)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.9), 0 8px 22px rgba(2, 6, 23, 0.1)"
                  }
                : {
                    borderColor: "rgba(245,197,71,0.28)",
                    background: "rgba(245,197,71,0.08)"
                  }
            }
          >
            <p
              className="text-[10.5px] font-bold uppercase tracking-[0.22em]"
              style={{ color: isMission ? MISSION_HEADING : accent.hi }}
            >
              {companyInsightHeading.toUpperCase()}
            </p>
            {companyInsightFields.length > 0 ? (
              <ul className="mt-3.5 space-y-3">
                {companyInsightFields.map((field) => (
                  <li
                    key={field.label}
                    className="text-[clamp(0.98rem,2.7vw,1.08rem)] leading-snug"
                    style={{ color: isMission ? bodyText : undefined }}
                  >
                    <span className="font-bold">{field.label}</span>
                    {field.value?.trim() ? (
                      <span className="ml-1 font-medium">{field.value.trim()}</span>
                    ) : (
                      <span
                        aria-hidden
                        className="iq-schools-quest-complete__insight-blank ml-1 inline-block min-w-[4rem] align-baseline"
                      />
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
          </motion.section>
        ) : null}

        {showKeyInsightCallout ? (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.28 }}
            className="relative z-10 shrink-0 rounded-xl border px-4 py-4 sm:px-5 sm:py-4"
            style={
              isMission
                ? {
                    borderColor: MISSION_INSIGHT_BORDER,
                    background: "rgba(255,255,255,0.72)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)"
                  }
                : {
                    borderColor: "rgba(245,197,71,0.28)",
                    background: "rgba(245,197,71,0.08)"
                  }
            }
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: isMission ? MISSION_HEADING : undefined }}
            >
              <span className={isMission ? "" : "text-ink-2"}>{learnedLabel}</span>
            </p>
            <p
              className="mt-2 text-[clamp(0.98rem,2.7vw,1.08rem)] font-semibold leading-relaxed"
              style={{ color: isMission ? bodyText : undefined }}
            >
              <span className={isMission ? "" : "text-ink-0"}>
                {showLegacyLearnedSection ? learnedLine : keyInsightLine}
              </span>
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
          className={
            isMission
              ? "iq-schools-mission-cta relative z-10 mt-1 w-full shrink-0 px-6 py-4 text-center text-[clamp(11px,2.8vw,13px)] font-black uppercase tracking-[0.08em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/75"
              : "relative z-10 mt-1 w-full shrink-0 rounded-2xl border px-6 py-4 text-center text-[clamp(11px,2.8vw,13px)] font-semibold uppercase tracking-[0.14em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/75"
          }
          style={
            isMission
              ? undefined
              : {
                  borderColor: accent.border,
                  background: `color-mix(in srgb, ${accent.hi} 26%, transparent)`,
                  color: accent.hi,
                  boxShadow: `0 0 24px -8px ${accent.glow}`
                }
          }
        >
          {ctaLabel}
        </motion.button>
      </motion.div>
    </>
  );
}
