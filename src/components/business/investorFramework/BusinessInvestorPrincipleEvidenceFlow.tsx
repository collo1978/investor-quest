"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BusinessInvestorEvidenceCardPanel } from "@/components/business/investorFramework/BusinessInvestorEvidenceCardPanel";
import type { InvestorEvidenceCardPhase } from "@/lib/business/businessInvestorEvidencePhaseStorage";
import { useInvestorPrincipleEvidenceFly } from "@/components/business/investorFramework/InvestorPrincipleEvidenceFly";
import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import type { CompanyId } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import { resolveInvestorEvidenceCards } from "@/lib/business/businessInvestorEvidenceCards";
import {
  principleHasEvidenceCards,
  resolveNextSectionEvidencePrinciple,
  resolveSectionIdForEvidencePrinciple
} from "@/lib/business/businessInvestorEvidenceFlowHelpers";
import {
  evidenceRatingsForPrincipleCards,
  isPrincipleEvidenceComplete
} from "@/lib/business/businessInvestorEvidenceHelpers";
import {
  computePrincipleRatingFromEvidence,
  formatRollupRatingLabel,
  resolveInvestorPrinciple,
  type InvestorEvidenceRating,
  type InvestorPrincipleId,
  type InvestorRollupRating
} from "@/lib/business/businessInvestorFramework";
import {
  readBusinessInvestorFrameworkState,
  saveEvidenceRating
} from "@/lib/business/businessInvestorFrameworkStorage";
import {
  clearInvestorEvidencePhaseStorage,
  readStoredInvestorEvidenceCardPhases,
  writeStoredInvestorEvidenceCardPhases
} from "@/lib/business/businessInvestorEvidencePhaseStorage";

export { clearInvestorEvidencePhaseStorage } from "@/lib/business/businessInvestorEvidencePhaseStorage";

type Props = {
  companyId: CompanyId;
  principleId: InvestorPrincipleId;
  pillarId: PillarId;
  theme: PillarQuestTheme;
  /** Quest card 1 read satisfies evidence card 1 — open on rating, not read again. */
  skipReadForFirstCard?: boolean;
  onComplete: (result: {
    overallRating: InvestorRollupRating;
    unlockedPrincipleId: InvestorPrincipleId | null;
  }) => void;
  onExit?: () => void;
  onEvidenceSaved?: () => void;
};

type FlowPhase = "cards" | "complete" | "unlock";

function PrincipleCompletePanel({
  principleLabel,
  overallRating,
  onContinue
}: {
  principleLabel: string;
  overallRating: InvestorRollupRating;
  onContinue: () => void;
}) {
  const ratingLabel = formatRollupRatingLabel(overallRating);
  const ratingEmoji =
    overallRating === "strong" ? "🟢" : overallRating === "weak" ? "🔴" : "🟡";

  return (
    <motion.div
      className="iq-investor-evidence-complete"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      role="status"
      aria-live="polite"
    >
      <span className="iq-investor-evidence-complete__burst" aria-hidden />
      <p className="iq-investor-evidence-complete__eyebrow">Principle complete</p>
      <h3 className="iq-investor-evidence-complete__title">⭐ {principleLabel}</h3>
      <p className="iq-investor-evidence-complete__rating">
        {ratingEmoji} {ratingLabel}
      </p>
      <p className="iq-investor-evidence-complete__copy">
        All evidence collected — your Investor Checklist is updated.
      </p>
      <button
        type="button"
        className="iq-investor-evidence-complete__cta"
        onClick={onContinue}
      >
        Continue
      </button>
    </motion.div>
  );
}

function PrincipleUnlockPanel({
  unlockedLabel,
  onDone
}: {
  unlockedLabel: string;
  onDone: () => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="iq-investor-evidence-unlock"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      role="status"
      aria-live="polite"
    >
      <motion.span
        className="iq-investor-evidence-unlock__burst"
        aria-hidden
        animate={
          reduceMotion
            ? undefined
            : { scale: [0.85, 1.15, 1], opacity: [0.7, 0.35, 0.2] }
        }
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <motion.span
        className="iq-investor-evidence-unlock__lock"
        aria-hidden
        animate={reduceMotion ? undefined : { rotate: [0, -8, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        🔓
      </motion.span>
      <p className="iq-investor-evidence-unlock__eyebrow">Next principle unlocked</p>
      <h3 className="iq-investor-evidence-unlock__title">⭐ {unlockedLabel}</h3>
      <p className="iq-investor-evidence-unlock__copy">
        {unlockedLabel} is ready in your checklist.
      </p>
      <button type="button" className="iq-investor-evidence-unlock__cta" onClick={onDone}>
        Let&apos;s go
      </button>
    </motion.div>
  );
}

/** Sequential principle evidence — 3 cards per principle, then rollup + next principle unlock. */
export function BusinessInvestorPrincipleEvidenceFlow({
  companyId,
  principleId,
  pillarId,
  theme,
  skipReadForFirstCard = false,
  onComplete,
  onExit,
  onEvidenceSaved
}: Props) {
  const fly = useInvestorPrincipleEvidenceFly();
  const principle = resolveInvestorPrinciple(principleId);
  const cards = useMemo(
    () => resolveInvestorEvidenceCards(companyId, principleId),
    [companyId, principleId]
  );

  const [phase, setPhase] = useState<FlowPhase>(() =>
    isPrincipleEvidenceComplete(companyId, principleId) ? "complete" : "cards"
  );
  const [stored, setStored] = useState(() =>
    readBusinessInvestorFrameworkState(companyId)
  );
  const [cardPhases, setCardPhases] = useState<
    Partial<Record<string, InvestorEvidenceCardPhase>>
  >(() => readStoredInvestorEvidenceCardPhases(companyId, principleId));

  useEffect(() => {
    const persistable = Object.fromEntries(
      Object.entries(cardPhases).filter(([, phase]) => phase !== "submitting")
    ) as Partial<Record<string, InvestorEvidenceCardPhase>>;
    writeStoredInvestorEvidenceCardPhases(companyId, principleId, persistable);
  }, [cardPhases, companyId, principleId]);
  const [overallRating, setOverallRating] = useState<InvestorRollupRating | null>(
    () => {
      const state = readBusinessInvestorFrameworkState(companyId);
      const ratings = cards
        .map((card) => state.evidenceRatings[`${principleId}#${card.id}`])
        .filter((value): value is InvestorEvidenceRating => value != null);
      return computePrincipleRatingFromEvidence(ratings);
    }
  );

  const ratedIds = useMemo(
    () => evidenceRatingsForPrincipleCards(principleId, stored),
    [principleId, stored]
  );

  const activeCardIndex = cards.findIndex((card) => !ratedIds.has(card.id));
  const activeCard = activeCardIndex >= 0 ? cards[activeCardIndex]! : null;

  const resolveCardPhase = useCallback(
    (cardId: string, cardIndex: number): InvestorEvidenceCardPhase => {
      const storedPhase = cardPhases[cardId];
      if (storedPhase === "submitting") return "submitting";
      if (
        skipReadForFirstCard &&
        cardIndex === 0 &&
        !ratedIds.has(cardId)
      ) {
        return "rating";
      }
      if (storedPhase === "rating") return "rating";
      if (storedPhase === "read") return "read";
      return "read";
    },
    [cardPhases, skipReadForFirstCard, ratedIds]
  );

  const activeCardPhase: InvestorEvidenceCardPhase = activeCard
    ? resolveCardPhase(activeCard.id, activeCardIndex)
    : "read";

  /** Quest read counts as evidence card 1 read — land on rating. */
  useEffect(() => {
    if (!skipReadForFirstCard) return;
    const firstCard = cards[0];
    if (!firstCard || ratedIds.has(firstCard.id)) return;
    setCardPhases((current) => {
      const phase = current[firstCard.id];
      if (phase === "rating" || phase === "submitting") return current;
      return { ...current, [firstCard.id]: "rating" };
    });
  }, [skipReadForFirstCard, cards, ratedIds]);

  const handleEvidenceMarkRead = useCallback(() => {
    if (!activeCard) return;
    setCardPhases((current) => {
      const phase = current[activeCard.id];
      if (phase === "rating" || phase === "submitting") return current;
      return { ...current, [activeCard.id]: "rating" };
    });
  }, [activeCard]);

  const nextPrincipleCandidate = (() => {
    const sectionId = resolveSectionIdForEvidencePrinciple(principleId);
    if (!sectionId) return null;
    return resolveNextSectionEvidencePrinciple(sectionId, principleId);
  })();
  const nextPrincipleId: InvestorPrincipleId | null =
    nextPrincipleCandidate != null &&
    principleHasEvidenceCards(companyId, nextPrincipleCandidate)
      ? nextPrincipleCandidate
      : null;
  const nextPrincipleLabel =
    nextPrincipleId != null ? resolveInvestorPrinciple(nextPrincipleId).label : null;

  const advanceAfterFly = useCallback(
    (nextState: ReturnType<typeof saveEvidenceRating>) => {
      setStored(nextState);
      onEvidenceSaved?.();

      const cardRatings = cards
        .map((card) => nextState.evidenceRatings[`${principleId}#${card.id}`])
        .filter((value): value is InvestorEvidenceRating => value != null);

      if (cardRatings.length < cards.length) {
        window.setTimeout(() => {
          if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }, 180);
        return;
      }

      const rollup = computePrincipleRatingFromEvidence(cardRatings);
      if (rollup) setOverallRating(rollup);
      clearInvestorEvidencePhaseStorage(companyId, principleId);
      window.setTimeout(() => setPhase("complete"), 360);
    },
    [cards, companyId, onEvidenceSaved, principleId]
  );

  const handleRate = useCallback(
    (rating: InvestorEvidenceRating, emoji: string, fromEl: HTMLElement) => {
      if (!activeCard) return;
      if (activeCardPhase !== "rating") return;

      const ratedCardId = activeCard.id;
      setCardPhases((current) => ({
        ...current,
        [ratedCardId]: "submitting"
      }));

      const persist = () => {
        const nextState = saveEvidenceRating(
          companyId,
          principleId,
          ratedCardId,
          rating
        );
        setCardPhases((current) => {
          const next = { ...current };
          delete next[ratedCardId];
          const nextCard = cards.find(
            (card) => !nextState.evidenceRatings[`${principleId}#${card.id}`]
          );
          if (nextCard) {
            next[nextCard.id] = "read";
          }
          return next;
        });
        advanceAfterFly(nextState);
      };

      if (fly) {
        fly.triggerFly(fromEl, principleId, ratedCardId, emoji, persist);
      } else {
        persist();
      }
    },
    [activeCard, activeCardPhase, advanceAfterFly, companyId, fly, principleId]
  );

  const handleCompleteContinue = useCallback(() => {
    if (nextPrincipleId && nextPrincipleLabel) {
      setPhase("unlock");
      return;
    }
    if (overallRating) {
      onComplete({ overallRating, unlockedPrincipleId: null });
    } else if (onExit) {
      onExit();
    }
  }, [nextPrincipleId, nextPrincipleLabel, overallRating, onComplete, onExit]);

  const handleUnlockDone = useCallback(() => {
    if (overallRating) {
      onComplete({
        overallRating,
        unlockedPrincipleId: nextPrincipleId
      });
    } else if (onExit) {
      onExit();
    }
  }, [overallRating, onComplete, onExit, nextPrincipleId]);

  if (cards.length === 0) {
    return (
      <div className="iq-investor-evidence-card iq-investor-evidence-card--empty">
        <p>Evidence cards for this principle are not available yet.</p>
        {onExit ? (
          <button type="button" onClick={onExit}>
            Back
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="iq-investor-evidence-flow">
      <AnimatePresence mode="wait">
        {phase === "cards" && activeCard ? (
          <BusinessInvestorEvidenceCardPanel
            key={activeCard.id}
            card={activeCard}
            cardIndex={activeCardIndex}
            totalCards={cards.length}
            phase={activeCardPhase}
            principleLabel={principle.label}
            pillarId={pillarId}
            theme={theme}
            onMarkRead={handleEvidenceMarkRead}
            onRate={handleRate}
          />
        ) : phase === "cards" && !activeCard && ratedIds.size > 0 ? (
          <motion.div
            key="rollup-pending"
            className="iq-investor-evidence-card iq-investor-evidence-card--rollup-pending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="status"
            aria-live="polite"
          >
            <p className="iq-investor-evidence-card__rating-prompt">
              Calculating your {principle.label} rating…
            </p>
          </motion.div>
        ) : null}

        {phase === "complete" && overallRating ? (
          <PrincipleCompletePanel
            key="complete"
            principleLabel={principle.label}
            overallRating={overallRating}
            onContinue={handleCompleteContinue}
          />
        ) : null}

        {phase === "unlock" && nextPrincipleLabel ? (
          <PrincipleUnlockPanel
            key="unlock"
            unlockedLabel={nextPrincipleLabel}
            onDone={handleUnlockDone}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
