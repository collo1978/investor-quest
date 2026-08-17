"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

type ValuePropFlipCard = {
  id: string;
  problem: string;
  answer: string;
  explanation: string;
  customerValue: string;
};

const VALUE_PROP_FLIP_CARDS: readonly ValuePropFlipCard[] = [
  {
    id: "accelerated-computing",
    problem: "My game is taking forever to load — and it keeps freezing.",
    answer: "Accelerated Computing",
    explanation:
      "NVIDIA’s GPUs process demanding graphics and computing workloads much faster than traditional computing alone.",
    customerValue: "Faster, smoother, more responsive experiences."
  },
  {
    id: "cuda-ecosystem",
    problem: "This tech is powerful, but how am I supposed to build anything with it?",
    answer: "CUDA + Developer Ecosystem",
    explanation:
      "CUDA gives developers familiar software, libraries and tools to turn NVIDIA’s computing power into real applications.",
    customerValue: "Easier building, less starting over, and a huge community to learn from."
  },
  {
    id: "full-stack-platform",
    problem: "Why do all these bits of tech need so much work just to connect?",
    answer: "Full-Stack Platform",
    explanation:
      "NVIDIA brings chips, networking, systems and software together as one complete platform.",
    customerValue: "Technology that works together, with less setup and fewer headaches."
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
  const [started, setStarted] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = VALUE_PROP_FLIP_CARDS[cardIndex];
  const isLastCard = cardIndex === VALUE_PROP_FLIP_CARDS.length - 1;

  const advance = () => {
    if (isLastCard) {
      onComplete();
      return;
    }
    setCardIndex((current) => current + 1);
    setFlipped(false);
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
      <AnimatePresence mode="wait">
        {!started ? (
          <motion.div
            key="intro"
            className="iq-value-prop-intro"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
          >
            <p className="iq-value-prop-intro__eyebrow">Value Proposition</p>
            <h3>Why do customers choose NVIDIA?</h3>
            <p className="iq-value-prop-intro__lead">
              A company can have great products — but that doesn’t explain why
              customers actually buy them.
            </p>
            <div className="iq-value-prop-intro__mission">
              <strong>Your mission</strong>
              <span>Discover the problems, then reveal how NVIDIA solves them.</span>
            </div>
            <button
              type="button"
              className="iq-hq-mission__primary iq-value-prop-intro__cta"
              onClick={() => setStarted(true)}
            >
              Start mission →
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={card.id}
            className="iq-value-prop-stage"
            initial={reduceMotion ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
          >
            <div className="iq-value-prop-stage__progress" aria-label={`Card ${cardIndex + 1} of 3`}>
              <span>{String(cardIndex + 1).padStart(2, "0")} / 03</span>
              <i style={{ width: `${((cardIndex + 1) / 3) * 100}%` }} />
            </div>

            <button
              type="button"
              className={`iq-value-prop-flip-card${flipped ? " iq-value-prop-flip-card--flipped" : ""}`}
              aria-label={flipped ? `${card.answer}. Solution revealed.` : `Problem: ${card.problem}. Flip to reveal NVIDIA's answer.`}
              aria-pressed={flipped}
              onClick={() => !flipped && setFlipped(true)}
            >
              <span className="iq-value-prop-flip-card__inner">
                <span className="iq-value-prop-flip-card__face iq-value-prop-flip-card__front">
                  <CardCorner />
                  <span className="iq-value-prop-flip-card__content">
                    <span className="iq-value-prop-flip-card__kicker">Problem</span>
                    <span className="iq-value-prop-flip-card__problem">“{card.problem}”</span>
                  </span>
                  <span className="iq-value-prop-flip-card__hint">Flip to reveal →</span>
                  <CardCorner inverted />
                </span>

                <span className="iq-value-prop-flip-card__face iq-value-prop-flip-card__back">
                  <CardCorner />
                  <span className="iq-value-prop-flip-card__content iq-value-prop-flip-card__content--answer">
                    <span className="iq-value-prop-flip-card__kicker">NVIDIA’s answer</span>
                    <span className="iq-value-prop-flip-card__answer">{card.answer}</span>
                    <span className="iq-value-prop-flip-card__explanation">{card.explanation}</span>
                    <span className="iq-value-prop-flip-card__value-label">Customer value</span>
                    <span className="iq-value-prop-flip-card__value">{card.customerValue}</span>
                  </span>
                  <CardCorner inverted />
                </span>
              </span>
            </button>

            <div className="iq-value-prop-stage__actions">
              {flipped ? (
                <motion.button
                  type="button"
                  className="iq-hq-mission__primary iq-value-prop-flip__cta"
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={advance}
                >
                  {isLastCard ? "Continue to answer →" : "Next card →"}
                </motion.button>
              ) : (
                <p>Tap anywhere on the card</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function CardCorner({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className={`iq-value-prop-card-corner${inverted ? " iq-value-prop-card-corner--inverted" : ""}`} aria-hidden>
      <span>N</span>
      <img src="/logos/companies/nvda.svg" alt="" />
    </span>
  );
}
