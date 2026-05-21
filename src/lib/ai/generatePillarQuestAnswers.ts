import type { CompanyId } from "@/data/companies";
import { companyById } from "@/data/companies";
import { findQuestDefinition } from "@/data/quests/library";
import type { PillarId } from "@/data/pillars";
import { createChatCompletion } from "@/lib/ai/openaiClient";
import {
  QUEST_FAST_DEV_SYSTEM_APPEND,
  resolveQuestGenerationOptions,
  type QuestGenerationOptions
} from "@/lib/ai/questGenerationMode";
import { finalizeQuestAnswer } from "@/lib/ai/questAnswerQualityPipeline";
import { QuestPipelineTimer } from "@/lib/ai/questPipelineTiming";
import { extractVisualNarration } from "@/lib/quests/sanitizeQuestAnswer";
import { questAnswerPreviewText } from "@/lib/quests/questAnswerFormat";
import { runCompanySectionExtraction } from "@/lib/sec/extractionPipeline";
import { filterQuestCardSpecs } from "@/lib/quests/filterQuestCardSpecs";
import type { QuestCardSpec } from "@/lib/sec/questCardSpec";
import {
  getExtractReadinessForSpecs,
  getQuestExtractReadiness,
  resolveSectionIdsForQuestCard,
  type QuestExtractReadiness
} from "@/lib/sec/resolveQuestSectionIds";
import { isSecApiConfigured } from "@/lib/sec/env";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  fetchQuestCardAnswersForSlug,
  hashSectionContent,
  upsertQuestCardAnswer
} from "@/lib/supabase/questCardAnswers/storage";
import type { SecFilingFormType } from "@/lib/sec/types";

export type PriorQuestCardSummary = {
  cardId: string;
  investorQuestion: string;
  summary: string;
};

export type PillarQuestGenerationContext = {
  pillarId: PillarId;
  ticker: string;
  companyId: CompanyId;
  questSlug?: string;
  /** When set, only generate these card ids (within questSlug when provided). */
  cardIds?: string[];
  runExtractIfMissing?: boolean;
  specs: QuestCardSpec[];
  /** When true, readiness checks every (form, section) in specs (multi-form pillars). */
  readinessFromSpecs?: boolean;
  requiredReadiness?: {
    formType: SecFilingFormType;
    requiredSectionKeys: readonly string[];
  };
  systemPrompt: string;
  userTemplate?: string;
  model?: string;
  temperature?: number;
  promptSource?: "database" | "code_default";
  buildUserPrompt: (params: {
    companyName: string;
    ticker: string;
    questSlug: string;
    questTitle: string;
    questAiTask: string;
    cardQuestion: string;
    cardId: string;
    cardPromptFocus: string;
    sectionIds: string[];
    priorCardsInQuest?: PriorQuestCardSummary[];
  }) => Promise<string>;
  splitAnswerAndInsight: (raw: string) => {
    plainEnglishAnswer: string;
    investorInsight: string | null;
  };
  missingExtractMessage: (ticker: string, missing: string[]) => string;
  generationOptions?: Partial<QuestGenerationOptions>;
};

export type GeneratePillarQuestResult = {
  ticker: string;
  pillarId: PillarId;
  questSlug: string | "all";
  generated: number;
  skipped: number;
  errors: Array<{ questSlug: string; cardId: string; message: string }>;
  extractRan: boolean;
  fastMode?: boolean;
  cachedSkipped?: number;
};

export async function generatePillarQuestAnswers(
  ctx: PillarQuestGenerationContext
): Promise<GeneratePillarQuestResult> {
  const ticker = ctx.ticker.trim().toUpperCase();
  const company = companyById(ctx.companyId);
  const errors: GeneratePillarQuestResult["errors"] = [];
  let generated = 0;
  let skipped = 0;
  let cachedSkipped = 0;
  let extractRan = false;
  const genOpts = resolveQuestGenerationOptions(ctx.generationOptions);
  const pipelineTimer = new QuestPipelineTimer();

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const resolveReadiness = async (): Promise<QuestExtractReadiness> => {
    if (ctx.readinessFromSpecs) {
      return getExtractReadinessForSpecs(ticker, ctx.specs);
    }
    if (!ctx.requiredReadiness) {
      return getExtractReadinessForSpecs(ticker, ctx.specs);
    }
    return getQuestExtractReadiness({
      ticker,
      formType: ctx.requiredReadiness.formType,
      requiredSectionKeys: ctx.requiredReadiness.requiredSectionKeys
    });
  };

  let readiness = await resolveReadiness();

  if (
    !readiness.ready &&
    ctx.runExtractIfMissing &&
    isSecApiConfigured()
  ) {
    pipelineTimer.mark("extractStart");
    await runCompanySectionExtraction(ticker);
    extractRan = true;
    pipelineTimer.mark("extractDone");
    readiness = await resolveReadiness();
  }

  if (!readiness.ready) {
    const missing = readiness.missingSectionKeys.join(", ") || "unknown sections";
    if (!isSecApiConfigured()) {
      throw new Error(
        `SEC_API_KEY is not configured — cannot pull filings. Add SEC_API_KEY to .env.local and restart the dev server. Missing: ${missing}.`
      );
    }
    if (ctx.runExtractIfMissing && !extractRan) {
      throw new Error(
        `SEC extract did not complete. Missing filing sections: ${missing}. Check terminal logs and retry.`
      );
    }
    throw new Error(ctx.missingExtractMessage(ticker, readiness.missingSectionKeys));
  }

  const specs = filterQuestCardSpecs(ctx.specs, {
    questSlug: ctx.questSlug,
    cardIds: ctx.cardIds
  });

  const existingByQuest = new Map<
    string,
    Awaited<ReturnType<typeof fetchQuestCardAnswersForSlug>>
  >();
  const uniqueQuestSlugs = [...new Set(specs.map((s) => s.questSlug))];
  if (!genOpts.forceRegenerate) {
    for (const questSlug of uniqueQuestSlugs) {
      existingByQuest.set(
        questSlug,
        await fetchQuestCardAnswersForSlug({
          ticker,
          pillarId: ctx.pillarId,
          questSlug
        })
      );
    }
  }

  const systemPrompt =
    genOpts.fastMode && !ctx.systemPrompt.includes("FAST DEV MODE")
      ? `${ctx.systemPrompt}\n\n${QUEST_FAST_DEV_SYSTEM_APPEND}`
      : ctx.systemPrompt;

  const priorByQuest = new Map<string, PriorQuestCardSummary[]>();

  for (const spec of specs) {
    const quest = findQuestDefinition(ctx.companyId, ctx.pillarId, spec.questSlug);
    if (!quest) {
      errors.push({
        questSlug: spec.questSlug,
        cardId: spec.cardId,
        message: "Quest template not found."
      });
      continue;
    }

    let card = quest.cards?.find((c) => c.id === spec.cardId);
    if (!card && spec.cardId === "main") {
      card = {
        id: "main",
        investorQuestion: quest.investorQuestion,
        plainEnglishAnswer: null,
        whyItMatters: quest.whyItMatters
      };
    }
    if (!card) {
      errors.push({
        questSlug: spec.questSlug,
        cardId: spec.cardId,
        message: "Card not found on quest."
      });
      continue;
    }

    const resolved = await resolveSectionIdsForQuestCard(ticker, spec);
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
      const cached = existingByQuest.get(spec.questSlug)?.[spec.cardId];
      if (
        !genOpts.forceRegenerate &&
        cached?.plainEnglishAnswer?.trim()
      ) {
        cachedSkipped++;
        skipped++;
        const summary =
          extractVisualNarration(cached.plainEnglishAnswer) ??
          questAnswerPreviewText(
            cached.plainEnglishAnswer,
            cached.investorInsight
          );
        const questPrior = priorByQuest.get(spec.questSlug) ?? [];
        questPrior.push({
          cardId: spec.cardId,
          investorQuestion: card.investorQuestion,
          summary
        });
        priorByQuest.set(spec.questSlug, questPrior);
        continue;
      }

      const cardTimer = new QuestPipelineTimer();
      const priorCardsInQuest = priorByQuest.get(spec.questSlug) ?? [];

      cardTimer.mark("promptBuildStart");
      const userPrompt = await ctx.buildUserPrompt({
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
      cardTimer.mark("promptBuildDone");

      cardTimer.mark("openaiStart");
      const raw = await createChatCompletion({
        system: systemPrompt,
        user: userPrompt,
        model: ctx.model,
        temperature: ctx.temperature
      });
      cardTimer.mark("openaiDone");

      let jargonRewriteMs = 0;
      const finalized = await finalizeQuestAnswer({
        companyName: company.name,
        cardQuestion: card.investorQuestion,
        rawAnswer: raw,
        splitAnswerAndInsight: ctx.splitAnswerAndInsight,
        model: ctx.model,
        temperature: ctx.temperature,
        generationOptions: genOpts,
        onTiming: (event) => {
          if (event.startsWith("jargonRewriteStart")) {
            cardTimer.mark("jargonRewriteStart");
          }
          if (event.startsWith("jargonRewriteDone")) {
            cardTimer.mark("jargonRewriteDone");
            const d = cardTimer.deltaMs("jargonRewriteStart", "jargonRewriteDone");
            if (d != null) jargonRewriteMs += d;
          }
        }
      });

      if (!finalized.ok) {
        errors.push({
          questSlug: spec.questSlug,
          cardId: spec.cardId,
          message: finalized.reason
        });
        continue;
      }

      const { plainEnglishAnswer, investorInsight } = finalized;

      if (finalized.rewriteAttempts > 0 || finalized.acceptedDespiteJargon) {
        console.info("[quest-pipeline:jargon-rewrite]", {
          ticker,
          questSlug: spec.questSlug,
          cardId: spec.cardId,
          attempts: finalized.rewriteAttempts,
          acceptedDespiteJargon: finalized.acceptedDespiteJargon
        });
      }

      cardTimer.mark("saveStart");
      await upsertQuestCardAnswer({
        ticker,
        pillarId: ctx.pillarId,
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
      cardTimer.mark("saveDone");

      const timing = cardTimer.summary();
      console.info("[quest-pipeline:timing]", {
        ticker,
        pillarId: ctx.pillarId,
        questSlug: spec.questSlug,
        cardId: spec.cardId,
        fastMode: genOpts.fastMode,
        secExtractMs: pipelineTimer.deltaMs("extractStart", "extractDone"),
        promptBuildMs: cardTimer.deltaMs("promptBuildStart", "promptBuildDone"),
        openaiMs: cardTimer.deltaMs("openaiStart", "openaiDone"),
        jargonRewriteMs: jargonRewriteMs || undefined,
        saveMs: cardTimer.deltaMs("saveStart", "saveDone"),
        totalCardMs: timing.totalMs
      });

      const summary =
        extractVisualNarration(plainEnglishAnswer) ??
        questAnswerPreviewText(plainEnglishAnswer, investorInsight);
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

  const result = {
    ticker,
    pillarId: ctx.pillarId,
    questSlug: ctx.questSlug ?? "all",
    generated,
    skipped,
    errors,
    extractRan,
    fastMode: genOpts.fastMode,
    cachedSkipped
  };

  console.info("[quest-pipeline:generate]", {
    ...result,
    timingMs: pipelineTimer.summary()
  });

  return result;
}

export async function getPillarExtractReadiness(
  ctx: Pick<
    PillarQuestGenerationContext,
    "ticker" | "requiredReadiness" | "specs" | "readinessFromSpecs"
  >
): Promise<QuestExtractReadiness> {
  if (ctx.readinessFromSpecs || !ctx.requiredReadiness) {
    return getExtractReadinessForSpecs(ctx.ticker, ctx.specs);
  }
  return getQuestExtractReadiness({
    ticker: ctx.ticker,
    formType: ctx.requiredReadiness.formType,
    requiredSectionKeys: ctx.requiredReadiness.requiredSectionKeys
  });
}
