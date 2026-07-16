"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { BusinessInvestorChallengeCard } from "@/components/business/investorFramework/BusinessInvestorChallengeCard";
import { BusinessInvestorEvidenceCardPanel } from "@/components/business/investorFramework/BusinessInvestorEvidenceCardPanel";
import { CompanyEvolutionInteractiveTimeline } from "@/components/business/investorFramework/CompanyEvolutionInteractiveTimeline";
import type { InvestorEvidenceCardPhase } from "@/lib/business/businessInvestorEvidencePhaseStorage";
import { useInvestorPrincipleEvidenceFly } from "@/components/business/investorFramework/InvestorPrincipleEvidenceFly";
import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import type { Company } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import {
  resolveInvestorChallengeDef,
  usesInvestorChallengeFlow,
  type InvestorChallengePrincipleId
} from "@/lib/business/businessInvestorChallengeFlow";
import { resolveInvestorEvidenceCards } from "@/lib/business/businessInvestorEvidenceCards";
import {
  principleHasEvidenceCards,
  resolveNextSectionEvidencePrinciple,
  resolveSectionIdForEvidencePrinciple
} from "@/lib/business/businessInvestorEvidenceFlowHelpers";
import {
  evidenceCardsReadForPrinciple,
  evidenceRatingsForPrincipleCards,
  isPrincipleEvidenceComplete
} from "@/lib/business/businessInvestorEvidenceHelpers";
import type { InvestorChallengeEvaluation } from "@/lib/business/evaluateInvestorChallenge";
import {
  computePrincipleRatingFromEvidence,
  formatRollupRatingLabel,
  resolveInvestorPrinciple,
  type InvestorEvidenceRating,
  type InvestorPrincipleId,
  type InvestorRollupRating
} from "@/lib/business/businessInvestorFramework";
import {
  INVESTOR_MISSION_XP_REWARD,
  usesInvestorMissionFlow
} from "@/lib/business/businessInvestorMissionFlow";
import {
  readBusinessInvestorFrameworkState,
  resetCompanyEvolutionProgress,
  saveEvidenceCardRead,
  saveEvidenceRating,
  savePrincipleChallengeOutcome
} from "@/lib/business/businessInvestorFrameworkStorage";
import type { InvestorMissionStepTarget } from "@/lib/business/businessChecklistMissionStepNavigation";
import {
  clearInvestorEvidencePhaseStorage,
  readStoredInvestorEvidenceCardPhases,
  writeStoredInvestorEvidenceCardPhases
} from "@/lib/business/businessInvestorEvidencePhaseStorage";

export type { InvestorMissionStepTarget } from "@/lib/business/businessChecklistMissionStepNavigation";
export { clearInvestorEvidencePhaseStorage } from "@/lib/business/businessInvestorEvidencePhaseStorage";

type Props = {
  company: Company;
  principleId: InvestorPrincipleId;
  pillarId: PillarId;
  theme: PillarQuestTheme;
  /** Quest card 1 read satisfies evidence card 1 — skip re-read on card 1. */
  skipReadForFirstCard?: boolean;
  /** Jump to a mission step launched from the tracker panel. */
  stepTarget?: InvestorMissionStepTarget | null;
  onStepTargetApplied?: () => void;
  /** Schools island hub — return after mission complete instead of chaining on quest page. */
  hubReturnOnComplete?: boolean;
  onComplete: (result: {
    overallRating: InvestorRollupRating;
    unlockedPrincipleId: InvestorPrincipleId | null;
  }) => void;
  onExit?: () => void;
  onEvidenceSaved?: () => void;
};

type LegacyFlowPhase = "cards" | "complete" | "unlock";
type ChallengeFlowPhase = "cards" | "challenge" | "success";

function resolveChallengeInitialPhase(
  companyId: Company["id"],
  principleId: InvestorChallengePrincipleId
): ChallengeFlowPhase {
  const stored = readBusinessInvestorFrameworkState(companyId);
  if (isPrincipleEvidenceComplete(companyId, principleId, stored)) {
    return "success";
  }

  const cards = resolveInvestorEvidenceCards(companyId, principleId);
  const read = evidenceCardsReadForPrinciple(principleId, stored);
  const allRead = cards.length > 0 && cards.every((card) => read.has(card.id));

  if (!allRead) return "cards";

  const challenge = stored.principleChallengePassed[principleId];
  if (challenge === "great" || challenge === "good") return "success";
  // Evolution keeps "cards" so the timeline finale can play; others go straight to challenge.
  if (principleId === "company-evolution") return "cards";
  return "challenge";
}

function PrincipleCompletePanel({
  principleLabel,
  principleId,
  overallRating,
  challengeHeadline,
  onContinue
}: {
  principleLabel: string;
  principleId: InvestorPrincipleId;
  overallRating: InvestorRollupRating;
  challengeHeadline?: string | null;
  onContinue: () => void;
}) {
  const isMission = usesInvestorMissionFlow(principleId);
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
      <p className="iq-investor-evidence-complete__eyebrow">
        {isMission ? "Mission complete" : "Principle complete"}
      </p>
      <h3 className="iq-investor-evidence-complete__title">⭐ {principleLabel}</h3>
      {isMission ? (
        <p className="iq-investor-evidence-complete__rating">
          ✅ Mission complete · +{INVESTOR_MISSION_XP_REWARD} XP
        </p>
      ) : challengeHeadline ? (
        <p className="iq-investor-evidence-complete__rating">{challengeHeadline}</p>
      ) : (
        <p className="iq-investor-evidence-complete__rating">
          {ratingEmoji} {ratingLabel}
        </p>
      )}
      <p className="iq-investor-evidence-complete__copy">
        {isMission
          ? "Knowledge collected — your next mission is unlocked."
          : "All evidence collected — your Investor Checklist is updated."}
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

function resolveChallengeSuccessCopy(
  principleId: InvestorChallengePrincipleId,
  companyName: string
): string {
  switch (principleId) {
    case "business-purpose":
      return `Great! You can now explain what ${companyName} does like an investor.`;
    case "company-evolution":
      return `Great! You can explain how ${companyName} evolved from graphics into an AI and full-stack computing platform.`;
    case "global-presence":
      return `Great! You can now explain where ${companyName} operates like an investor.`;
    default:
      return `Great! You demonstrated understanding like an investor.`;
  }
}

/** Brief win beat after Investor Challenge — no evidence replay. */
function PrincipleChallengeSuccessPanel({
  principleLabel,
  celebrationLine,
  nextPrincipleLabel,
  hubReturn,
  onContinue
}: {
  principleLabel: string;
  celebrationLine: string;
  nextPrincipleLabel: string | null;
  hubReturn: boolean;
  onContinue: () => void;
}) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setTimeout(() => onContinue(), 1800);
    return () => window.clearTimeout(timer);
  }, [onContinue, reduceMotion]);

  const ctaLabel = hubReturn
    ? "Back to Business Island"
    : nextPrincipleLabel
      ? `Continue to ${nextPrincipleLabel}`
      : "Continue to Section Quiz";

  return (
    <motion.div
      className="iq-investor-challenge-success"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      role="status"
      aria-live="polite"
    >
      <motion.span
        className="iq-investor-challenge-success__burst"
        aria-hidden
        animate={
          reduceMotion
            ? undefined
            : { scale: [0.7, 1.2, 1], opacity: [0.85, 0.35, 0.18] }
        }
        transition={{ duration: 1.1, ease: "easeOut" }}
      />
      <p className="iq-investor-challenge-success__eyebrow">Investor Challenge passed</p>
      <h3 className="iq-investor-challenge-success__title">
        ✅ {principleLabel} Complete
      </h3>
      <p className="iq-investor-challenge-success__xp">
        +{INVESTOR_MISSION_XP_REWARD} XP
      </p>
      <p className="iq-investor-challenge-success__copy">{celebrationLine}</p>
      {nextPrincipleLabel && !hubReturn ? (
        <p className="iq-investor-challenge-success__next">
          🔓 {nextPrincipleLabel} unlocked
        </p>
      ) : null}
      <button
        type="button"
        className="iq-investor-challenge-success__cta"
        onClick={onContinue}
      >
        {ctaLabel}
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

/** Company Overview — read evidence → Investor Challenge. Other sections keep card ratings. */
function BusinessInvestorChallengePrincipleFlow({
  company,
  principleId,
  pillarId,
  theme,
  skipReadForFirstCard = false,
  stepTarget = null,
  onStepTargetApplied,
  hubReturnOnComplete = false,
  onComplete,
  onExit,
  onEvidenceSaved
}: Props & { principleId: InvestorChallengePrincipleId }) {
  const principle = resolveInvestorPrinciple(principleId);
  const challengeDef = useMemo(
    () => resolveInvestorChallengeDef(company.id, principleId),
    [company.id, principleId]
  );
  const cards = useMemo(
    () => resolveInvestorEvidenceCards(company.id, principleId),
    [company.id, principleId]
  );

  const [phase, setPhase] = useState<ChallengeFlowPhase>(() => {
    // Demo polish: start Company Evolution from milestone 1 once per browser session.
    if (principleId === "company-evolution") {
      try {
        const flag = "iq-company-evolution-journey-fresh-v5";
        if (typeof sessionStorage !== "undefined" && !sessionStorage.getItem(flag)) {
          sessionStorage.setItem(flag, "1");
          resetCompanyEvolutionProgress(company.id);
        }
      } catch {
        /* ignore */
      }
    }
    return resolveChallengeInitialPhase(company.id, principleId);
  });
  const [viewCardId, setViewCardId] = useState<string | null>(null);
  const [stored, setStored] = useState(() =>
    readBusinessInvestorFrameworkState(company.id)
  );
  const [overallRating, setOverallRating] = useState<InvestorRollupRating | null>(() => {
    const state = readBusinessInvestorFrameworkState(company.id);
    const ratings = cards
      .map((card) => state.evidenceRatings[`${principleId}#${card.id}`])
      .filter((value): value is InvestorEvidenceRating => value != null);
    return computePrincipleRatingFromEvidence(ratings);
  });
  const celebrationLine = resolveChallengeSuccessCopy(principleId, company.name);
  const finishedRef = useRef(false);

  const readIds = useMemo(
    () => evidenceCardsReadForPrinciple(principleId, stored),
    [principleId, stored]
  );

  const activeCardIndex = cards.findIndex((card) => !readIds.has(card.id));
  const activeCard = activeCardIndex >= 0 ? cards[activeCardIndex]! : null;

  const displayCard = useMemo(() => {
    if (viewCardId) {
      return cards.find((card) => card.id === viewCardId) ?? activeCard;
    }
    return activeCard;
  }, [viewCardId, cards, activeCard]);

  const displayCardIndex = useMemo(() => {
    if (!displayCard) return -1;
    return cards.findIndex((card) => card.id === displayCard.id);
  }, [displayCard, cards]);

  const displayCardIsRead = displayCard ? readIds.has(displayCard.id) : false;

  const scrollToTop = useCallback(() => {
    window.setTimeout(() => {
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 180);
  }, []);

  useEffect(() => {
    if (!stepTarget) return;

    if (stepTarget.type === "evidence") {
      setPhase("cards");
      setViewCardId(stepTarget.cardId);
    } else if (stepTarget.type === "challenge") {
      setViewCardId(null);
      setPhase("challenge");
    }

    scrollToTop();
    onStepTargetApplied?.();
  }, [stepTarget, onStepTargetApplied, scrollToTop]);

  const nextPrincipleCandidate = (() => {
    const sectionId = resolveSectionIdForEvidencePrinciple(principleId);
    if (!sectionId) return null;
    return resolveNextSectionEvidencePrinciple(sectionId, principleId);
  })();
  const nextPrincipleId: InvestorPrincipleId | null =
    nextPrincipleCandidate != null &&
    principleHasEvidenceCards(company.id, nextPrincipleCandidate)
      ? nextPrincipleCandidate
      : null;
  const nextPrincipleLabel =
    nextPrincipleId != null ? resolveInvestorPrinciple(nextPrincipleId).label : null;

  /** Quest read counts as evidence card 1 read. */
  useEffect(() => {
    if (!skipReadForFirstCard) return;
    const firstCard = cards[0];
    if (!firstCard || readIds.has(firstCard.id)) return;
    const nextState = saveEvidenceCardRead(company.id, principleId, firstCard.id);
    setStored(nextState);
    onEvidenceSaved?.();
  }, [skipReadForFirstCard, cards, readIds, company.id, principleId, onEvidenceSaved]);

  const handleEvidenceMarkRead = useCallback(() => {
    const cardToMark = displayCard;
    if (!cardToMark) return;

    if (readIds.has(cardToMark.id)) {
      setViewCardId(null);
      scrollToTop();
      return;
    }

    const nextState = saveEvidenceCardRead(company.id, principleId, cardToMark.id);
    setStored(nextState);
    onEvidenceSaved?.();
    setViewCardId(null);

    const read = evidenceCardsReadForPrinciple(principleId, nextState);
    const allRead = cards.every((card) => read.has(card.id));
    if (allRead) {
      scrollToTop();
      window.setTimeout(() => setPhase("challenge"), 280);
      return;
    }
    scrollToTop();
  }, [
    displayCard,
    readIds,
    cards,
    company.id,
    onEvidenceSaved,
    principleId,
    scrollToTop
  ]);

  const handleEvolutionMilestoneComplete = useCallback(
    (cardId: string) => {
      if (readIds.has(cardId)) return;
      const nextState = saveEvidenceCardRead(company.id, principleId, cardId);
      setStored(nextState);
      onEvidenceSaved?.();
    },
    [readIds, company.id, principleId, onEvidenceSaved]
  );

  const handleChallengeSubmit = useCallback(
    (_response: string, evaluation: InvestorChallengeEvaluation) => {
      const nextState = savePrincipleChallengeOutcome(
        company.id,
        principleId,
        evaluation.outcome
      );
      setStored(nextState);
      onEvidenceSaved?.();

      if (evaluation.outcome === "retry") return;

      const ratings = cards
        .map((card) => nextState.evidenceRatings[`${principleId}#${card.id}`])
        .filter((value): value is InvestorEvidenceRating => value != null);
      const rollup = computePrincipleRatingFromEvidence(ratings);
      if (rollup) setOverallRating(rollup);
      clearInvestorEvidencePhaseStorage(company.id, principleId);
      scrollToTop();
      setPhase("success");
    },
    [cards, company.id, onEvidenceSaved, principleId, scrollToTop]
  );

  const finishChallengeJourney = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    const rating = overallRating ?? "strong";

    if (hubReturnOnComplete) {
      onComplete({ overallRating: rating, unlockedPrincipleId: null });
      return;
    }

    onComplete({
      overallRating: rating,
      unlockedPrincipleId: nextPrincipleId
    });
  }, [hubReturnOnComplete, nextPrincipleId, onComplete, overallRating]);

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
        {phase === "cards" && principleId === "company-evolution" ? (
          <motion.div
            key="evolution-interactive-timeline"
            className="iq-evolution-timeline-shell"
            initial={false}
            animate={{ opacity: 1 }}
          >
            <CompanyEvolutionInteractiveTimeline
              readCardIds={readIds}
              onCompleteMilestone={handleEvolutionMilestoneComplete}
              onTimelineFullyComplete={() => {
                scrollToTop();
                setPhase("challenge");
              }}
            />
          </motion.div>
        ) : null}

        {phase === "cards" && principleId !== "company-evolution" && displayCard ? (
          <BusinessInvestorEvidenceCardPanel
            key={displayCard.id}
            card={displayCard}
            cardIndex={displayCardIndex}
            totalCards={cards.length}
            phase="read"
            principleLabel={principle.label}
            pillarId={pillarId}
            theme={theme}
            cardIsRead={displayCardIsRead}
            onMarkRead={handleEvidenceMarkRead}
            onRate={() => {}}
          />
        ) : null}

        {phase === "challenge" ? (
          <BusinessInvestorChallengeCard
            key="investor-challenge"
            challenge={challengeDef}
            theme={theme}
            onSubmit={handleChallengeSubmit}
          />
        ) : null}

        {phase === "success" ? (
          <PrincipleChallengeSuccessPanel
            key="challenge-success"
            principleLabel={principle.label}
            celebrationLine={celebrationLine}
            nextPrincipleLabel={nextPrincipleLabel}
            hubReturn={hubReturnOnComplete}
            onContinue={finishChallengeJourney}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** Legacy flow — 3 cards per principle with thumbs rating, then rollup. */
function BusinessInvestorLegacyPrincipleEvidenceFlow({
  company,
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
    () => resolveInvestorEvidenceCards(company.id, principleId),
    [company.id, principleId]
  );

  const [phase, setPhase] = useState<LegacyFlowPhase>(() =>
    isPrincipleEvidenceComplete(company.id, principleId) ? "complete" : "cards"
  );
  const [stored, setStored] = useState(() =>
    readBusinessInvestorFrameworkState(company.id)
  );
  const [cardPhases, setCardPhases] = useState<
    Partial<Record<string, InvestorEvidenceCardPhase>>
  >(() => readStoredInvestorEvidenceCardPhases(company.id, principleId));

  useEffect(() => {
    const persistable = Object.fromEntries(
      Object.entries(cardPhases).filter(([, cardPhase]) => cardPhase !== "submitting")
    ) as Partial<Record<string, InvestorEvidenceCardPhase>>;
    writeStoredInvestorEvidenceCardPhases(company.id, principleId, persistable);
  }, [cardPhases, company.id, principleId]);

  const [overallRating, setOverallRating] = useState<InvestorRollupRating | null>(
    () => {
      const state = readBusinessInvestorFrameworkState(company.id);
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
      if (skipReadForFirstCard && cardIndex === 0 && !ratedIds.has(cardId)) {
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

  useEffect(() => {
    if (!skipReadForFirstCard) return;
    const firstCard = cards[0];
    if (!firstCard || ratedIds.has(firstCard.id)) return;
    setCardPhases((current) => {
      const cardPhase = current[firstCard.id];
      if (cardPhase === "rating" || cardPhase === "submitting") return current;
      return { ...current, [firstCard.id]: "rating" };
    });
  }, [skipReadForFirstCard, cards, ratedIds]);

  const handleEvidenceMarkRead = useCallback(() => {
    if (!activeCard) return;
    setCardPhases((current) => {
      const cardPhase = current[activeCard.id];
      if (cardPhase === "rating" || cardPhase === "submitting") return current;
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
    principleHasEvidenceCards(company.id, nextPrincipleCandidate)
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
      clearInvestorEvidencePhaseStorage(company.id, principleId);
      window.setTimeout(() => setPhase("complete"), 360);
    },
    [cards, company.id, onEvidenceSaved, principleId]
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
          company.id,
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
    [activeCard, activeCardPhase, advanceAfterFly, company.id, fly, principleId, cards]
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
            principleId={principleId}
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

export function BusinessInvestorPrincipleEvidenceFlow(props: Props) {
  if (usesInvestorChallengeFlow(props.principleId)) {
    return (
      <BusinessInvestorChallengePrincipleFlow
        {...props}
        principleId={props.principleId}
      />
    );
  }
  return <BusinessInvestorLegacyPrincipleEvidenceFlow {...props} />;
}
