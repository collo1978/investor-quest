"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";

type ValuePropFlipCard = {
  id: string;
  problem: string;
  solution: string;
  builderPhrase: string;
};

const VALUE_PROP_FLIP_CARDS: readonly ValuePropFlipCard[] = [
  {
    id: "ai-speed",
    problem: "AI teams need far more computing power than ordinary servers can provide.",
    solution: "NVIDIA gives them accelerated computing platforms built for huge AI workloads.",
    builderPhrase: "accelerated computing for hard AI workloads"
  },
  {
    id: "developer-tools",
    problem: "Developers do not want raw chips. They need tools that make the chips useful.",
    solution: "NVIDIA adds CUDA, software libraries and developer tools around the hardware.",
    builderPhrase: "software and tools that make the hardware easier to use"
  },
  {
    id: "full-platform",
    problem: "Large customers want complete systems, not a pile of disconnected parts.",
    solution: "NVIDIA sells a full platform across chips, systems, networking and software.",
    builderPhrase: "a full platform across chips, systems, networking and software"
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

  const builderText = allFlipped
    ? `${companyName} helps customers solve hard computing problems with ${VALUE_PROP_FLIP_CARDS.map(
        (card) => card.builderPhrase
      ).join(", ")}.`
    : "Flip every problem card to assemble the value proposition.";

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
          Flip each customer problem to uncover the solution. Each revealed solution
          gets added to the value proposition builder.
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
                    Problem {index + 1}
                  </span>
                  <span className="iq-value-prop-flip-card__text">
                    {card.problem}
                  </span>
                  <span className="iq-value-prop-flip-card__hint">
                    Tap to reveal solution
                  </span>
                </span>
                <span className="iq-value-prop-flip-card__face iq-value-prop-flip-card__back">
                  <span className="iq-value-prop-flip-card__kicker">Solution</span>
                  <span className="iq-value-prop-flip-card__text">
                    {card.solution}
                  </span>
                  <span className="iq-value-prop-flip-card__hint">
                    Added to builder
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="iq-value-prop-builder">
        <p className="iq-value-prop-builder__label">Value Proposition Builder</p>
        <p className="iq-value-prop-builder__statement">{builderText}</p>
      </div>

      <button
        type="button"
        className="iq-hq-mission__primary iq-value-prop-flip__cta"
        disabled={!allFlipped}
        onClick={onComplete}
      >
        Build my value proposition answer →
      </button>
    </motion.section>
  );
}
