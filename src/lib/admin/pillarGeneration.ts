import type { CompanyId } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import { PILLAR_ORDER } from "@/data/pillars";
import { buildPillarGenerationContext } from "@/lib/ai/pillarGenerationContext";
import {
  generatePillarQuestAnswers,
  type GeneratePillarQuestResult
} from "@/lib/ai/generatePillarQuestAnswers";
import type { QuestGenerationOptions } from "@/lib/ai/questGenerationMode";
import type { QuestCardSpec } from "@/lib/sec/questCardSpec";
import { getBusinessCardSpecs } from "@/lib/sec/businessQuestSectionMap";
import { getFinancialCardSpecs } from "@/lib/sec/financialQuestSectionMap";
import { getManagementCardSpecs } from "@/lib/sec/managementQuestSectionMap";
import {
  getForcesTopicSpecs,
  isForcesHubSlug
} from "@/lib/sec/forcesTopicSectionMap";
import { pillarHasQuestPipeline } from "@/lib/quests/pillarQuestPipelineConfig";

export const AI_PIPELINE_PILLARS = PILLAR_ORDER.filter((p) =>
  pillarHasQuestPipeline(p)
);

export function getCardSpecsForPillar(
  pillarId: PillarId,
  questSlug?: string
): QuestCardSpec[] {
  switch (pillarId) {
    case "financials":
      return getFinancialCardSpecs(
        questSlug as Parameters<typeof getFinancialCardSpecs>[0]
      );
    case "business":
      return getBusinessCardSpecs(
        questSlug as Parameters<typeof getBusinessCardSpecs>[0]
      );
    case "management":
      return getManagementCardSpecs(
        questSlug as Parameters<typeof getManagementCardSpecs>[0]
      );
    case "forces":
      return getForcesTopicSpecs(questSlug).filter(
        (s) => !isForcesHubSlug(s.questSlug)
      );
    default:
      return [];
  }
}

export async function regeneratePillarQuestContent(params: {
  pillarId: PillarId;
  ticker: string;
  companyId: CompanyId;
  questSlug?: string;
  cardIds?: string[];
  allowedQuestSlugs?: Set<string>;
  runExtractIfMissing?: boolean;
  generationOptions?: Partial<QuestGenerationOptions>;
}): Promise<GeneratePillarQuestResult & { questSlugs: string[] }> {
  let specs = getCardSpecsForPillar(params.pillarId, params.questSlug);
  if (params.cardIds?.length) {
    const allowed = new Set(params.cardIds);
    specs = specs.filter((s) => allowed.has(s.cardId));
  }

  if (params.allowedQuestSlugs) {
    specs = specs.filter((s) => params.allowedQuestSlugs!.has(s.questSlug));
  }

  const questSlugs = [...new Set(specs.map((s) => s.questSlug))];

  const ctx = await buildPillarGenerationContext({
    pillarId: params.pillarId,
    ticker: params.ticker,
    companyId: params.companyId,
    questSlug: params.questSlug,
    specs
  });

  const result = await generatePillarQuestAnswers({
    ...ctx,
    cardIds: params.cardIds,
    runExtractIfMissing: params.runExtractIfMissing,
    generationOptions: params.generationOptions
  });

  return { ...result, questSlugs };
}
