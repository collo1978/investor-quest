"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

import {
  MISSION_CARD_ACCENT_STYLES,
  MISSION_CARD_REVEAL_CARD_HOLD_MS,
  MISSION_CARD_REVEAL_CARDS,
  MISSION_CARD_REVEAL_CHAR_MS,
  MISSION_CARD_REVEAL_FINALE,
  MISSION_CARD_REVEAL_FINALE_FADE_MS,
  MISSION_CARD_REVEAL_HEADING_DELAY_MS,
  type MissionRevealCard
} from "@/lib/schools/missionCardRevealContent";
import {
  playMissionBriefKeystroke,
  primeMissionBriefAudio,
  stopMissionBriefAudio
} from "@/lib/schools/missionBriefTypewriterSound";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const CARD_COUNT = MISSION_CARD_REVEAL_CARDS.length;

const STAR_MOTES: ReadonlyArray<{
  x: number;
  y: number;
  size: number;
  opacity: number;
  dur: number;
  delay: number;
}> = [
  { x: 9, y: 14, size: 1.2, opacity: 0.38, dur: 17, delay: 0 },
  { x: 22, y: 32, size: 1, opacity: 0.28, dur: 20, delay: 0.5 },
  { x: 35, y: 10, size: 1.1, opacity: 0.34, dur: 18, delay: 1.0 },
  { x: 48, y: 24, size: 1, opacity: 0.26, dur: 22, delay: 0.3 },
  { x: 61, y: 18, size: 1.2, opacity: 0.32, dur: 16, delay: 0.8 },
  { x: 74, y: 36, size: 1, opacity: 0.3, dur: 19, delay: 1.3 },
  { x: 86, y: 12, size: 1.1, opacity: 0.27, dur: 21, delay: 0.6 },
  { x: 16, y: 68, size: 1, opacity: 0.24, dur: 23, delay: 1.1 },
  { x: 44, y: 78, size: 1.2, opacity: 0.22, dur: 24, delay: 0.4 },
  { x: 72, y: 70, size: 1, opacity: 0.25, dur: 18, delay: 1.5 }
];

type CardPhase = "enter" | "heading" | "typing" | "hold" | "exit" | "done";

function useMissionCardReveal(
  cards: readonly MissionRevealCard[],
  active: boolean,
  instant: boolean,
  soundEnabled: boolean
) {
  const [cardIndex, setCardIndex] = useState(0);
  const [phase, setPhase] = useState<CardPhase>("enter");
  const [headingVisible, setHeadingVisible] = useState(false);
  const [bodyCharCount, setBodyCharCount] = useState(0);
  const timerRef = useRef<number | null>(null);
  const cardIndexRef = useRef(0);
  const bodyCharCountRef = useRef(0);
  const phaseRef = useRef<CardPhase>("enter");
  const cardsRef = useRef(cards);
  const soundEnabledRef = useRef(soundEnabled);

  cardsRef.current = cards;
  soundEnabledRef.current = soundEnabled;

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const schedule = useCallback(
    (fn: () => void, ms: number) => {
      clearTimer();
      timerRef.current = window.setTimeout(fn, ms);
    },
    [clearTimer]
  );

  const currentCard = cards[cardIndex] ?? null;

  const reset = useCallback(() => {
    clearTimer();
    cardIndexRef.current = 0;
    bodyCharCountRef.current = 0;
    phaseRef.current = "enter";
    setCardIndex(0);
    setBodyCharCount(0);
    setHeadingVisible(false);
    setPhase("enter");
  }, [clearTimer]);

  const goToFinaleRef = useRef<() => void>(() => {});
  const startTypingRef = useRef<() => void>(() => {});
  const tickBodyRef = useRef<() => void>(() => {});
  const advanceCardRef = useRef<() => void>(() => {});

  goToFinaleRef.current = () => {
    phaseRef.current = "done";
    setPhase("done");
    setCardIndex(cardsRef.current.length);
    cardIndexRef.current = cardsRef.current.length;
  };

  advanceCardRef.current = () => {
    const next = cardIndexRef.current + 1;
    if (next >= cardsRef.current.length) {
      goToFinaleRef.current();
      return;
    }

    phaseRef.current = "exit";
    setPhase("exit");
    schedule(() => {
      cardIndexRef.current = next;
      setCardIndex(next);
      bodyCharCountRef.current = 0;
      setBodyCharCount(0);
      setHeadingVisible(false);
      phaseRef.current = "enter";
      setPhase("enter");
      schedule(() => {
        phaseRef.current = "heading";
        setPhase("heading");
        setHeadingVisible(true);
        schedule(() => startTypingRef.current(), MISSION_CARD_REVEAL_HEADING_DELAY_MS);
      }, 480);
    }, 380);
  };

  tickBodyRef.current = () => {
    const card = cardsRef.current[cardIndexRef.current];
    if (!card) {
      goToFinaleRef.current();
      return;
    }

    if (bodyCharCountRef.current < card.body.length) {
      bodyCharCountRef.current += 1;
      setBodyCharCount(bodyCharCountRef.current);
      if (soundEnabledRef.current) {
        playMissionBriefKeystroke({
          char: card.body.charAt(bodyCharCountRef.current - 1)
        });
      }
      schedule(() => tickBodyRef.current(), MISSION_CARD_REVEAL_CHAR_MS);
      return;
    }

    phaseRef.current = "hold";
    setPhase("hold");
    schedule(() => advanceCardRef.current(), MISSION_CARD_REVEAL_CARD_HOLD_MS);
  };

  startTypingRef.current = () => {
    phaseRef.current = "typing";
    setPhase("typing");
    schedule(() => tickBodyRef.current(), 80);
  };

  const beginFirstCard = useCallback(() => {
    schedule(() => {
      phaseRef.current = "heading";
      setPhase("heading");
      setHeadingVisible(true);
      schedule(() => startTypingRef.current(), MISSION_CARD_REVEAL_HEADING_DELAY_MS);
    }, 480);
  }, [schedule]);

  const revealCurrent = useCallback(() => {
    if (phaseRef.current === "done") return;
    clearTimer();

    const card = cardsRef.current[cardIndexRef.current];
    if (!card) return;

    if (phaseRef.current === "enter" || phaseRef.current === "heading") {
      setHeadingVisible(true);
      phaseRef.current = "typing";
      setPhase("typing");
      bodyCharCountRef.current = card.body.length;
      setBodyCharCount(card.body.length);
      phaseRef.current = "hold";
      setPhase("hold");
      schedule(() => advanceCardRef.current(), 200);
      return;
    }

    if (phaseRef.current === "typing") {
      bodyCharCountRef.current = card.body.length;
      setBodyCharCount(card.body.length);
      phaseRef.current = "hold";
      setPhase("hold");
      schedule(() => advanceCardRef.current(), 200);
      return;
    }

    if (phaseRef.current === "hold") {
      advanceCardRef.current();
      return;
    }

    if (phaseRef.current === "exit") {
      advanceCardRef.current();
    }
  }, [clearTimer, schedule]);

  const skipToEnd = useCallback(() => {
    clearTimer();
    goToFinaleRef.current();
  }, [clearTimer]);

  useEffect(() => {
    if (!active) return;
    reset();

    if (instant) {
      skipToEnd();
      return;
    }

    beginFirstCard();

    return () => clearTimer();
  }, [active, beginFirstCard, clearTimer, instant, reset, skipToEnd]);

  const bodyDisplay =
    currentCard && phase !== "done"
      ? currentCard.body.slice(0, bodyCharCount)
      : "";

  const isTypingBody = phase === "typing" && bodyCharCount < (currentCard?.body.length ?? 0);

  return {
    cardIndex,
    currentCard,
    phase,
    headingVisible,
    bodyDisplay,
    isTypingBody,
    done: phase === "done",
    revealCurrent,
    skipToEnd,
    reset
  };
}

function Starfield({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="iq-mcr-glow absolute inset-0" />
      {STAR_MOTES.map((mote, index) => (
        <motion.span
          key={index}
          className="absolute rounded-full bg-violet-200/75"
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
                  y: [0, -3, 0]
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

function MissionRevealCardPanel({
  card,
  headingVisible,
  bodyDisplay,
  isTypingBody
}: {
  card: MissionRevealCard;
  headingVisible: boolean;
  bodyDisplay: string;
  isTypingBody: boolean;
}) {
  const accent = MISSION_CARD_ACCENT_STYLES[card.accent];
  const panelStyle = {
    ["--iq-mcr-border" as string]: accent.border,
    ["--iq-mcr-glow" as string]: accent.glow,
    ["--iq-mcr-heading" as string]: accent.heading
  } as CSSProperties;

  return (
    <motion.article
      layout
      style={panelStyle}
      className="iq-mcr-card relative w-full max-w-lg px-6 py-7 sm:px-8 sm:py-8"
      initial={{ opacity: 0, y: 48, rotateX: 18, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      exit={{ opacity: 0, y: -36, rotateX: -12, scale: 0.96 }}
      transition={{ duration: 0.48, ease: EASE_OUT }}
    >
      <div className="iq-mcr-card-index" aria-hidden>
        {String(MISSION_CARD_REVEAL_CARDS.findIndex((c) => c.id === card.id) + 1).padStart(2, "0")}
        <span className="opacity-40"> / {String(CARD_COUNT).padStart(2, "0")}</span>
      </div>

      <motion.h2
        initial={false}
        animate={
          headingVisible
            ? { opacity: 1, y: 0, filter: "blur(0px)" }
            : { opacity: 0, y: 10, filter: "blur(4px)" }
        }
        transition={{ duration: 0.38, ease: EASE_OUT }}
        className="iq-mcr-card-heading font-[var(--font-grotesk)]"
      >
        {card.heading}
      </motion.h2>

      <p className="iq-mcr-card-body mt-4 font-[var(--font-inter)]">
        {bodyDisplay}
        {isTypingBody ? (
          <span className="iq-mcr-cursor" aria-hidden>
            |
          </span>
        ) : null}
      </p>
    </motion.article>
  );
}

/** Standalone mission card reveal briefing (preview only). */
export function SchoolsMissionCardRevealScreen() {
  const reduceMotion = useReducedMotion();
  const [runId, setRunId] = useState(0);
  const [screenPhase, setScreenPhase] = useState<"cards" | "finale">("cards");
  const [cardsExiting, setCardsExiting] = useState(false);
  const finaleTimerRef = useRef<number | null>(null);

  const soundEnabled = screenPhase === "cards" && !reduceMotion;

  const {
    cardIndex,
    currentCard,
    headingVisible,
    bodyDisplay,
    isTypingBody,
    done,
    revealCurrent,
    skipToEnd,
    reset
  } = useMissionCardReveal(
    MISSION_CARD_REVEAL_CARDS,
    screenPhase === "cards",
    !!reduceMotion,
    soundEnabled
  );

  const handleReplay = useCallback(() => {
    if (finaleTimerRef.current != null) {
      window.clearTimeout(finaleTimerRef.current);
      finaleTimerRef.current = null;
    }
    setCardsExiting(false);
    setScreenPhase("cards");
    reset();
    setRunId((id) => id + 1);
    primeMissionBriefAudio();
  }, [reset]);

  const handleSkip = useCallback(() => {
    skipToEnd();
  }, [skipToEnd]);

  useEffect(() => {
    if (!done || screenPhase !== "cards") return;

    setCardsExiting(true);
    finaleTimerRef.current = window.setTimeout(() => {
      setScreenPhase("finale");
      setCardsExiting(false);
    }, reduceMotion ? 0 : MISSION_CARD_REVEAL_FINALE_FADE_MS);

    return () => {
      if (finaleTimerRef.current != null) {
        window.clearTimeout(finaleTimerRef.current);
      }
    };
  }, [done, reduceMotion, screenPhase]);

  useEffect(() => {
    if (reduceMotion) return;

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

  return (
    <main
      key={runId}
      className="iq-mcr-screen relative h-[100dvh] w-full overflow-hidden bg-[#05070a]"
      aria-label="Mission card reveal preview"
    >
      <Starfield reduceMotion={reduceMotion} />

      <div className="pointer-events-none absolute inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-30 flex justify-between px-4">
        <button type="button" onClick={handleReplay} className="iq-mcr-ctrl pointer-events-auto">
          Replay
        </button>
        {screenPhase === "cards" ? (
          <button type="button" onClick={handleSkip} className="iq-mcr-ctrl pointer-events-auto">
            Skip
          </button>
        ) : (
          <span aria-hidden className="w-[4.5rem]" />
        )}
      </div>

      {screenPhase === "cards" ? (
        <div className="iq-mcr-dots pointer-events-none absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-0 right-0 z-20 flex justify-center gap-2">
          {MISSION_CARD_REVEAL_CARDS.map((card, index) => (
            <span
              key={card.id}
              className={[
                "h-1.5 rounded-full transition-all duration-300",
                index === cardIndex
                  ? "w-6 bg-violet-300/90"
                  : index < cardIndex
                    ? "w-1.5 bg-violet-300/45"
                    : "w-1.5 bg-white/18"
              ].join(" ")}
              aria-hidden
            />
          ))}
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        {screenPhase === "cards" ? (
          <motion.button
            key="cards"
            type="button"
            aria-label="Reveal current mission card"
            initial={{ opacity: 1 }}
            animate={{ opacity: cardsExiting ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MISSION_CARD_REVEAL_FINALE_FADE_MS / 1000, ease: EASE_OUT }}
            onClick={revealCurrent}
            className="pointer-events-auto absolute inset-0 z-10 flex items-center justify-center px-4 py-20"
            style={{ perspective: 1200 }}
          >
            <AnimatePresence mode="wait">
              {currentCard && !done ? (
                <MissionRevealCardPanel
                  key={currentCard.id}
                  card={currentCard}
                  headingVisible={headingVisible}
                  bodyDisplay={bodyDisplay}
                  isTypingBody={isTypingBody}
                />
              ) : null}
            </AnimatePresence>
          </motion.button>
        ) : (
          <motion.div
            key="finale"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, ease: EASE_OUT }}
            className="pointer-events-auto absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.62, ease: EASE_OUT, delay: 0.06 }}
              className="iq-mcr-finale-title font-[var(--font-grotesk)]"
            >
              {MISSION_CARD_REVEAL_FINALE.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.48, ease: EASE_OUT, delay: 0.24 }}
              className="iq-mcr-finale-tagline mt-3 font-[var(--font-grotesk)]"
            >
              {MISSION_CARD_REVEAL_FINALE.tagline}
            </motion.p>

            <motion.button
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.42 }}
              className="iq-mcr-finale-cta mt-10 font-[var(--font-grotesk)]"
              onClick={() => {
                /* Standalone preview — no onboarding hookup yet. */
              }}
            >
              {MISSION_CARD_REVEAL_FINALE.cta}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
