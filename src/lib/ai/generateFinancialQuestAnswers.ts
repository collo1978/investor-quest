import type { FinancialsQuestSlug } from "@/app/financials/financialsQuestSlugs";
import type { CompanyId } from "@/data/companies";
import {
  FINANCIAL_QUEST_SYSTEM_PROMPT,
  buildFinancialCardUserPrompt,
  splitAnswerAndInsight
} from "@/lib/ai/financialQuestPrompt";
import {
  generatePillarQuestAnswers,
  type GeneratePillarQuestResult
} from "@/lib/ai/generatePillarQuestAnswers";
import type { QuestGenerationOptions } from "@/lib/ai/questGenerationMode";
import {
  getFinancialCardSpecs,
  isFinancialsQuestSlugValue
} from "@/lib/sec/financialQuestSectionMap";

export type { GeneratePillarQuestResult as GenerateFinancialQuestResult };

export async function generateFinancialQuestAnswers(params: {
  ticker: string;
  companyId: CompanyId;
  questSlug?: FinancialsQuestSlug;
  cardIds?: string[];
  runExtractIfMissing?: boolean;
  generationOptions?: Partial<QuestGenerationOptions>;
}): Promise<GeneratePillarQuestResult> {
  return generatePillarQuestAnswers({
    pillarId: "financials",
    ticker: params.ticker,
    companyId: params.companyId,
    questSlug: params.questSlug,
    cardIds: params.cardIds,
    runExtractIfMissing: params.runExtractIfMissing,
    generationOptions: params.generationOptions,
    specs: getFinancialCardSpecs(params.questSlug),
    readinessFromSpecs: true,
    systemPrompt: FINANCIAL_QUEST_SYSTEM_PROMPT,
    buildUserPrompt: buildFinancialCardUserPrompt,
    splitAnswerAndInsight,
    missingExtractMessage: (ticker, missing) =>
      `Missing required filing sections (${missing.join(", ")}). Run POST /api/sec/extract?ticker=${ticker} first.`
  });
}

export function parseFinancialQuestSlugParam(
  raw: string | null
): FinancialsQuestSlug | undefined {
  if (!raw?.trim()) return undefined;
  const slug = raw.trim();
  return isFinancialsQuestSlugValue(slug) ? slug : undefined;
}
