"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";

type ValuePropFlipCard = {
  id: string;
  category: string;
  visual: string;
  problem: string;
  solutionTitle: string;
  solution: string;
  capability: string;
  tone: "gaming" | "creation" | "ai" | "cars" | "health" | "weather" | "robotics" | "data";
};

const VALUE_PROP_FLIP_CARDS: readonly ValuePropFlipCard[] = [
  {
    id: "gaming-stutter",
    category: "Gaming",
    visual: "🎮",
    problem: "Why does my game keep freezing and stuttering?",
    solutionTitle: "NVIDIA helps games render smoother worlds.",
    solution:
      "GeForce RTX GPUs process graphics, lighting and AI-enhanced frames so demanding games can feel more fluid.",
    capability: "NVIDIA SOLUTION: GeForce RTX / GPUs",
    tone: "gaming"
  },
  {
    id: "ai-video",
    category: "AI Creation",
    visual: "🎬",
    problem: "Why is my AI video taking forever to make?",
    solutionTitle: "NVIDIA helps speed up the heavy computing.",
    solution:
      "NVIDIA GPUs can handle lots of calculations at the same time, helping demanding AI creation tasks run faster.",
    capability: "NVIDIA SOLUTION: GPU / Accelerated Computing",
    tone: "creation"
  },
  {
    id: "ai-scale",
    category: "AI",
    visual: "🤖",
    problem: "How can AI answer millions of people at the same time?",
    solutionTitle: "NVIDIA helps run AI models at huge scale.",
    solution:
      "NVIDIA data center GPUs and systems power servers that can run large AI models for many users at once.",
    capability: "NVIDIA SOLUTION: Data Center GPUs / AI Systems",
    tone: "ai"
  },
  {
    id: "cars-react",
    category: "Cars",
    visual: "🚗",
    problem: "How can a car spot something in the road and react instantly?",
    solutionTitle: "NVIDIA helps cars process what their sensors see.",
    solution:
      "NVIDIA automotive computing platforms process camera and sensor data so vehicle software can understand the road around it.",
    capability: "NVIDIA SOLUTION: Automotive AI Computing",
    tone: "cars"
  },
  {
    id: "medical-scans",
    category: "Healthcare",
    visual: "🏥",
    problem: "How can doctors analyse huge medical scans faster?",
    solutionTitle: "NVIDIA helps medical AI handle large images.",
    solution:
      "NVIDIA GPUs support medical imaging and AI software that can process very large scans and complex health data.",
    capability: "NVIDIA SOLUTION: GPUs / Medical AI",
    tone: "health"
  },
  {
    id: "weather-models",
    category: "Weather",
    visual: "🌦️",
    problem: "Why does predicting the weather need so much computing power?",
    solutionTitle: "NVIDIA helps scientific models process massive data.",
    solution:
      "NVIDIA accelerated computing supports weather and climate models that use huge amounts of data and simulation.",
    capability: "NVIDIA SOLUTION: Accelerated Computing",
    tone: "weather"
  },
  {
    id: "robot-vision",
    category: "Robotics",
    visual: "🏭",
    problem: "How does a robot know what it's looking at and what to do next?",
    solutionTitle: "NVIDIA helps robots use AI to understand the world.",
    solution:
      "NVIDIA robotics platforms combine GPUs, AI software and simulation tools for machines that need to see, learn and act.",
    capability: "NVIDIA SOLUTION: Robotics / AI Platforms",
    tone: "robotics"
  },
  {
    id: "data-center-job",
    category: "Data Centers",
    visual: "☁️",
    problem: "How do thousands of computers work together on one enormous job?",
    solutionTitle: "NVIDIA helps data centers connect compute at scale.",
    solution:
      "NVIDIA systems and networking technology help many servers work together on large AI and computing workloads.",
    capability: "NVIDIA SOLUTION: Data Center Systems / Networking",
    tone: "data"
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [solvedIds, setSolvedIds] = useState<readonly string[]>([]);
  const solvedSet = useMemo(() => new Set(solvedIds), [solvedIds]);
  const activeCard =
    VALUE_PROP_FLIP_CARDS.find((card) => card.id === activeId) ?? null;
  const complete = solvedIds.length >= VALUE_PROP_FLIP_CARDS.length;

  const closeSolvedCard = () => {
    if (!activeCard) return;
    setSolvedIds((prev) =>
      prev.includes(activeCard.id) ? prev : [...prev, activeCard.id]
    );
    setActiveId(null);
    setFlipped(false);
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
          <p>Pick a problem. See how NVIDIA helps.</p>
        </div>
        <span>{solvedIds.length} / {VALUE_PROP_FLIP_CARDS.length} PROBLEMS SOLVED</span>
      </div>

      <div className="iq-problem-wall__grid">
        {VALUE_PROP_FLIP_CARDS.map((card) => {
          const solved = solvedSet.has(card.id);
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
                setFlipped(false);
              }}
            >
              <span className="iq-problem-card__image" aria-hidden>
                {card.visual}
              </span>
              <span className="iq-problem-card__category">{card.category}</span>
              <span className="iq-problem-card__problem">{card.problem}</span>
              {solved ? (
                <span className="iq-problem-card__solved">✓ SOLVED</span>
              ) : (
                <span className="iq-problem-card__hint">Open problem</span>
              )}
            </button>
          );
        })}
      </div>

      {activeCard ? (
        <div className="iq-problem-focus" role="dialog" aria-modal="true">
          <motion.div
            className={[
              "iq-problem-focus__card",
              `iq-problem-focus__card--${activeCard.tone}`,
              flipped ? "iq-problem-focus__card--flipped" : ""
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
                setFlipped(false);
              }}
            >
              ×
            </button>
            {!flipped ? (
              <div className="iq-problem-focus__front">
                <span className="iq-problem-focus__visual" aria-hidden>
                  {activeCard.visual}
                </span>
                <p className="iq-problem-focus__category">{activeCard.category}</p>
                <h4>{activeCard.problem}</h4>
                <button
                  type="button"
                  className="iq-hq-mission__primary iq-problem-focus__flip"
                  onClick={() => setFlipped(true)}
                >
                  Flip →
                </button>
              </div>
            ) : (
              <div className="iq-problem-focus__back">
                <p className="iq-problem-focus__label">NVIDIA helps</p>
                <h4>{activeCard.solutionTitle}</h4>
                <p>{activeCard.solution}</p>
                <span>{activeCard.capability}</span>
                <button
                  type="button"
                  className="iq-hq-mission__primary iq-problem-focus__flip"
                  onClick={closeSolvedCard}
                >
                  Solved. Back to wall →
                </button>
              </div>
            )}
          </motion.div>
        </div>
      ) : null}

      <button
        type="button"
        className="iq-hq-mission__primary iq-problem-wall__cta"
        disabled={!complete}
        onClick={onComplete}
      >
        Continue to answer →
      </button>
    </motion.section>
  );
}
