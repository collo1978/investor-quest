"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

export type InvestorKeyTermItem = {
  id: string;
  title: string;
  explanation: string;
  recallKeywords?: readonly string[];
};

/**
 * new       — first time this term appears in the mission (Decode → Decoded).
 * recall    — seen earlier in the mission (Explain it Yourself / Decode Again).
 * mastered  — already recalled correctly earlier in the mission.
 */
export type InvestorKeyTermMode = "new" | "recall" | "mastered";

type Props = {
  term: InvestorKeyTermItem;
  mode: InvestorKeyTermMode;
  layout?: "grid" | "list";
  /** Called the first time the learner reveals the definition. */
  onDecoded?: (termId: string) => void;
  /** Grade a recall attempt — returns true when the learner remembered it. */
  onSubmitRecall?: (term: InvestorKeyTermItem, response: string) => boolean;
};

type RecallStage = "choice" | "input" | "incorrect" | "correct";

/**
 * Signature Investor Quest mechanic — decode a business term in plain English,
 * then recall it from memory when it reappears. Duolingo-style: Decode → Recall → Mastered.
 */
export function InvestorKeyTermDecodeCard({
  term,
  mode,
  layout = "grid",
  onDecoded,
  onSubmitRecall
}: Props) {
  const reduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const [decoded, setDecoded] = useState(false);
  const [recallStage, setRecallStage] = useState<RecallStage>("choice");
  const [recallText, setRecallText] = useState("");

  const bodyId = `iq-investor-key-term-body-${term.id}`;

  const reveal = () => {
    setExpanded((prev) => {
      const next = !prev;
      if (next && !decoded) {
        setDecoded(true);
        onDecoded?.(term.id);
      }
      return next;
    });
  };

  const startRecall = () => setRecallStage("input");

  const decodeAgain = () => {
    setDecoded(true);
    setExpanded(true);
    onDecoded?.(term.id);
  };

  const submitRecall = () => {
    const correct = onSubmitRecall?.(term, recallText) ?? false;
    if (correct) {
      setRecallStage("correct");
    } else {
      setRecallStage("incorrect");
      setExpanded(true);
      setDecoded(true);
      onDecoded?.(term.id);
    }
  };

  const isMastered = recallStage === "correct" || mode === "mastered";
  const showRecall = mode === "recall" && !isMastered;

  const explanationBlock = (
    <AnimatePresence initial={false}>
      {expanded ? (
        <motion.div
          id={bodyId}
          className="iq-investor-key-term__body"
          initial={reduceMotion ? false : { height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          <p>{term.explanation}</p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  const rootClass = [
    "iq-investor-key-term",
    layout === "grid" ? "iq-investor-key-term--grid" : "iq-investor-key-term--list",
    expanded ? "iq-investor-key-term--expanded" : "",
    isMastered ? "iq-investor-key-term--mastered" : "",
    showRecall ? "iq-investor-key-term--recall" : "",
    decoded && !isMastered ? "iq-investor-key-term--decoded" : ""
  ]
    .filter(Boolean)
    .join(" ");

  // Mastered / just-recalled — celebratory, collapsed by default.
  if (isMastered) {
    return (
      <div className={rootClass}>
        <div className="iq-investor-key-term__header">
          <span className="iq-investor-key-term__title">{term.title}</span>
          <button
            type="button"
            className="iq-investor-key-term__decode-btn iq-investor-key-term__decode-btn--mastered"
            aria-expanded={expanded}
            aria-controls={bodyId}
            onClick={() => setExpanded((prev) => !prev)}
          >
            ✅ Mastered
          </button>
        </div>
        {recallStage === "correct" ? (
          <p className="iq-investor-key-term__recall-note iq-investor-key-term__recall-note--win">
            ✅ Great job! You remembered it. <span aria-hidden>⚡</span> +8 XP
          </p>
        ) : null}
        {explanationBlock}
      </div>
    );
  }

  // Seen before — encourage recall instead of re-reading.
  if (showRecall) {
    return (
      <div className={rootClass}>
        <div className="iq-investor-key-term__header">
          <span className="iq-investor-key-term__title">{term.title}</span>
          <span className="iq-investor-key-term__seen">
            🧠 You&apos;ve seen this before!
          </span>
        </div>

        {recallStage === "choice" && !decoded ? (
          <div className="iq-investor-key-term__recall-actions">
            <button
              type="button"
              className="iq-investor-key-term__recall-btn iq-investor-key-term__recall-btn--primary"
              onClick={startRecall}
            >
              ✍ Explain it Yourself
            </button>
            <button
              type="button"
              className="iq-investor-key-term__recall-btn"
              onClick={decodeAgain}
            >
              🔄 Decode Again
            </button>
          </div>
        ) : null}

        {recallStage === "input" ? (
          <div className="iq-investor-key-term__recall-input">
            <label
              className="iq-investor-key-term__recall-prompt"
              htmlFor={`iq-recall-${term.id}`}
            >
              In one sentence, explain what this term means.
            </label>
            <textarea
              id={`iq-recall-${term.id}`}
              className="iq-investor-key-term__recall-field"
              rows={2}
              value={recallText}
              onChange={(event) => setRecallText(event.target.value)}
              placeholder="Type it in your own words…"
              autoFocus
            />
            <div className="iq-investor-key-term__recall-actions">
              <button
                type="button"
                className="iq-investor-key-term__recall-btn iq-investor-key-term__recall-btn--primary"
                onClick={submitRecall}
                disabled={recallText.trim().length === 0}
              >
                Check my answer
              </button>
              <button
                type="button"
                className="iq-investor-key-term__recall-btn"
                onClick={decodeAgain}
              >
                🔄 Decode Again
              </button>
            </div>
          </div>
        ) : null}

        {recallStage === "incorrect" ? (
          <p className="iq-investor-key-term__recall-note">
            👍 Good try — here&apos;s a reminder so it sticks:
          </p>
        ) : null}

        {explanationBlock}
      </div>
    );
  }

  // First exposure — standard Decode card.
  return (
    <div className={rootClass}>
      <div className="iq-investor-key-term__header">
        <span className="iq-investor-key-term__title">{term.title}</span>
        <button
          type="button"
          className={[
            "iq-investor-key-term__decode-btn",
            decoded ? "iq-investor-key-term__decode-btn--decoded" : ""
          ]
            .filter(Boolean)
            .join(" ")}
          aria-expanded={expanded}
          aria-controls={bodyId}
          onClick={reveal}
        >
          {decoded ? "✅ Decoded" : "❓ Decode"}
        </button>
      </div>

      {explanationBlock}
    </div>
  );
}
