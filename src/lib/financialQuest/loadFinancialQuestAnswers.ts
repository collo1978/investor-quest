import type { FinancialsQuestSlug } from "@/app/financials/financialsQuestSlugs";
import { getFinancialCardSpecs } from "@/lib/sec/financialQuestSectionMap";
import { getFinancialExtractReadiness } from "@/lib/sec/resolveFinancialSectionIds";
import { fetchQuestCardAnswersForSlug } from "@/lib/supabase/questCardAnswers/storage";
import type { FinancialQuestAnswersPayload } from "@/lib/supabase/questCardAnswers/types";

export async function loadFinancialQuestAnswersPayload(params: {
  ticker: string;
  questSlug: FinancialsQuestSlug;
}): Promise<FinancialQuestAnswersPayload> {
  const ticker = params.ticker.trim().toUpperCase();
  const expectedCardIds = getFinancialCardSpecs(params.questSlug).map(
    (s) => s.cardId
  );

  const readiness = await getFinancialExtractReadiness(ticker);
  if (!readiness.ready) {
    return {
      pillarId: "financials" as const,
      status: "missing_extract",
      questSlug: params.questSlug,
      ticker,
      cards: {},
      sourceLabel: null,
      expectedCardIds
    };
  }

  const cards = await fetchQuestCardAnswersForSlug({
    ticker,
    questSlug: params.questSlug
  });

  const hasAll = expectedCardIds.every((id) => cards[id]?.plainEnglishAnswer);
  const first = Object.values(cards)[0];
  const sourceLabel = first?.sourceAccession
    ? `SEC ${first.sourceForm} · ${first.sourceAccession}`
    : first
      ? `SEC ${first.sourceForm}`
      : null;

  return {
    pillarId: "financials" as const,
    status: hasAll ? "ready" : "needs_generation",
    questSlug: params.questSlug,
    ticker,
    cards,
    sourceLabel,
    expectedCardIds
  };
}
