"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState, type ReactNode } from "react";

import { InvestorEvidenceReadCard } from "@/components/business/investorFramework/InvestorEvidenceReadCard";
import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import type { CompanyId } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import { resolveInvestorEvidenceCards } from "@/lib/business/businessInvestorEvidenceCards";
import {
  formatRollupRatingLabel,
  resolveInvestorPrinciple,
  type InvestorPrincipleId
} from "@/lib/business/businessInvestorFramework";
import { readBusinessInvestorFrameworkState } from "@/lib/business/businessInvestorFrameworkStorage";

type Props = {
  companyId: CompanyId;
  principleId: InvestorPrincipleId;
  pillarId: PillarId;
  theme: PillarQuestTheme;
  onExit: () => void;
};

function ReviewNavButton({
  enabled,
  onClick,
  children
}: {
  enabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!enabled}
      className="iq-schools-mission-nav-group__btn disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

/** Read-only replay — browse all evidence cards for a completed principle. */
export function BusinessInvestorPrincipleEvidenceReviewFlow({
  companyId,
  principleId,
  pillarId,
  theme,
  onExit
}: Props) {
  const principle = resolveInvestorPrinciple(principleId);
  const cards = useMemo(
    () => resolveInvestorEvidenceCards(companyId, principleId),
    [companyId, principleId]
  );
  const stored = useMemo(
    () => readBusinessInvestorFrameworkState(companyId),
    [companyId, principleId]
  );
  const [cardIndex, setCardIndex] = useState(0);
  const activeCard = cards[Math.min(cardIndex, Math.max(cards.length - 1, 0))];

  const principleRating = useMemo(() => {
    const ratings = cards
      .map((card) => stored.evidenceRatings[`${principleId}#${card.id}`])
      .filter((value): value is "strong" | "weak" => value != null);
    if (ratings.length === 0) return null;
    const strong = ratings.filter((r) => r === "strong").length;
    const weak = ratings.filter((r) => r === "weak").length;
    if (strong > weak) return "strong" as const;
    if (weak > strong) return "weak" as const;
    return "mixed" as const;
  }, [cards, principleId, stored.evidenceRatings]);

  if (!activeCard || cards.length === 0) {
    return (
      <div className="iq-investor-evidence-card iq-investor-evidence-card--empty">
        <p>Evidence for this principle is not available yet.</p>
        <button type="button" className="iq-investor-evidence-complete__cta" onClick={onExit}>
          Back
        </button>
      </div>
    );
  }

  const cardRating = stored.evidenceRatings[`${principleId}#${activeCard.id}`];
  const ratingEmoji =
    cardRating === "strong" ? "👍" : cardRating === "weak" ? "👎" : null;

  return (
    <div className="iq-investor-evidence-flow iq-investor-evidence-flow--review">
      <div className="iq-investor-evidence-review__banner">
        <p className="iq-investor-evidence-review__eyebrow">Review mode</p>
        <p className="iq-investor-evidence-review__title">⭐ {principle.label}</p>
        {principleRating ? (
          <p className="iq-investor-evidence-review__rollup">
            Your rating:{" "}
            {principleRating === "strong" ? "🟢" : principleRating === "weak" ? "🔴" : "🟡"}{" "}
            {formatRollupRatingLabel(principleRating)}
          </p>
        ) : null}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeCard.id}
          className="mx-auto w-full max-w-2xl"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
        >
          <InvestorEvidenceReadCard
            principleLabel={principle.label}
            evidenceIndex={cardIndex}
            evidenceTotal={cards.length}
            card={activeCard}
            pillarId={pillarId}
            theme={theme}
            startRevealed
            footerSlot={
              <div className="flex flex-wrap items-center gap-3">
                {ratingEmoji ? (
                  <span className="iq-investor-evidence-review__card-rating" aria-hidden>
                    {ratingEmoji}
                  </span>
                ) : null}
                <button
                  type="button"
                  className="iq-investor-evidence-review__done"
                  onClick={onExit}
                >
                  Done reviewing
                </button>
              </div>
            }
          />
        </motion.div>
      </AnimatePresence>

      {cards.length > 1 ? (
        <nav
          className="mx-auto mt-5 flex max-w-2xl justify-center"
          aria-label="Evidence card navigation"
        >
          <div className="iq-schools-mission-nav-group inline-flex items-center">
            <ReviewNavButton
              enabled={cardIndex > 0}
              onClick={() => setCardIndex((i) => Math.max(0, i - 1))}
            >
              ← Previous
            </ReviewNavButton>
            <span className="iq-schools-mission-nav-group__count">
              {cardIndex + 1} / {cards.length}
            </span>
            <ReviewNavButton
              enabled={cardIndex < cards.length - 1}
              onClick={() => setCardIndex((i) => Math.min(cards.length - 1, i + 1))}
            >
              Next →
            </ReviewNavButton>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
