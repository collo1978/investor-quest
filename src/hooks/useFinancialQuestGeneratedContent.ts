"use client";

import type { FinancialsQuestSlug } from "@/app/financials/financialsQuestSlugs";
import { usePillarQuestGeneratedContent } from "@/hooks/usePillarQuestGeneratedContent";
import type { FinancialQuestAnswersPayload } from "@/lib/supabase/questCardAnswers/types";

/** @deprecated Prefer usePillarQuestGeneratedContent("financials", …) */
export function useFinancialQuestGeneratedContent(
  ticker: string,
  questSlug: FinancialsQuestSlug
) {
  const result = usePillarQuestGeneratedContent("financials", ticker, questSlug);
  const payload = result.payload
    ? ({
        status: result.payload.status,
        questSlug: result.payload.questSlug,
        ticker: result.payload.ticker,
        cards: result.payload.cards,
        sourceLabel: result.payload.sourceLabel,
        expectedCardIds: result.payload.expectedCardIds
      } satisfies FinancialQuestAnswersPayload)
    : null;

  return {
    payload,
    generating: result.generating,
    pipelinePhase: result.pipelinePhase,
    progress: result.progress,
    loadingCardIds: result.loadingCardIds,
    canReadQuest: result.canReadQuest,
    error: result.error,
    retryGenerate: result.retryGenerate,
    pipelineEnabled: result.pipelineEnabled
  };
}
