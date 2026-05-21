import type { FinancialsQuestSlug } from "@/app/financials/financialsQuestSlugs";
import { companyById, type CompanyId } from "@/data/companies";
import { findQuestDefinition } from "@/data/quests/library";
import {
  FINANCIAL_QUEST_SYSTEM_PROMPT,
  buildFinancialCardUserPrompt,
  splitAnswerAndInsight,
  type PriorFinancialCardSummary
} from "@/lib/ai/financialQuestPrompt";
import { extractVisualNarration } from "@/lib/financialQuest/sanitizeFinancialAnswer";
import { createChatCompletion } from "@/lib/ai/openaiClient";
import { runCompanySectionExtraction } from "@/lib/sec/extractionPipeline";
import { filterQuestCardSpecs } from "@/lib/quests/filterQuestCardSpecs";
import {
  getFinancialCardSpecs,
  isFinancialsQuestSlugValue,
  type FinancialQuestCardSpec
} from "@/lib/sec/financialQuestSectionMap";
import {
  getFinancialExtractReadiness,
  resolveSectionIdsForCard
} from "@/lib/sec/resolveFinancialSectionIds";
import { isSecApiConfigured } from "@/lib/sec/env";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  hashSectionContent,
  upsertQuestCardAnswer
} from "@/lib/supabase/questCardAnswers/storage";

export type GenerateFinancialQuestResult = {
  ticker: string;
  questSlug: string | "all";
  generated: number;
  skipped: number;
  errors: Array<{ questSlug: string; cardId: string; message: string }>;
  extractRan: boolean;
};

export async function generateFinancialQuestAnswers(params: {
  ticker: string;
  companyId: CompanyId;
  questSlug?: FinancialsQuestSlug;
  cardIds?: string[];
  runExtractIfMissing?: boolean;
}): Promise<GenerateFinancialQuestResult> {
  const ticker = params.ticker.trim().toUpperCase();
  const company = companyById(params.companyId);
  const errors: GenerateFinancialQuestResult["errors"] = [];
  let generated = 0;
  let skipped = 0;
  let extractRan = false;

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  let readiness = await getFinancialExtractReadiness(ticker);

  if (
    !readiness.ready &&
    params.runExtractIfMissing &&
    isSecApiConfigured()
  ) {
    await runCompanySectionExtraction(ticker);
    extractRan = true;
    readiness = await getFinancialExtractReadiness(ticker);
  }

  if (!readiness.ready) {
    throw new Error(
      `Missing required 10-K sections (${readiness.missingSectionKeys.join(", ")}). Run POST /api/sec/extract?ticker=${ticker} first.`
    );
  }

  const specs = filterQuestCardSpecs(getFinancialCardSpecs(params.questSlug), {
    questSlug: params.questSlug,
    cardIds: params.cardIds
  });
  const priorByQuest = new Map<string, PriorFinancialCardSummary[]>();

  for (const spec of specs) {
    const quest = findQuestDefinition(params.companyId, "financials", spec.questSlug);
    if (!quest) {
      errors.push({
        questSlug: spec.questSlug,
        cardId: spec.cardId,
        message: "Quest template not found."
      });
      continue;
    }

    const card = quest.cards?.find((c) => c.id === spec.cardId);
    if (!card) {
      errors.push({
        questSlug: spec.questSlug,
        cardId: spec.cardId,
        message: "Card not found on quest."
      });
      continue;
    }

    const resolved = await resolveSectionIdsForCard(
      ticker,
      spec as FinancialQuestCardSpec
    );
    if (!resolved) {
      errors.push({
        questSlug: spec.questSlug,
        cardId: spec.cardId,
        message: `Missing filing sections: ${spec.sectionKeys.join(", ")}`
      });
      skipped++;
      continue;
    }

    try {
      const priorCardsInQuest = priorByQuest.get(spec.questSlug) ?? [];

      const userPrompt = await buildFinancialCardUserPrompt({
        companyName: company.name,
        ticker: company.ticker,
        questSlug: spec.questSlug,
        questTitle: quest.title,
        questAiTask: quest.aiTask,
        cardQuestion: card.investorQuestion,
        cardId: spec.cardId,
        cardPromptFocus: spec.promptFocus,
        sectionIds: resolved.sectionIds,
        priorCardsInQuest
      });

      const raw = await createChatCompletion({
        system: FINANCIAL_QUEST_SYSTEM_PROMPT,
        user: userPrompt
      });

      const { plainEnglishAnswer, investorInsight } = splitAnswerAndInsight(raw);

      if (!plainEnglishAnswer) {
        errors.push({
          questSlug: spec.questSlug,
          cardId: spec.cardId,
          message: "OpenAI returned empty answer."
        });
        continue;
      }

      await upsertQuestCardAnswer({
        ticker,
        questSlug: spec.questSlug,
        cardId: spec.cardId,
        plainEnglishAnswer,
        investorInsight,
        sourceForm: resolved.formType,
        sourceAccession: resolved.accessionNumber,
        sourceSectionKeys: resolved.sectionKeys,
        filingSectionIds: resolved.sectionIds,
        contentHash: hashSectionContent(resolved.sectionHashes)
      });

      const summary =
        extractVisualNarration(plainEnglishAnswer) ??
        plainEnglishAnswer.slice(0, 220).trim();
      const questPrior = priorByQuest.get(spec.questSlug) ?? [];
      questPrior.push({
        cardId: spec.cardId,
        investorQuestion: card.investorQuestion,
        summary
      });
      priorByQuest.set(spec.questSlug, questPrior);

      generated++;
    } catch (err) {
      errors.push({
        questSlug: spec.questSlug,
        cardId: spec.cardId,
        message: err instanceof Error ? err.message : "Generation failed."
      });
    }
  }

  return {
    ticker,
    questSlug: params.questSlug ?? "all",
    generated,
    skipped,
    errors,
    extractRan
  };
}

export function parseFinancialQuestSlugParam(
  raw: string | null
): FinancialsQuestSlug | undefined {
  if (!raw?.trim()) return undefined;
  const slug = raw.trim();
  return isFinancialsQuestSlugValue(slug) ? slug : undefined;
}
