"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import {
  buildMissionBriefCardTypeQueue,
  flattenMissionBriefParts,
  MISSION_BRIEF_CARDS,
  MISSION_BRIEF_CARDS_CARD_ENTER_MS,
  MISSION_BRIEF_CARDS_CHAR_MS,
  MISSION_BRIEF_CARDS_CONTINUE_LABEL,
  MISSION_BRIEF_CARDS_LINE_GAP_MS,
  missionBriefPartsLength,
  type MissionBriefCard,
  type MissionBriefTextPart,
  type MissionBriefTypedLine
} from "@/lib/schools/missionBriefCardsContent";
import { SCHOOLS_LOGO_REVEAL_ROUTE } from "@/lib/schools/schoolsLogoRevealContent";
import { resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";
import {
  playMissionBriefKeystroke,
  primeMissionBriefAudio,
  stopMissionBriefAudio
} from "@/lib/schools/missionBriefTypewriterSound";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const CARD_COUNT = MISSION_BRIEF_CARDS.length;

const STAR_MOTES: ReadonlyArray<{
  x: number;
  y: number;
  size: number;
  opacity: number;
  dur: number;
  delay: number;
}> = [
  { x: 10, y: 15, size: 1.1, opacity: 0.34, dur: 18, delay: 0 },
  { x: 24, y: 28, size: 1, opacity: 0.26, dur: 21, delay: 0.5 },
  { x: 38, y: 11, size: 1.2, opacity: 0.3, dur: 19, delay: 1.0 },
  { x: 52, y: 24, size: 1, opacity: 0.24, dur: 22, delay: 0.3 },
  { x: 66, y: 16, size: 1.1, opacity: 0.32, dur: 17, delay: 0.8 },
  { x: 80, y: 34, size: 1, opacity: 0.28, dur: 20, delay: 1.3 },
  { x: 14, y: 66, size: 1, opacity: 0.22, dur: 23, delay: 0.6 },
  { x: 46, y: 76, size: 1.1, opacity: 0.24, dur: 24, delay: 1.1 },
  { x: 74, y: 70, size: 1, opacity: 0.26, dur: 18, delay: 0.4 }
];

type CardPhase = "enter" | "typing" | "ready";

function BriefingStarfield({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="iq-mbc-glow absolute inset-0" />
      {STAR_MOTES.map((mote, index) => (
        <motion.span
          key={index}
          className="absolute rounded-full bg-sky-200/65"
          style={{
            left: `${mote.x}%`,
            top: `${mote.y}%`,
            width: mote.size,
            height: mote.size,
            opacity: mote.opacity
          }}
          animate={
            reduceMotion
              ? undefined
              : {
                  opacity: [mote.opacity * 0.45, mote.opacity, mote.opacity * 0.45],
                  y: [0, -2, 0]
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: mote.dur,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: mote.delay
                }
          }
        />
      ))}
    </div>
  );
}

function MissionBriefTypedText({
  parts,
  charCount,
  showCursor,
  highlightClassName,
  allowHighlights = true
}: {
  parts: readonly MissionBriefTextPart[];
  charCount: number;
  showCursor: boolean;
  highlightClassName?: string;
  allowHighlights?: boolean;
}) {
  let remaining = charCount;
  const nodes: ReactNode[] = [];

  parts.forEach((part, index) => {
    if (remaining <= 0) return;

    const take = Math.min(remaining, part.text.length);
    const slice = part.text.slice(0, take);
    if (!slice) return;

    if (allowHighlights && part.highlight && highlightClassName) {
      nodes.push(
        <span key={index} className={highlightClassName}>
          {slice}
        </span>
      );
    } else {
      nodes.push(<span key={index}>{slice}</span>);
    }

    remaining -= take;
  });

  return (
    <>
      {nodes}
      {showCursor ? (
        <span className="iq-mbc-cursor" aria-hidden>
          |
        </span>
      ) : null}
    </>
  );
}

function getTypedCharCount(
  lineIndex: number,
  typingLineIndex: number,
  typingCharCount: number,
  phase: CardPhase,
  parts: readonly MissionBriefTextPart[]
): number {
  const fullLength = missionBriefPartsLength(parts);
  if (phase === "ready" || lineIndex < typingLineIndex) return fullLength;
  if (lineIndex === typingLineIndex) return typingCharCount;
  return 0;
}

function shouldShowTypedLine(
  lineIndex: number,
  typingLineIndex: number,
  phase: CardPhase
): boolean {
  if (phase === "ready") return true;
  if (phase === "enter") return false;
  return lineIndex <= typingLineIndex;
}

function MissionBriefCardPanel({
  card,
  cardIndex,
  phase,
  typeQueue,
  typingLineIndex,
  typingCharCount,
  onContinue,
  continueEnabled
}: {
  card: MissionBriefCard;
  cardIndex: number;
  phase: CardPhase;
  typeQueue: MissionBriefTypedLine[];
  typingLineIndex: number;
  typingCharCount: number;
  onContinue: () => void;
  continueEnabled: boolean;
}) {
  const showTyping = phase === "typing";
  const eyebrowLine = typeQueue.find((line) => line.variant === "eyebrow");
  const eyebrowIndex = eyebrowLine ? typeQueue.indexOf(eyebrowLine) : -1;

  return (
    <motion.article
      key={card.id}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.98 }}
      transition={{ duration: MISSION_BRIEF_CARDS_CARD_ENTER_MS / 1000, ease: EASE_OUT }}
      className="iq-mbc-card flex w-full max-w-lg flex-col px-6 py-7 sm:px-8 sm:py-8"
    >
      <div className="iq-mbc-card-meta mb-4 flex items-center justify-between gap-3">
        {eyebrowLine ? (
          <span className="min-h-[1.25rem] flex-1">
            {shouldShowTypedLine(eyebrowIndex, typingLineIndex, phase) ? (
              <p className="iq-mbc-eyebrow m-0 font-[var(--font-grotesk)]">
                <MissionBriefTypedText
                  parts={eyebrowLine.parts}
                  charCount={getTypedCharCount(
                    eyebrowIndex,
                    typingLineIndex,
                    typingCharCount,
                    phase,
                    eyebrowLine.parts
                  )}
                  showCursor={showTyping && typingLineIndex === eyebrowIndex}
                  allowHighlights={false}
                />
              </p>
            ) : null}
          </span>
        ) : (
          <span aria-hidden className="h-4" />
        )}
        <span className="iq-mbc-step font-[var(--font-grotesk)]" aria-hidden>
          {String(cardIndex + 1).padStart(2, "0")} / {String(CARD_COUNT).padStart(2, "0")}
        </span>
      </div>

      <div className="space-y-5">
        {typeQueue.map((line, index) => {
          if (line.variant === "eyebrow") return null;
          if (!shouldShowTypedLine(index, typingLineIndex, phase)) return null;

          const charCount = getTypedCharCount(
            index,
            typingLineIndex,
            typingCharCount,
            phase,
            line.parts
          );
          const showCursor = showTyping && index === typingLineIndex;

          if (line.variant === "heading") {
            return (
              <h2 key={line.id} className="iq-mbc-heading m-0 font-[var(--font-grotesk)]">
                <MissionBriefTypedText
                  parts={line.parts}
                  charCount={charCount}
                  showCursor={showCursor}
                  allowHighlights={false}
                />
              </h2>
            );
          }

          return (
            <p key={line.id} className="iq-mbc-body-line m-0 font-[var(--font-inter)]">
              <MissionBriefTypedText
                parts={line.parts}
                charCount={charCount}
                showCursor={showCursor}
                highlightClassName="iq-mbc-highlight iq-mbc-highlight--body"
              />
            </p>
          );
        })}
      </div>

      <motion.div
        initial={false}
        animate={continueEnabled ? { opacity: 1, y: 0 } : { opacity: 0.35, y: 10 }}
        transition={{ duration: 0.38, ease: EASE_OUT }}
        className={`mt-8 ${continueEnabled ? "" : "pointer-events-none"}`}
      >
        <button
          type="button"
          onClick={onContinue}
          disabled={!continueEnabled}
          aria-disabled={!continueEnabled}
          tabIndex={continueEnabled ? 0 : -1}
          className="iq-mbc-continue font-[var(--font-grotesk)]"
        >
          {MISSION_BRIEF_CARDS_CONTINUE_LABEL}
        </button>
      </motion.div>

      <span className="sr-only" aria-live="polite">
        {phase === "ready" ? "Continue to next briefing card" : "Briefing card loading"}
      </span>
    </motion.article>
  );
}

/** Manual-advance mission briefing cards (standalone onboarding preview). */
export function SchoolsMissionBriefCardsScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [runId, setRunId] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [cardPhase, setCardPhase] = useState<CardPhase>("enter");
  const [typingLineIndex, setTypingLineIndex] = useState(0);
  const [typingCharCount, setTypingCharCount] = useState(0);
  const timerRef = useRef<number | null>(null);
  const cardIndexRef = useRef(cardIndex);
  const cardPhaseRef = useRef(cardPhase);
  const reduceMotionRef = useRef(reduceMotion);
  const soundEnabledRef = useRef(false);
  const startCardTypewriterRef = useRef<(card: MissionBriefCard) => void>(() => {});

  const currentCard = MISSION_BRIEF_CARDS[cardIndex] ?? null;
  const typeQueue = useMemo(
    () => (currentCard ? buildMissionBriefCardTypeQueue(currentCard) : []),
    [currentCard]
  );
  const soundEnabled = reduceMotion !== true;

  cardIndexRef.current = cardIndex;
  cardPhaseRef.current = cardPhase;
  reduceMotionRef.current = reduceMotion;
  soundEnabledRef.current = soundEnabled;

  const clearTimers = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetCardAnim = useCallback(() => {
    clearTimers();
    setCardPhase("enter");
    setTypingLineIndex(0);
    setTypingCharCount(0);
  }, [clearTimers]);

  const handleReplay = useCallback(() => {
    clearTimers();
    setCardIndex(0);
    resetCardAnim();
    setRunId((id) => id + 1);
    primeMissionBriefAudio();
  }, [clearTimers, resetCardAnim]);

  const goToLogoReveal = useCallback(() => {
    clearTimers();
    router.push(resolveSchoolsLearnerHref(SCHOOLS_LOGO_REVEAL_ROUTE, pathname));
  }, [clearTimers, pathname, router]);

  const handleSkip = useCallback(() => {
    goToLogoReveal();
  }, [goToLogoReveal]);

  startCardTypewriterRef.current = (card: MissionBriefCard) => {
    const queue = buildMissionBriefCardTypeQueue(card);

    const finish = () => {
      setTypingLineIndex(queue.length);
      setTypingCharCount(0);
      setCardPhase("ready");
    };

    if (reduceMotionRef.current === true) {
      finish();
      return;
    }

    setCardPhase("typing");
    setTypingLineIndex(0);
    setTypingCharCount(0);

    let lineIndex = 0;
    let charCount = 0;

    const tick = () => {
      const line = queue[lineIndex];
      if (!line) {
        finish();
        return;
      }

      charCount += 1;
      setTypingLineIndex(lineIndex);
      setTypingCharCount(charCount);

      const flat = flattenMissionBriefParts(line.parts);
      if (soundEnabledRef.current) {
        playMissionBriefKeystroke({ char: flat.charAt(charCount - 1) });
      }

      const fullLength = missionBriefPartsLength(line.parts);
      if (charCount >= fullLength) {
        lineIndex += 1;
        charCount = 0;

        if (lineIndex >= queue.length) {
          finish();
          return;
        }

        timerRef.current = window.setTimeout(tick, MISSION_BRIEF_CARDS_LINE_GAP_MS);
        return;
      }

      timerRef.current = window.setTimeout(tick, MISSION_BRIEF_CARDS_CHAR_MS);
    };

    timerRef.current = window.setTimeout(tick, MISSION_BRIEF_CARDS_CHAR_MS);
  };

  useEffect(() => {
    if (!currentCard) return;

    resetCardAnim();
    timerRef.current = window.setTimeout(() => {
      startCardTypewriterRef.current(currentCard);
    }, MISSION_BRIEF_CARDS_CARD_ENTER_MS);

    return () => clearTimers();
  }, [cardIndex, clearTimers, currentCard, resetCardAnim, runId]);

  useEffect(() => {
    if (reduceMotion === true) return;

    primeMissionBriefAudio();
    const resumeOnGesture = () => primeMissionBriefAudio();
    window.addEventListener("pointerdown", resumeOnGesture, { passive: true });
    window.addEventListener("keydown", resumeOnGesture);

    return () => {
      window.removeEventListener("pointerdown", resumeOnGesture);
      window.removeEventListener("keydown", resumeOnGesture);
      stopMissionBriefAudio();
    };
  }, [reduceMotion, runId]);

  const handleContinue = useCallback(() => {
    if (cardPhaseRef.current !== "ready") return;

    if (cardIndexRef.current >= CARD_COUNT - 1) {
      goToLogoReveal();
      return;
    }

    clearTimers();
    setCardIndex((index) => index + 1);
  }, [clearTimers, goToLogoReveal]);

  const continueEnabled = cardPhase === "ready";

  return (
    <main
      key={runId}
      className="iq-mbc-screen relative h-[100dvh] w-full overflow-hidden bg-[#05070a]"
      aria-label="Mission brief cards"
    >
      <BriefingStarfield reduceMotion={reduceMotion} />

      <div className="pointer-events-none absolute inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-30 flex justify-between px-4">
        <button type="button" onClick={handleReplay} className="iq-mbc-ctrl pointer-events-auto">
          Replay
        </button>
        <button type="button" onClick={handleSkip} className="iq-mbc-ctrl pointer-events-auto">
          Skip
        </button>
      </div>

      {currentCard ? (
        <div className="pointer-events-auto absolute inset-0 z-10 flex items-center justify-center px-5 py-20">
          <AnimatePresence mode="wait">
            <MissionBriefCardPanel
              key={currentCard.id}
              card={currentCard}
              cardIndex={cardIndex}
              phase={cardPhase}
              typeQueue={typeQueue}
              typingLineIndex={typingLineIndex}
              typingCharCount={typingCharCount}
              onContinue={handleContinue}
              continueEnabled={continueEnabled}
            />
          </AnimatePresence>
        </div>
      ) : null}
    </main>
  );
}
