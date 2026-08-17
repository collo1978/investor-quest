"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

type ValuePropFlipCard = {
  id: string;
  problem: string;
  context: string;
  solution: string;
  explanation: string;
  value: string;
  icon: string;
};

const VALUE_PROP_FLIP_CARDS: readonly ValuePropFlipCard[] = [
  {
    id: "01",
    problem: "“My computer is painfully slow.”",
    context: "Why does everything take forever when I ask it to do something demanding?",
    solution: "Accelerated Computing",
    explanation:
      "GPUs can perform huge numbers of calculations at the same time, helping demanding tasks happen much faster.",
    value: "Faster, more powerful computing.",
    icon: "⚡"
  },
  {
    id: "02",
    problem: "“I have a great idea — but why is building it so complicated?”",
    context: "Powerful technology is not much use if you cannot turn your idea into something real.",
    solution: "CUDA + Developer Ecosystem",
    explanation:
      "NVIDIA also gives developers software, libraries and tools that help them build with its computing power.",
    value: "Powerful technology becomes easier to build with.",
    icon: "🛠️"
  },
  {
    id: "03",
    problem: "“Why doesn't all my technology just work together?”",
    context: "Connecting lots of separate pieces can quickly become complicated.",
    solution: "Full-Stack Platform",
    explanation:
      "NVIDIA provides more than a chip: its chips, systems, networking and software are designed as one connected platform.",
    value: "Customers get technology designed to work together.",
    icon: "🧩"
  }
] as const;

type Props = { companyName: string; onComplete: () => void };

function CardCorner({ number, inverted = false }: { number: string; inverted?: boolean }) {
  return (
    <span className={`iq-value-card__corner${inverted ? " iq-value-card__corner--inverted" : ""}`} aria-hidden>
      <Image src="/logos/companies/nvda.svg" alt="" width={25} height={25} />
      <b>{number}</b>
    </span>
  );
}

export function BusinessIslandValuePropCardFlip({ companyName, onComplete }: Props) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<"intro" | "cards">("intro");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = VALUE_PROP_FLIP_CARDS[index];

  const next = () => {
    if (index === VALUE_PROP_FLIP_CARDS.length - 1) {
      onComplete();
      return;
    }
    setFlipped(false);
    setIndex((current) => current + 1);
  };

  return (
    <motion.section
      className="iq-value-prop-flip"
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
      aria-label={`${companyName} value proposition mission`}
    >
      <AnimatePresence mode="wait">
        {phase === "intro" ? (
          <motion.div key="intro" className="iq-value-mission-intro" exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}>
            <p className="iq-value-mission-intro__eyebrow">Value Proposition</p>
            <h2>Why do customers choose NVIDIA?</h2>
            <p>A company can have great products — but that doesn&apos;t explain why customers actually buy them.</p>
            <div className="iq-value-mission-intro__mission">
              <strong>Your Mission</strong>
              <span>Discover the problems, then reveal how NVIDIA solves them.</span>
            </div>
            <button type="button" className="iq-hq-mission__primary" onClick={() => setPhase("cards")}>
              Start Mission →
            </button>
          </motion.div>
        ) : (
          <motion.div key={`card-${card.id}`} className="iq-value-card-stage" initial={reduceMotion ? false : { opacity: 0, x: 28, rotateZ: 1.5 }} animate={{ opacity: 1, x: 0, rotateZ: 0 }}>
            <p className="iq-value-card-stage__progress" aria-label={`Problem ${index + 1} of 3`}>{card.id} <span>/ 03</span></p>
            <button
              type="button"
              className={`iq-value-card${flipped ? " iq-value-card--flipped" : ""}`}
              aria-pressed={flipped}
              aria-label={`${flipped ? "Show everyday problem" : "Flip to discover NVIDIA's solution"}: ${card.problem}`}
              onClick={() => setFlipped((value) => !value)}
            >
              <span className="iq-value-card__inner">
                <span className="iq-value-card__face iq-value-card__front">
                  <CardCorner number={card.id} />
                  <CardCorner number={card.id} inverted />
                  <span className="iq-value-card__content">
                    <span className="iq-value-card__kicker">Everyday Problem</span>
                    <strong className="iq-value-card__headline">{card.problem}</strong>
                    <span className="iq-value-card__body">{card.context}</span>
                    <span className="iq-value-card__flip">↻ Flip to discover</span>
                  </span>
                </span>
                <span className="iq-value-card__face iq-value-card__back">
                  <CardCorner number={card.id} />
                  <CardCorner number={card.id} inverted />
                  <span className="iq-value-card__content">
                    <span className="iq-value-card__kicker">NVIDIA&apos;s Solution</span>
                    <strong className="iq-value-card__headline">{card.solution}</strong>
                    <span className="iq-value-card__body">{card.explanation}</span>
                    <span className="iq-value-card__value"><small>Value Created</small><b>{card.icon} {card.value}</b></span>
                    <span className="iq-value-card__flip">↻ Flip back</span>
                  </span>
                </span>
              </span>
            </button>
            {flipped ? (
              <motion.button type="button" className="iq-hq-mission__primary iq-value-card-stage__next" initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onClick={next}>
                {index === 2 ? "Now connect the dots →" : "Next problem →"}
              </motion.button>
            ) : <span className="iq-value-card-stage__next-space" aria-hidden />}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
