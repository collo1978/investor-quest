"use client";

/**
 * Premium pillar quest card — Q/A + mark-as-read layout (React/CSS).
 * Business = gold/violet; Forces = storm red/orange; Financials = emerald;
 * Management = executive violet.
 */

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { SHOW_ME_LABEL } from "@/lib/quests/gameActionCopy";

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

/** Staged reveal on Business quest cards — SHOW ME → investigation → answer found. */
type RevealPhase = "hidden" | "q-shrink" | "a-arrive" | "answer" | "complete";

const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;
const Q_SHRINK_MS = 0.15;
const A_ARRIVE_MS = 0.25;
const ANSWER_REVEAL_MS = 0.25;
const CARD_HIGHLIGHT_MS = 0.28;
const A_ARRIVE_START_MS = 150;
const ANSWER_START_MS = 400;
const REVEAL_COMPLETE_MS = 650;
const HIERARCHY_SHIFT_MS = 0.35;

/** Jewel business card — clean projector-framed gold (no bloom). */
const JEWEL_CARD_BORDER = "rgba(210, 175, 85, 0.72)";
const JEWEL_SECTION_DIVIDER = "rgba(245, 197, 71, 0.22)";
const JEWEL_CARD_BG = "rgba(6, 6, 14, 0.995)";
const JEWEL_CARD_SHADOW =
  "0 24px 56px -32px rgba(0,0,0,0.94), inset 0 1px 0 rgba(255, 228, 170, 0.18)";

/** Premium jewel cards — Q/A circle badges beside question and answer. */
const BADGE_SIZE_CLASS = "h-11 w-11 shrink-0 sm:h-12 sm:w-12";
const BADGE_COMPACT_CLASS = "h-9 w-9 shrink-0 sm:h-10 sm:w-10";

function badgeShellClass(size: "default" | "compact"): string {
  return size === "compact" ? BADGE_COMPACT_CLASS : BADGE_SIZE_CLASS;
}

function badgeLabelClass(size: "default" | "compact"): string {
  return size === "compact"
    ? "text-[1rem] font-extrabold uppercase tracking-[0.06em] sm:text-[1.12rem]"
    : "text-[1.15rem] font-extrabold uppercase tracking-[0.08em] sm:text-[1.3rem]";
}

/** Gold (or pillar) letter on jewel cards — dark on neon fills. */
function badgeLetterColor(theme: PillarQuestTheme): string {
  return theme.cardChrome === "neon" ? theme.badgeText : theme.hi;
}

function jewelBadgeShellStyle(theme: PillarQuestTheme): CSSProperties {
  return {
    background: circleBadgeBackground(theme),
    border: `1px solid ${theme.borderSoft}`,
    boxShadow: "none",
    color: badgeLetterColor(theme)
  };
}

function circleBadgeShellStyle(
  theme: PillarQuestTheme,
  emphasis: BadgeEmphasis = "default"
): CSSProperties {
  if (theme.cardChrome === "jewel") {
    return jewelBadgeShellStyle(theme);
  }
  const isHero = emphasis === "hero";
  return {
    background: circleBadgeBackground(theme),
    boxShadow: isHero ? circleBadgeShadow(theme, true) : circleBadgeShadow(theme, false),
    color: theme.badgeText
  };
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
  /** Quick reveal — question first, staged SHOW ME animation (no typewriter). */
  answerReveal?: {
    revealed: boolean;
    onRevealComplete: () => void;
  };
};

/** @deprecated Use {@link PillarQuestTemplateFrame} */
export type BusinessQuestTemplateFrameProps = PillarQuestTemplateFrameProps;

function HeaderCompanyName({ name, theme }: { name: string; theme: PillarQuestTheme }) {
  const label = name.trim();
  if (!label) return null;
  return (
    <span
      className="max-w-[52%] truncate text-right font-[var(--font-grotesk)] text-[10.5px] font-medium tracking-wide sm:max-w-none sm:text-[11px]"
      style={{ color: "rgba(210,210,220,0.72)" }}
      title={label}
    >
      {label}
    </span>
  );
}

function ShowMeButton({
  theme,
  onClick
}: {
  theme: PillarQuestTheme;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className="inline-flex h-9 min-h-[36px] w-[11rem] max-w-[12.5rem] items-center justify-center rounded-full border px-4 text-[11px] font-semibold uppercase tracking-[0.16em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
      style={{
        borderColor: theme.borderSoft,
        background: "rgba(245,197,71,0.08)",
        color: theme.hi
      }}
    >
      {SHOW_ME_LABEL}
    </motion.button>
  );
}

function circleBadgeShadow(theme: PillarQuestTheme, intense = false): string {
  if (theme.cardChrome === "neon") {
    const glow = intense ? `0 0 42px 4px ${theme.glow}` : `0 0 28px -2px ${theme.glow}`;
    return `0 0 0 1.5px ${theme.light ?? theme.hi}, ${glow}, inset 0 1px 0 rgba(255,255,255,0.35)`;
  }
  return intense
    ? `0 0 12px -4px ${theme.glow}`
    : "none";
}

function circleBadgeBackground(theme: PillarQuestTheme): string {
  return theme.cardChrome === "neon"
    ? theme.hi
    : "rgba(255,255,255,0.04)";
}

type BadgeEmphasis = "default" | "muted" | "hero";

function CircleBadge({
  label,
  theme,
  className = "",
  emphasis = "default",
  size = "default"
}: {
  label: string;
  theme: PillarQuestTheme;
  className?: string;
  emphasis?: BadgeEmphasis;
  size?: "default" | "compact";
}) {
  const isHero = emphasis === "hero";
  const isMuted = emphasis === "muted";

  return (
    <motion.div
      aria-hidden
      layout
      className={`relative flex ${badgeShellClass(size)} items-center justify-center rounded-full ${className}`}
      animate={{
        opacity: isMuted ? 0.62 : 1,
        scale: isMuted ? 1 : isHero ? 1.02 : 1
      }}
      transition={{ duration: HIERARCHY_SHIFT_MS, ease: REVEAL_EASE }}
      style={circleBadgeShellStyle(theme, emphasis)}
    >
      <span className={`relative font-[var(--font-grotesk)] ${badgeLabelClass(size)}`}>
        {label}
      </span>
    </motion.div>
  );
}

/** Q shrinks → A arrives in the question-row badge slot. */
function InvestigationQABadge({
  theme,
  phase,
  className = ""
}: {
  theme: PillarQuestTheme;
  phase: "q-shrink" | "a-arrive" | "answer";
  className?: string;
}) {
  const baseShadow = circleBadgeShadow(theme, false);
  const peakShadow = circleBadgeShadow(theme, true);
  const showQ = phase === "q-shrink";
  const showA = phase === "a-arrive" || phase === "answer";
  const isJewel = theme.cardChrome === "jewel";
  const investigationShell = isJewel
    ? jewelBadgeShellStyle(theme)
    : {
        background: circleBadgeBackground(theme),
        color: theme.badgeText,
        boxShadow: baseShadow
      };

  return (
    <div className={`relative ${BADGE_SIZE_CLASS} ${className}`}>
      <AnimatePresence initial={false}>
        {showQ ? (
          <motion.div
            key="investigation-q"
            aria-hidden
            className="absolute inset-0 flex items-center justify-center rounded-full"
            style={investigationShell}
            initial={{ scale: 1 }}
            animate={{ scale: 0.9 }}
            exit={{ scale: 0.82, opacity: 0 }}
            transition={{ duration: Q_SHRINK_MS, ease: REVEAL_EASE }}
          >
            <span className={badgeLabelClass("default")}>Q</span>
          </motion.div>
        ) : null}
        {showA ? (
          <motion.div
            key="investigation-a"
            aria-hidden
            className="absolute inset-0 flex items-center justify-center rounded-full"
            style={
              isJewel
                ? jewelBadgeShellStyle(theme)
                : { background: circleBadgeBackground(theme), color: theme.badgeText }
            }
            initial={{ scale: 0.85, opacity: 0, boxShadow: isJewel ? "none" : baseShadow }}
            animate={{
              scale: 1,
              opacity: 1,
              boxShadow: isJewel
                ? "none"
                : phase === "a-arrive"
                  ? [peakShadow, baseShadow]
                  : baseShadow
            }}
            transition={{ duration: A_ARRIVE_MS, ease: REVEAL_EASE }}
          >
            <span className={badgeLabelClass("default")}>A</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** One quick gold highlight pass across the card. */
function InvestigationCardHighlight({
  theme,
  active,
  roundedClass
}: {
  theme: PillarQuestTheme;
  active: boolean;
  roundedClass: string;
}) {
  if (!active) return null;

  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-[3] overflow-hidden ${roundedClass}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.22, 0] }}
      transition={{ duration: CARD_HIGHLIGHT_MS, ease: "easeOut" }}
    >
      <motion.div
        className="absolute inset-y-0 w-[38%]"
        initial={{ left: "-35%" }}
        animate={{ left: "105%" }}
        transition={{ duration: CARD_HIGHLIGHT_MS, ease: "easeOut" }}
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${theme.glowSoft} 42%, rgba(255,229,141,0.1) 50%, ${theme.glowSoft} 58%, transparent 100%)`
        }}
      />
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
  trailSlot,
  answerReveal
}: PillarQuestTemplateFrameProps) {
  const theme = getPillarQuestTheme(pillarId);
  const isNeon = theme.cardChrome === "neon";
  const isJewel = theme.cardChrome === "jewel";
  const pct = Math.min(100, (cardIndex / Math.max(1, cardTotal)) * 100);
  const pulsePeakBorder = isNeon ? theme.hi : theme.rim;
  const pulsePeakGlow = isNeon ? theme.glow : theme.whyGlow;
  const innerRounded = isNeon ? "rounded-[1.35rem]" : "rounded-[1.2rem]";

  const [revealPhase, setRevealPhase] = useState<RevealPhase>(() =>
    answerReveal?.revealed ? "complete" : "hidden"
  );
  const timersRef = useRef<number[]>([]);

  const clearRevealTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const scheduleReveal = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    clearRevealTimers();
    setRevealPhase(answerReveal?.revealed ? "complete" : "hidden");
  }, [answerReveal?.revealed, cardIndex, clearRevealTimers]);

  useEffect(() => () => clearRevealTimers(), [clearRevealTimers]);

  const startReveal = useCallback(() => {
    if (!answerReveal || revealPhase !== "hidden") return;
    clearRevealTimers();
    setRevealPhase("q-shrink");
    scheduleReveal(() => setRevealPhase("a-arrive"), A_ARRIVE_START_MS);
    scheduleReveal(() => setRevealPhase("answer"), ANSWER_START_MS);
    scheduleReveal(() => {
      setRevealPhase("complete");
      answerReveal.onRevealComplete();
    }, REVEAL_COMPLETE_MS);
  }, [answerReveal, revealPhase, clearRevealTimers, scheduleReveal]);

  const useStagedReveal = Boolean(answerReveal);
  const showAnswer =
    !useStagedReveal || revealPhase === "answer" || revealPhase === "complete";
  const showFooter = !useStagedReveal
    ? true
    : revealPhase === "complete" || Boolean(answerReveal?.revealed);
  const showShowMe =
    useStagedReveal && revealPhase === "hidden" && !answerReveal?.revealed;
  const investigationActive =
    useStagedReveal &&
    (revealPhase === "q-shrink" || revealPhase === "a-arrive" || revealPhase === "answer");
  const answerEmerging = useStagedReveal && revealPhase === "answer";
  const cardHighlight = answerEmerging;
  const answerDominant =
    useStagedReveal &&
    (revealPhase === "complete" || Boolean(answerReveal?.revealed));

  return (
    <motion.div className="relative mx-auto w-full max-w-2xl">
      <motion.div
        initial={false}
        animate={
          isNeon
            ? false
            : isJewel
              ? false
              : {
                  boxShadow: [
                    `0 22px 64px -36px rgba(0,0,0,0.72), 0 0 0 2px ${theme.border}, 0 0 24px -18px ${theme.glow}`,
                    `0 28px 76px -32px rgba(0,0,0,0.78), 0 0 0 2px ${pulsePeakBorder}, 0 0 32px -16px ${theme.glow}`,
                    `0 22px 64px -36px rgba(0,0,0,0.72), 0 0 0 2px ${theme.border}, 0 0 24px -18px ${theme.glow}`
                  ]
                }
        }
        transition={
          isNeon || isJewel
            ? undefined
            : { duration: 5.5, repeat: Infinity, ease: "easeInOut" }
        }
        className={
          isNeon
            ? "relative flex flex-col overflow-visible rounded-[1.35rem] border-2 bg-[rgba(6,6,12,0.97)] backdrop-blur-xl"
            : `relative flex flex-col overflow-visible ${innerRounded} border-2 bg-[rgba(4,4,9,0.98)] backdrop-blur-md`
        }
        style={
          isNeon
            ? {
                borderColor: theme.hi,
                boxShadow: `0 0 0 1px ${theme.border}, 0 0 28px -4px ${theme.glow}, 0 0 0 1.5px ${theme.hi}`
              }
            : isJewel
              ? {
                  borderColor: JEWEL_CARD_BORDER,
                  background: JEWEL_CARD_BG,
                  boxShadow: JEWEL_CARD_SHADOW
                }
              : {
                  background: outerRimGradient(theme),
                  boxShadow: `0 0 20px -12px ${theme.glow}`
                }
        }
      >
        <motion.div
          className={
            isNeon
              ? "relative flex flex-col overflow-visible"
              : isJewel
                ? "relative flex flex-col overflow-visible"
                : `relative flex flex-col overflow-visible rounded-[1.22rem] border-2 border-white/[0.14] bg-[rgba(6,6,12,0.97)] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-20px_40px_-24px_rgba(0,0,0,0.5)] backdrop-blur-xl ${innerRounded}`
          }
          style={
            isNeon || isJewel
              ? undefined
              : {
                  borderTopColor: theme.rim,
                  borderLeftColor: theme.border,
                  borderRightColor: theme.border,
                  borderBottomColor: theme.borderSoft,
                  boxShadow: `0 0 0 1px ${theme.borderSoft}, 0 0 18px -14px ${theme.glow}, inset 0 0 60px -40px ${theme.whyGlow}`
                }
          }
        >
          {!isJewel ? (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background: isNeon
                  ? `radial-gradient(100% 55% at 50% -8%, ${theme.glowSoft}, transparent 52%)`
                  : `radial-gradient(100% 55% at 50% -8%, ${theme.glowSoft}, transparent 52%), radial-gradient(90% 50% at 100% 30%, ${theme.whyWash}, transparent 48%), radial-gradient(80% 45% at 0% 85%, ${theme.glowSoft}, transparent 45%)`
              }}
            />
          ) : null}
          {!isJewel ? (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)",
                backgroundSize: "20px 20px"
              }}
            />
          ) : null}

          <InvestigationCardHighlight
            theme={theme}
            active={cardHighlight}
            roundedClass={innerRounded}
          />

          <header
            className={[
              "relative z-[1] shrink-0 border-b px-4 sm:px-5",
              answerDominant ? "py-2.5 sm:py-3" : "py-3.5 sm:py-4"
            ].join(" ")}
            style={{ borderColor: isJewel ? JEWEL_SECTION_DIVIDER : theme.borderSoft }}
          >
            <motion.div
              className={[
                "flex items-center justify-between gap-3",
                answerDominant ? "min-h-[2rem]" : "min-h-[2.25rem] sm:min-h-[2.5rem]"
              ].join(" ")}
            >
              <p
                className={[
                  "shrink-0 font-medium uppercase",
                  isJewel
                    ? "text-[9.5px] tracking-[0.22em] text-ink-2"
                    : "text-[10px] font-bold tracking-[0.28em]"
                ].join(" ")}
                style={{ color: isJewel ? undefined : theme.hi }}
              >
                Card {cardIndex} of {cardTotal}
              </p>
              <div className="flex shrink-0 items-center justify-end gap-2">
                {trailSlot}
                <HeaderCompanyName name={companyName} theme={theme} />
              </div>
            </motion.div>
            <motion.div
              className={[
                "relative overflow-hidden rounded-full bg-white/[0.04]",
                isJewel
                  ? answerDominant
                    ? "mt-2 h-[3px]"
                    : "mt-2.5 h-[3px]"
                  : answerDominant
                    ? "mt-2 h-1.5 ring-2 ring-offset-0"
                    : "mt-3 h-1.5 ring-2 ring-offset-0"
              ].join(" ")}
              style={isJewel ? undefined : { boxShadow: `0 0 0 2px ${theme.borderSoft}` }}
              role="presentation"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.85, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background: isJewel
                    ? `linear-gradient(90deg, ${theme.hi}88, ${theme.hi})`
                    : progressBarGradient(theme),
                  boxShadow: isJewel
                    ? "none"
                    : `0 0 18px ${theme.glow}, 0 0 8px rgba(255,255,255,0.25)`
                }}
              />
            </motion.div>
          </header>

          <motion.section
            layout
            className={[
              "relative z-[1] shrink-0 border-b px-4 sm:px-5",
              answerDominant ? "py-2 sm:py-2.5" : "py-4 sm:py-5"
            ].join(" ")}
            style={{ borderColor: isJewel ? JEWEL_SECTION_DIVIDER : theme.borderSoft }}
          >
            <h2 className="sr-only">Question</h2>
            <motion.div
              layout
              className={
                answerDominant
                  ? "flex items-center gap-2.5 sm:gap-3"
                  : "flex gap-4 sm:gap-6"
              }
            >
              {investigationActive ? (
                <InvestigationQABadge
                  theme={theme}
                  phase={revealPhase as "q-shrink" | "a-arrive" | "answer"}
                  className="mt-0.5"
                />
              ) : (
                <CircleBadge
                  label="Q"
                  theme={theme}
                  emphasis={answerDominant ? "muted" : "default"}
                  size={answerDominant ? "compact" : "default"}
                  className={answerDominant ? "shrink-0" : undefined}
                />
              )}
              <motion.div className={`min-w-0 flex-1 ${answerDominant ? "" : "pt-0.5"}`}>
                <motion.p
                  layout
                  animate={{ opacity: answerDominant ? 0.82 : 1 }}
                  transition={{ duration: HIERARCHY_SHIFT_MS, ease: REVEAL_EASE }}
                  className={[
                    "font-[var(--font-grotesk)] tracking-tight text-ink-0",
                    answerDominant
                      ? "text-[13px] font-medium leading-snug text-ink-0/82 sm:text-[14px]"
                      : [
                          "text-balance font-semibold leading-snug",
                          answerReveal
                            ? "text-[clamp(1.12rem,3.2vw,1.57rem)] sm:text-[clamp(1.18rem,2.8vw,1.68rem)]"
                            : "text-[clamp(1.05rem,3vw,1.45rem)] sm:text-[clamp(1.1rem,2.6vw,1.55rem)]"
                        ].join(" ")
                  ].join(" ")}
                >
                  {questionText}
                </motion.p>
                {showShowMe ? (
                  <div className="mt-7 flex justify-center sm:mt-8">
                    <ShowMeButton theme={theme} onClick={startReveal} />
                  </div>
                ) : null}
              </motion.div>
            </motion.div>
          </motion.section>

          <AnimatePresence initial={false}>
            {showAnswer ? (
              <motion.section
                key="quest-answer"
                layout
                className="relative z-[1] flex-1"
                initial={answerEmerging ? { opacity: 0, y: 10 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: ANSWER_REVEAL_MS, ease: REVEAL_EASE }}
              >
                {!isJewel ? (
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    initial={false}
                    animate={{ opacity: answerDominant ? 1 : 0 }}
                    transition={{ duration: HIERARCHY_SHIFT_MS, ease: REVEAL_EASE }}
                    style={{
                      background: `radial-gradient(ellipse 92% 78% at 40% 38%, ${theme.glowSoft}, transparent 70%)`
                    }}
                  />
                ) : null}
                <h2 className="sr-only">Answer</h2>
                <motion.div
                  layout
                  className={[
                    "relative flex items-start",
                    answerDominant
                      ? "gap-4 px-4 py-4 sm:gap-5 sm:px-5 sm:py-6"
                      : "gap-4 px-4 py-4 sm:gap-5 sm:px-5 sm:py-5"
                  ].join(" ")}
                  animate={{
                    filter: answerDominant
                      ? "brightness(1.06) contrast(1.04)"
                      : "brightness(1) contrast(1)"
                  }}
                  transition={{ duration: HIERARCHY_SHIFT_MS, ease: REVEAL_EASE }}
                >
                  {investigationActive ? (
                    <div className={`${BADGE_SIZE_CLASS} shrink-0`} aria-hidden />
                  ) : (
                    <CircleBadge
                      label="A"
                      theme={theme}
                      className="shrink-0"
                      emphasis={answerDominant ? "hero" : "default"}
                    />
                  )}
                  <motion.div layout className="min-w-0 flex-1 pt-0.5">
                    {answerSlot}
                  </motion.div>
                </motion.div>
              </motion.section>
            ) : null}
          </AnimatePresence>

          {showFooter ? (
            <footer
              className={[
                "relative z-[1] shrink-0 border-t bg-black/20 px-4 sm:px-5",
                answerDominant ? "py-2.5 sm:py-3" : "py-3.5 sm:py-4"
              ].join(" ")}
              style={{ borderColor: isJewel ? JEWEL_SECTION_DIVIDER : theme.border }}
            >
              <motion.div className="flex flex-wrap items-center gap-3">{footerSlot}</motion.div>
            </footer>
          ) : null}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export const BusinessQuestTemplateFrame = PillarQuestTemplateFrame;

export const BUSINESS_QUEST_TEMPLATE_SRC = "/screens/business-quest-template.webp";
