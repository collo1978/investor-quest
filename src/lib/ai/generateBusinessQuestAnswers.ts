import type { BusinessAiQuestSlug } from "@/app/business/businessQuestSlugs";
import type { CompanyId } from "@/data/companies";
import {
  BUSINESS_QUEST_SYSTEM_PROMPT,
  buildBusinessCardUserPrompt,
  splitAnswerAndInsight
} from "@/lib/ai/businessQuestPrompt";
import {
  generatePillarQuestAnswers,
  type GeneratePillarQuestResult
} from "@/lib/ai/generatePillarQuestAnswers";
import type { QuestGenerationOptions } from "@/lib/ai/questGenerationMode";
import {
  BUSINESS_REQUIRED_10K_SECTION_KEYS,
  getBusinessCardSpecs,
  isBusinessAiQuestSlugValue
} from "@/lib/sec/businessQuestSectionMap";

export type { GeneratePillarQuestResult as GenerateBusinessQuestResult };

export async function generateBusinessQuestAnswers(params: {
  ticker: string;
  companyId: CompanyId;
  questSlug?: BusinessAiQuestSlug;
  cardIds?: string[];
  runExtractIfMissing?: boolean;
  generationOptions?: Partial<QuestGenerationOptions>;
}): Promise<GeneratePillarQuestResult> {
  return generatePillarQuestAnswers({
    pillarId: "business",
    ticker: params.ticker,
    companyId: params.companyId,
    questSlug: params.questSlug,
    cardIds: params.cardIds,
    runExtractIfMissing: params.runExtractIfMissing,
    generationOptions: params.generationOptions,
    specs: getBusinessCardSpecs(params.questSlug),
    requiredReadiness: {
      formType: "10-K",
      requiredSectionKeys: BUSINESS_REQUIRED_10K_SECTION_KEYS
    },
    readinessFromSpecs: false,
    systemPrompt: BUSINESS_QUEST_SYSTEM_PROMPT,
    buildUserPrompt: buildBusinessCardUserPrompt,
    splitAnswerAndInsight,
    missingExtractMessage: (ticker, missing) =>
      `Missing required 10-K sections (${missing.join(", ")}). Run POST /api/sec/extract?ticker=${ticker} first.`
  });
}

export function parseBusinessQuestSlugParam(
  raw: string | null
): BusinessAiQuestSlug | undefined {
  if (!raw?.trim()) return undefined;
  const slug = raw.trim();
  return isBusinessAiQuestSlugValue(slug) ? slug : undefined;
}
