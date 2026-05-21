import type { ManagementAiQuestSlug } from "@/app/management/managementQuestSlugs";
import type { CompanyId } from "@/data/companies";
import type { QuestGenerationOptions } from "@/lib/ai/questGenerationMode";
import {
  MANAGEMENT_QUEST_SYSTEM_PROMPT,
  buildManagementCardUserPrompt,
  splitAnswerAndInsight
} from "@/lib/ai/managementQuestPrompt";
import {
  generatePillarQuestAnswers,
  type GeneratePillarQuestResult
} from "@/lib/ai/generatePillarQuestAnswers";
import {
  getManagementCardSpecs,
  isManagementAiQuestSlugValue
} from "@/lib/sec/managementQuestSectionMap";

export type { GeneratePillarQuestResult as GenerateManagementQuestResult };

export async function generateManagementQuestAnswers(params: {
  ticker: string;
  companyId: CompanyId;
  questSlug?: ManagementAiQuestSlug;
  cardIds?: string[];
  runExtractIfMissing?: boolean;
  generationOptions?: Partial<QuestGenerationOptions>;
}): Promise<GeneratePillarQuestResult> {
  return generatePillarQuestAnswers({
    pillarId: "management",
    ticker: params.ticker,
    companyId: params.companyId,
    questSlug: params.questSlug,
    cardIds: params.cardIds,
    runExtractIfMissing: params.runExtractIfMissing,
    generationOptions: params.generationOptions,
    specs: getManagementCardSpecs(params.questSlug),
    readinessFromSpecs: true,
    systemPrompt: MANAGEMENT_QUEST_SYSTEM_PROMPT,
    buildUserPrompt: buildManagementCardUserPrompt,
    splitAnswerAndInsight,
    missingExtractMessage: (ticker, missing) =>
      `Missing required filing sections (${missing.join(", ")}). Run POST /api/sec/extract?ticker=${ticker} first (10-K + DEF 14A).`
  });
}

export function parseManagementQuestSlugParam(
  raw: string | null
): ManagementAiQuestSlug | undefined {
  if (!raw?.trim()) return undefined;
  const slug = raw.trim();
  return isManagementAiQuestSlugValue(slug) ? slug : undefined;
}
