"use client";

import { motion, useReducedMotion } from "framer-motion";

import { BusinessInvestorEvidenceReaction } from "@/components/business/investorFramework/BusinessInvestorEvidenceReaction";
import type { BusinessInvestorEvidenceCardDef } from "@/lib/business/businessInvestorEvidenceCards";
import type { InvestorEvidenceRating } from "@/lib/business/businessInvestorFramework";

type Props = {
  card: BusinessInvestorEvidenceCardDef;
  cardIndex: number;
  totalCards: number;
  principleLabel: string;
  submitting?: boolean;
  onRate: (
    rating: InvestorEvidenceRating,
    emoji: string,
    fromEl: HTMLElement
  ) => void;
};

/** Dedicated reflection checkpoint — principle, prompt, emoji reactions only. */
export function BusinessInvestorEvidenceRatingCard({
  card,
  cardIndex,
  totalCards,
  principleLabel,
  submitting = false,
  onRate
}: Props) {
  const reduceMotion = useReducedMotion();

  const handleRate = (
    rating: InvestorEvidenceRating,
    emoji: string,
    fromEl: HTMLElement
  ) => {
    if (submitting) return;
    onRate(rating, emoji, fromEl);
  };

  return (
    <motion.article
      layout
      className={[
        "iq-investor-evidence-card mx-auto w-full max-w-2xl",
        "iq-investor-evidence-card--rating iq-investor-evidence-card--rating-focus",
        submitting ? "iq-investor-evidence-card--submitting" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      aria-label={card.ratingPrompt}
    >
      <p className="iq-investor-evidence-card__principle">
        <span aria-hidden>⭐ </span>
        {principleLabel}
      </p>
      <p className="iq-investor-evidence-card__progress tabular-nums">
        Evidence {cardIndex + 1} of {totalCards}
      </p>

      <div className="iq-investor-evidence-card__stage iq-investor-evidence-card__stage--rating">
        <h2 className="iq-investor-evidence-card__rating-prompt">{card.ratingPrompt}</h2>
        <BusinessInvestorEvidenceReaction
          card={card}
          disabled={submitting}
          onSelect={handleRate}
        />
      </div>
    </motion.article>
  );
}
