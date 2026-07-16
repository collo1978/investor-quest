"use client";

import { motion, useReducedMotion } from "framer-motion";

import {
  InvestorKeyTermDecodeCard,
  type InvestorKeyTermItem
} from "@/components/business/investorFramework/InvestorKeyTermDecodeCard";

type Props = {
  heading?: string;
  terms: readonly InvestorKeyTermItem[];
  expandedIds: ReadonlySet<string>;
  decodedIds: ReadonlySet<string>;
  onToggleTerm: (termId: string, isExpanded: boolean) => void;
  layout?: "grid" | "list";
};

/** Expandable investor-term cards — platform-wide decode mechanic. */
export function InvestorKeyTermsPanel({
  heading = "📘 Key Terms They Mentioned",
  terms,
  expandedIds,
  decodedIds,
  onToggleTerm,
  layout = "grid"
}: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="iq-investor-key-terms" aria-label="Key investor terms">
      <h2 className="iq-investor-key-terms__heading">{heading}</h2>
      <ul
        className={[
          "iq-investor-key-terms__list",
          layout === "grid" ? "iq-investor-key-terms__list--grid" : "iq-investor-key-terms__list--list"
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
              expanded={expandedIds.has(term.id)}
              decoded={decodedIds.has(term.id)}
              onToggle={() => onToggleTerm(term.id, expandedIds.has(term.id))}
              layout={layout}
            />
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
