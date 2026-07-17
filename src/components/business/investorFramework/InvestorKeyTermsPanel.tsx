"use client";

import { motion, useReducedMotion } from "framer-motion";

import {
  InvestorKeyTermDecodeCard,
  type InvestorKeyTermItem,
  type InvestorKeyTermMode
} from "@/components/business/investorFramework/InvestorKeyTermDecodeCard";

type Props = {
  heading?: string;
  helperText?: string;
  terms: readonly InvestorKeyTermItem[];
  /** Terms decoded earlier in this mission — trigger recall instead of Decode. */
  seenBeforeIds: ReadonlySet<string>;
  /** Terms already recalled correctly this mission. */
  masteredIds: ReadonlySet<string>;
  /** Called the first time a term's definition is revealed. */
  onDecoded: (termId: string) => void;
  /** Grade a recall attempt — returns true when remembered. */
  onSubmitRecall: (term: InvestorKeyTermItem, response: string) => boolean;
  layout?: "grid" | "list";
};

/** Expandable investor-term cards — platform-wide decode + recall mechanic. */
export function InvestorKeyTermsPanel({
  heading = "📘 Key Terms to Remember",
  helperText,
  terms,
  seenBeforeIds,
  masteredIds,
  onDecoded,
  onSubmitRecall,
  layout = "grid"
}: Props) {
  const reduceMotion = useReducedMotion();

  const resolveMode = (termId: string): InvestorKeyTermMode => {
    if (masteredIds.has(termId)) return "mastered";
    if (seenBeforeIds.has(termId)) return "recall";
    return "new";
  };

  return (
    <section className="iq-investor-key-terms" aria-label="Key investor terms">
      <h2 className="iq-investor-key-terms__heading">{heading}</h2>
      {helperText ? (
        <p className="iq-investor-key-terms__helper">{helperText}</p>
      ) : null}
      <ul
        className={[
          "iq-investor-key-terms__list",
          layout === "grid"
            ? "iq-investor-key-terms__list--grid"
            : "iq-investor-key-terms__list--list"
        ].join(" ")}
      >
        {terms.map((term, index) => (
          <motion.li
            key={term.id}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.34,
              delay: reduceMotion ? 0 : 0.35 + index * 0.08,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            <InvestorKeyTermDecodeCard
              term={term}
              mode={resolveMode(term.id)}
              onDecoded={onDecoded}
              onSubmitRecall={onSubmitRecall}
              layout={layout}
            />
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
