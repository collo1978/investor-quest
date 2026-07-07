"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { BusinessInvestorEvidenceRatingCard } from "@/components/business/investorFramework/BusinessInvestorEvidenceRatingCard";
import { InvestorEvidenceMarkAsReadButton } from "@/components/business/investorFramework/InvestorEvidenceMarkAsReadButton";
import { InvestorEvidenceReadCard } from "@/components/business/investorFramework/InvestorEvidenceReadCard";
import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import type { PillarId } from "@/data/pillars";
import type { BusinessInvestorEvidenceCardDef } from "@/lib/business/businessInvestorEvidenceCards";
import type { InvestorEvidenceRating } from "@/lib/business/businessInvestorFramework";

import type { InvestorEvidenceCardPhase } from "@/lib/business/businessInvestorEvidencePhaseStorage";

export type { InvestorEvidenceCardPhase };

type Props = {
  card: BusinessInvestorEvidenceCardDef;
  cardIndex: number;
  totalCards: number;
  phase: InvestorEvidenceCardPhase;
  principleLabel: string;
  pillarId: PillarId;
  theme: PillarQuestTheme;
  onMarkRead: () => void;
  onRate: (
    rating: InvestorEvidenceRating,
    emoji: string,
    fromEl: HTMLElement
  ) => void;
};

/** Orchestrates read ↔ rating handoff — read always uses {@link InvestorEvidenceReadCard}. */
export function BusinessInvestorEvidenceCardPanel({
  card,
  cardIndex,
  totalCards,
  phase,
  principleLabel,
  pillarId,
  theme,
  onMarkRead,
  onRate
}: Props) {
  const reduceMotion = useReducedMotion();
  const isReadPhase = phase === "read";

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isReadPhase ? (
        <motion.div
          key={`${card.id}-read`}
          className="mx-auto w-full max-w-2xl"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -10, scale: 0.99 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <InvestorEvidenceReadCard
            principleLabel={principleLabel}
            evidenceIndex={cardIndex}
            evidenceTotal={totalCards}
            card={card}
            pillarId={pillarId}
            theme={theme}
            footerSlot={
              <InvestorEvidenceMarkAsReadButton theme={theme} onClick={onMarkRead} />
            }
          />
        </motion.div>
      ) : (
        <BusinessInvestorEvidenceRatingCard
          key={`${card.id}-rating`}
          card={card}
          cardIndex={cardIndex}
          totalCards={totalCards}
          principleLabel={principleLabel}
          submitting={phase === "submitting"}
          onRate={onRate}
        />
      )}
    </AnimatePresence>
  );
}
