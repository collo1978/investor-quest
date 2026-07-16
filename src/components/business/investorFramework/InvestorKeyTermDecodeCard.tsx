"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type InvestorKeyTermItem = {
  id: string;
  title: string;
  explanation: string;
};

type Props = {
  term: InvestorKeyTermItem;
  expanded: boolean;
  decoded: boolean;
  onToggle: () => void;
  layout?: "grid" | "list";
};

/**
 * Signature Investor Quest mechanic — expand a business term in plain English.
 * Reuse wherever unfamiliar terminology appears in company filings.
 */
export function InvestorKeyTermDecodeCard({
  term,
  expanded,
  decoded,
  onToggle,
  layout = "grid"
}: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={[
        "iq-investor-key-term",
        layout === "grid" ? "iq-investor-key-term--grid" : "iq-investor-key-term--list",
        expanded ? "iq-investor-key-term--expanded" : "",
        decoded && !expanded ? "iq-investor-key-term--decoded" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="iq-investor-key-term__header">
        <span className="iq-investor-key-term__title">{term.title}</span>
        <button
          type="button"
          className={[
            "iq-investor-key-term__decode-btn",
            decoded && !expanded ? "iq-investor-key-term__decode-btn--decoded" : ""
          ]
            .filter(Boolean)
            .join(" ")}
          aria-expanded={expanded}
          aria-controls={`iq-investor-key-term-body-${term.id}`}
          onClick={onToggle}
        >
          {decoded && !expanded ? "✅ Decoded" : "❓ Decode"}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            id={`iq-investor-key-term-body-${term.id}`}
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
    </div>
  );
}
