"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";

type ValuePropFlipCard = {
  id: string;
  persona: string;
  question: string;
  solution: string;
};

const VALUE_PROP_FLIP_CARDS: readonly ValuePropFlipCard[] = [
  {
    id: "ai-speed",
    persona: "AI lab lead",
    question: "How do we train bigger AI models without waiting forever?",
    solution:
      "NVIDIA answers with accelerated computing platforms built for huge AI workloads."
  },
  {
    id: "developer-tools",
    persona: "Software team",
    question: "How do our engineers use these chips without rebuilding everything?",
    solution:
      "NVIDIA answers with CUDA, software libraries and tools around the hardware."
  },
  {
    id: "full-platform",
    persona: "Data center buyer",
    question: "Can we buy a complete AI system instead of stitching parts together?",
    solution:
      "NVIDIA answers with a full platform across chips, systems, networking and software."
  }
] as const;

type Props = {
  companyName: string;
  onComplete: () => void;
};

export function BusinessIslandValuePropCardFlip({
  companyName,
  onComplete
}: Props) {
  const reduceMotion = useReducedMotion();
  const [flippedIds, setFlippedIds] = useState<readonly string[]>([]);
  const flippedSet = useMemo(() => new Set(flippedIds), [flippedIds]);
  const allFlipped = flippedIds.length >= VALUE_PROP_FLIP_CARDS.length;

  const toggleCard = (cardId: string) => {
    setFlippedIds((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  return (
    <motion.section
      className="iq-value-prop-flip"
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      aria-label={`${companyName} value proposition card flip`}
    >
      <div className="iq-value-prop-flip__header">
        <p className="iq-value-prop-flip__eyebrow">Problem to Solution Card Flip</p>
        <h3 className="iq-value-prop-flip__title">
          Reveal why customers choose {companyName}
        </h3>
        <p className="iq-value-prop-flip__copy">
          Flip each customer question to uncover how {companyName} solves it.
          Then explain the pattern in your own words.
        </p>
      </div>

      <div className="iq-value-prop-flip__grid">
        {VALUE_PROP_FLIP_CARDS.map((card, index) => {
          const flipped = flippedSet.has(card.id);
          return (
            <button
              key={card.id}
              type="button"
              className={[
                "iq-value-prop-flip-card",
                flipped ? "iq-value-prop-flip-card--flipped" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={flipped}
              onClick={() => toggleCard(card.id)}
            >
              <span className="iq-value-prop-flip-card__inner">
                <span className="iq-value-prop-flip-card__face iq-value-prop-flip-card__front">
                  <span className="iq-value-prop-flip-card__kicker">
                    Customer question {index + 1}
                  </span>
                  <span className="iq-value-prop-flip-card__persona">
                    {card.persona}
                  </span>
                  <span className="iq-value-prop-flip-card__text">
                    {card.question}
                  </span>
                  <span className="iq-value-prop-flip-card__hint">
                    Tap to reveal solution
                  </span>
                </span>
                <span className="iq-value-prop-flip-card__face iq-value-prop-flip-card__back">
                  <span className="iq-value-prop-flip-card__kicker">
                    NVIDIA answer
                  </span>
                  <span className="iq-value-prop-flip-card__text">
                    {card.solution}
                  </span>
                  <span className="iq-value-prop-flip-card__hint">
                    Solution revealed
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="iq-hq-mission__primary iq-value-prop-flip__cta"
        disabled={!allFlipped}
        onClick={onComplete}
      >
        Continue to answer →
      </button>
    </motion.section>
  );
}
