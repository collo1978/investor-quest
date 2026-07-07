"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useState } from "react";

import {
  BUSINESS_ISLAND_EVIDENCE_RATING,
  type BusinessInvestorEvidenceCardDef
} from "@/lib/business/businessInvestorEvidenceCards";
import type { InvestorEvidenceRating } from "@/lib/business/businessInvestorFramework";

type Props = {
  card: Pick<BusinessInvestorEvidenceCardDef, "ratingPrompt">;
  disabled?: boolean;
  onSelect: (
    rating: InvestorEvidenceRating,
    emoji: string,
    fromEl: HTMLElement
  ) => void;
};

function ThumbsOption({
  emoji,
  label,
  tone,
  disabled,
  onClick
}: {
  emoji: string;
  label: string;
  tone: "strong" | "weak";
  disabled?: boolean;
  onClick: (el: HTMLElement) => void;
}) {
  const reduceMotion = useReducedMotion();
  const [popped, setPopped] = useState(false);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      if (!reduceMotion) {
        setPopped(true);
        window.setTimeout(() => setPopped(false), 520);
      }
      onClick(event.currentTarget);
    },
    [disabled, onClick, reduceMotion]
  );

  return (
    <motion.button
      type="button"
      disabled={disabled}
      className={[
        "iq-investor-evidence-reaction__option",
        `iq-investor-evidence-reaction__option--${tone}`,
        "iq-investor-evidence-reaction__option--thumbs",
        popped ? "iq-investor-evidence-reaction__option--pop" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      whileHover={disabled || reduceMotion ? undefined : { y: -6, scale: 1.04 }}
      whileTap={disabled || reduceMotion ? undefined : { scale: 0.94 }}
      animate={
        popped && !reduceMotion ? { scale: [1, 1.18, 1.04] } : { scale: 1 }
      }
      transition={
        popped && !reduceMotion
          ? { duration: 0.42, ease: [0.22, 1, 0.36, 1] }
          : { type: "spring", stiffness: 420, damping: 18 }
      }
      onClick={handleClick}
      aria-label={label}
    >
      <span className="iq-investor-evidence-reaction__option-emoji" aria-hidden>
        {emoji}
      </span>
    </motion.button>
  );
}

/** Standard Business Island evidence rating — 👍 / 👎 on every card. */
export function BusinessInvestorEvidenceReaction({
  card,
  disabled = false,
  onSelect
}: Props) {
  const { strongEmoji, weakEmoji, strongAriaLabel, weakAriaLabel } =
    BUSINESS_ISLAND_EVIDENCE_RATING;

  return (
    <div
      className={[
        "iq-investor-evidence-reaction",
        "iq-investor-evidence-reaction--large",
        "iq-investor-evidence-reaction--thumbs"
      ].join(" ")}
    >
      <div
        className="iq-investor-evidence-reaction__choices"
        role="radiogroup"
        aria-label={card.ratingPrompt}
      >
        <ThumbsOption
          emoji={strongEmoji}
          label={strongAriaLabel}
          tone="strong"
          disabled={disabled}
          onClick={(el) => onSelect("strong", strongEmoji, el)}
        />
        <ThumbsOption
          emoji={weakEmoji}
          label={weakAriaLabel}
          tone="weak"
          disabled={disabled}
          onClick={(el) => onSelect("weak", weakEmoji, el)}
        />
      </div>
    </div>
  );
}
