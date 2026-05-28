import type { PillarId } from "@/data/pillars";
import type { QuestCardSpec } from "@/lib/sec/questCardSpec";
import {
  getExtractReadinessForSpecs,
  getQuestExtractReadiness
} from "@/lib/sec/resolveQuestSectionIds";
import { resolvePayloadStatus } from "@/lib/quests/questPayloadProgress";
import { fetchQuestCardAnswersForSlug } from "@/lib/supabase/questCardAnswers/storage";
import { formatPlayerQuestSourceLabel } from "@/lib/quests/questSourceLabel";
import type { PillarQuestAnswersPayload } from "@/lib/supabase/questCardAnswers/types";
import type { SecFilingFormType } from "@/lib/sec/types";

export async function loadPillarQuestAnswersPayload(params: {
  pillarId: PillarId;
  ticker: string;
  questSlug: string;
  cardSpecs: QuestCardSpec[];
  requiredReadiness?: {
    formType: SecFilingFormType;
    requiredSectionKeys: readonly string[];
  };
  readinessFromSpecs?: boolean;
}): Promise<PillarQuestAnswersPayload> {
  const ticker = params.ticker.trim().toUpperCase();
  const expectedCardIds = params.cardSpecs.map((s) => s.cardId);

  const readiness =
    params.readinessFromSpecs || !params.requiredReadiness
      ? await getExtractReadinessForSpecs(ticker, params.cardSpecs)
      : await getQuestExtractReadiness({
          ticker,
          formType: params.requiredReadiness.formType,
          requiredSectionKeys: params.requiredReadiness.requiredSectionKeys
        });

  if (!readiness.ready) {
    return {
      pillarId: params.pillarId,
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
    pillarId: params.pillarId,
    questSlug: params.questSlug
  });

  const first = Object.values(cards)[0];
  const sourceLabel = formatPlayerQuestSourceLabel(
    first?.sourceForm,
    first?.sourceAccession
  );

  const status = resolvePayloadStatus(expectedCardIds, cards, true);

  return {
    pillarId: params.pillarId,
    status,
    questSlug: params.questSlug,
    ticker,
    cards,
    sourceLabel,
    expectedCardIds
  };
}
