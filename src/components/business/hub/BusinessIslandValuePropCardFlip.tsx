"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { useOptionalGame } from "@/components/GameProvider";
import { XP_DIG_DEEPER_CHALLENGE } from "@/engine/progression/xpEconomy";

type ValuePropFlipCard = {
  id: string;
  category: string;
  visual: string;
  problem: string;
  product: string;
  solution: string;
  tone: "gaming" | "creation" | "ai" | "cars" | "health" | "weather" | "robotics" | "data";
};

const VALUE_PROP_FLIP_CARDS: readonly ValuePropFlipCard[] = [
  {
    id: "gaming-stutter",
    category: "Gaming",
    visual: "🎮",
    problem: "Why does my game keep freezing and stuttering?",
    product: "GeForce RTX GPUs",
    solution:
      "Powerful chips that help games run smoothly and handle detailed graphics.",
    tone: "gaming"
  },
  {
    id: "ai-video",
    category: "AI Creation",
    visual: "🎬",
    problem: "Why is my AI video taking forever to make?",
    product: "NVIDIA GPUs",
    solution:
      "Powerful chips that handle lots of AI calculations at once, helping videos generate faster.",
    tone: "creation"
  },
  {
    id: "ai-scale",
    category: "AI",
    visual: "🤖",
    problem: "How can AI answer millions of people at the same time?",
    product: "NVIDIA Data Center GPUs",
    solution:
      "Powerful chips used in large servers so AI services can respond to many people at once.",
    tone: "ai"
  },
  {
    id: "cars-react",
    category: "Cars",
    visual: "🚗",
    problem: "How can a car spot something in the road and react instantly?",
    product: "NVIDIA DRIVE",
    solution:
      "Computing technology that helps cars understand what's happening around them and react.",
    tone: "cars"
  },
  {
    id: "medical-scans",
    category: "Healthcare",
    visual: "🏥",
    problem: "How can doctors analyse huge medical scans faster?",
    product: "NVIDIA Clara",
    solution:
      "Software and computing tools that help medical teams work with large scans and health data.",
    tone: "health"
  },
  {
    id: "weather-models",
    category: "Weather",
    visual: "🌦️",
    problem: "Why does predicting the weather need so much computing power?",
    product: "NVIDIA Earth-2",
    solution:
      "Computing technology that helps weather systems work through huge amounts of climate data.",
    tone: "weather"
  },
  {
    id: "robot-vision",
    category: "Robotics",
    visual: "🏭",
    problem: "How does a robot know what it's looking at and what to do next?",
    product: "NVIDIA Robotics / Jetson",
    solution:
      "Small powerful computers that help robots see, understand and react to their surroundings.",
    tone: "robotics"
  },
  {
    id: "data-center-job",
    category: "Data Centers",
    visual: "☁️",
    problem: "How do thousands of computers work together on one enormous job?",
    product: "NVIDIA Data Center Systems",
    solution:
      "Large computing systems that connect huge amounts of computing power for demanding AI jobs.",
    tone: "data"
  }
] as const;

const REQUIRED_SOLUTIONS_SEEN = 3;

type Props = {
  companyName: string;
  onComplete: () => void;
};

export function BusinessIslandValuePropCardFlip({
  companyName,
  onComplete
}: Props) {
  const reduceMotion = useReducedMotion();
  const game = useOptionalGame();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [solvedIds, setSolvedIds] = useState<readonly string[]>([]);
  const [bonusAwardedIds, setBonusAwardedIds] = useState<readonly string[]>([]);
  const [carouselStart, setCarouselStart] = useState(0);
  const solvedSet = useMemo(() => new Set(solvedIds), [solvedIds]);
  const activeCard =
    VALUE_PROP_FLIP_CARDS.find((card) => card.id === activeId) ?? null;
  const complete = solvedIds.length >= REQUIRED_SOLUTIONS_SEEN;
  const visibleCards = useMemo(
    () =>
      Array.from({ length: 3 }, (_, index) => {
        const idx = (carouselStart + index) % VALUE_PROP_FLIP_CARDS.length;
        return VALUE_PROP_FLIP_CARDS[idx]!;
      }),
    [carouselStart]
  );
  const progressLabel = complete
    ? "✓ 3 SOLUTIONS SEEN — CONTINUE UNLOCKED"
    : `${solvedIds.length} / ${REQUIRED_SOLUTIONS_SEEN} SOLUTIONS SEEN`;

  const closeSolvedCard = () => {
    if (!activeCard) return;
    const alreadySeen = solvedSet.has(activeCard.id);
    if (!alreadySeen && solvedIds.length >= REQUIRED_SOLUTIONS_SEEN) {
      game?.actions.awardBonusXp(
        XP_DIG_DEEPER_CHALLENGE,
        `Bonus value proposition solution: ${activeCard.id}`
      );
      setBonusAwardedIds((prev) =>
        prev.includes(activeCard.id) ? prev : [...prev, activeCard.id]
      );
    }
    setSolvedIds((prev) =>
      prev.includes(activeCard.id) ? prev : [...prev, activeCard.id]
    );
    setActiveId(null);
  };

  return (
    <motion.section
      className="iq-problem-wall"
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      aria-label={`${companyName} problem wall`}
    >
      <div className="iq-problem-wall__header">
        <div>
          <h3>What problems does NVIDIA solve?</h3>
          <p>See any 3 solutions to continue. Explore more to earn bonus XP.</p>
        </div>
        <span>{progressLabel}</span>
      </div>

      <div className="iq-problem-carousel" aria-label="NVIDIA problem carousel">
        <button
          type="button"
          className="iq-problem-carousel__nav"
          aria-label="Previous problems"
          onClick={() =>
            setCarouselStart((prev) =>
              (prev - 1 + VALUE_PROP_FLIP_CARDS.length) %
              VALUE_PROP_FLIP_CARDS.length
            )
          }
        >
          ‹
        </button>
        <div className="iq-problem-carousel__track">
          {visibleCards.map((card) => {
            const solved = solvedSet.has(card.id);
            const bonusAwarded = bonusAwardedIds.includes(card.id);
            return (
              <button
                key={card.id}
                type="button"
                className={[
                  "iq-problem-card",
                  `iq-problem-card--${card.tone}`,
                  solved ? "iq-problem-card--solved" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  setActiveId(card.id);
                }}
              >
                <span className="iq-problem-card__image" aria-hidden>
                  {card.visual}
                </span>
                <span className="iq-problem-card__category">{card.category}</span>
                <span className="iq-problem-card__problem">{card.problem}</span>
                {solved ? (
                  <span className="iq-problem-card__solved">
                    ✓ EXPLORED{bonusAwarded ? " +XP" : ""}
                  </span>
                ) : (
                  <span className="iq-problem-card__hint">
                    SEE NVIDIA&apos;S SOLUTION →
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="iq-problem-carousel__nav"
          aria-label="Next problems"
          onClick={() =>
            setCarouselStart((prev) => (prev + 1) % VALUE_PROP_FLIP_CARDS.length)
          }
        >
          ›
        </button>
      </div>

      {activeCard ? (
        <div className="iq-problem-focus" role="dialog" aria-modal="true">
          <motion.div
            className={[
              "iq-problem-focus__card",
              `iq-problem-focus__card--${activeCard.tone}`
            ].join(" ")}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98, y: -8 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              className="iq-problem-focus__close"
              aria-label="Close problem"
              onClick={() => {
                setActiveId(null);
              }}
            >
              ×
            </button>
            <div className="iq-problem-focus__back">
              <h4>{activeCard.product}</h4>
              <p>{activeCard.solution}</p>
              <button
                type="button"
                className="iq-hq-mission__primary iq-problem-focus__flip"
                onClick={closeSolvedCard}
              >
                ✓ EXPLORED
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}

      <button
        type="button"
        className="iq-hq-mission__primary iq-problem-wall__cta"
        disabled={!complete}
        onClick={onComplete}
      >
        {complete ? "Continue now →" : "Continue to answer →"}
      </button>
    </motion.section>
  );
}
