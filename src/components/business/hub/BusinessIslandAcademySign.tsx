"use client";

import { useMemo } from "react";

import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";
import {
  MASTER_INVESTING_PRINCIPLES,
  countMasteredPrinciples,
  resolveLatestMasteredPrinciple,
  resolveNextPrincipleToMaster
} from "@/lib/business/masterInvestingPrinciples";

type Props = {
  cards: readonly BusinessHubQuestCard[];
  onOpenLadder: () => void;
};

/**
 * Large island notice board — summary only; full ladder opens on interaction.
 */
export function BusinessIslandAcademySign({ cards, onOpenLadder }: Props) {
  const total = MASTER_INVESTING_PRINCIPLES.length;
  const masteredCount = useMemo(() => countMasteredPrinciples(cards), [cards]);
  const remaining = total - masteredCount;
  const allMastered = masteredCount >= total;

  const spotlight = useMemo(() => {
    if (allMastered) {
      return {
        label: "All principles mastered",
        mastered: true as const
      };
    }
    const latest = resolveLatestMasteredPrinciple(cards);
    if (latest) {
      return { label: latest.label, mastered: true as const };
    }
    const next = resolveNextPrincipleToMaster(cards);
    if (next) {
      return { label: next.label, mastered: false as const };
    }
    return null;
  }, [allMastered, cards]);

  const remainingLabel =
    remaining === 0
      ? "Ladder complete"
      : remaining === 1
        ? "1 Principle Remaining"
        : `${remaining} Principles Remaining`;

  return (
    <button
      type="button"
      className="iq-schools-island-academy-sign iq-schools-island-prop iq-schools-island-prop--notice-board pointer-events-auto"
      onClick={onOpenLadder}
      aria-label={`Investment quality check. ${masteredCount} of ${total} mastered. ${remainingLabel}. View full ladder.`}
    >
      <span className="iq-schools-island-prop__ground-shadow" aria-hidden />
      <span className="iq-schools-island-prop__post" aria-hidden />

      <span className="iq-schools-island-academy-sign__header">
        <span className="iq-schools-island-academy-sign__seal" aria-hidden>
          🏅
        </span>
        <span className="iq-schools-island-academy-sign__title">
          Investment Quality Check
        </span>
      </span>

      {spotlight ? (
        <p className="iq-schools-island-academy-sign__spotlight">
          {spotlight.mastered ? (
            <span className="iq-schools-island-academy-sign__tick" aria-hidden>
              ✓
            </span>
          ) : (
            <span className="iq-schools-island-academy-sign__next-dot" aria-hidden />
          )}
          <span className="iq-schools-island-academy-sign__spotlight-label">
            {spotlight.label}
          </span>
        </p>
      ) : null}

      <p className="iq-schools-island-academy-sign__remaining">{remainingLabel}</p>

      <span className="iq-schools-island-academy-sign__cta">
        View Full Ladder
        <span aria-hidden> →</span>
      </span>
    </button>
  );
}
