import type { BusinessAiQuestSlug } from "@/app/business/businessQuestSlugs";
import { generateBusinessQuestAnswers } from "@/lib/ai/generateBusinessQuestAnswers";
import type { FinancialsQuestSlug } from "@/app/financials/financialsQuestSlugs";
import { generateFinancialQuestAnswers } from "@/lib/ai/generateFinancialQuestAnswers";
import { generateForcesQuestAnswers } from "@/lib/ai/generateForcesQuestAnswers";
import { resolveQuestGenerationOptions } from "@/lib/ai/questGenerationMode";
import {
  resolveDemoRefreshIssuesForJob,
  upsertDemoRefreshIssue
} from "@/lib/gameHealth/demoRefreshIssues";

import type { DemoRefreshJob } from "./config";
import { verifyDemoQuestJob, type DemoQuestVerification } from "./verifyDemoContent";

export type DemoRefreshRunResult = {
  jobId: string;
  label: string;
  generated: number;
  skipped: number;
  generationErrors: Array<{ cardId: string; message: string }>;
  verification: DemoQuestVerification;
  durationMs: number;
};

export async function runDemoRefreshJob(
  job: DemoRefreshJob
): Promise<DemoRefreshRunResult> {
  const start = Date.now();
  const genOpts = resolveQuestGenerationOptions({
    forceRegenerate: true,
    maxJargonRewrites: 3
  });

  let generated = 0;
  let skipped = 0;
  const generationErrors: Array<{ cardId: string; message: string }> = [];

  try {
    if (job.pillarId === "business") {
      const result = await generateBusinessQuestAnswers({
        ticker: job.ticker,
        companyId: job.companyId,
        questSlug: job.questSlug as BusinessAiQuestSlug,
        runExtractIfMissing: false,
        generationOptions: genOpts
      });
      generated = result.generated;
      skipped = result.skipped + (result.cachedSkipped ?? 0);
      for (const e of result.errors) {
        generationErrors.push({ cardId: e.cardId, message: e.message });
      }
    } else if (job.pillarId === "financials") {
      const result = await generateFinancialQuestAnswers({
        ticker: job.ticker,
        companyId: job.companyId,
        questSlug: job.questSlug as FinancialsQuestSlug,
        runExtractIfMissing: false,
        generationOptions: genOpts
      });
      generated = result.generated;
      skipped = result.skipped + (result.cachedSkipped ?? 0);
      for (const e of result.errors) {
        generationErrors.push({ cardId: e.cardId, message: e.message });
      }
    } else {
      const result = await generateForcesQuestAnswers({
        ticker: job.ticker,
        companyId: job.companyId,
        questSlug: job.questSlug,
        runExtractIfMissing: false,
        generationOptions: genOpts
      });
      generated = result.generated;
      skipped = result.skipped + (result.cachedSkipped ?? 0);
      for (const e of result.errors) {
        generationErrors.push({ cardId: e.cardId, message: e.message });
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed.";
    await upsertDemoRefreshIssue({
      job,
      title: `${job.label} failed to regenerate`,
      problemPlain: message,
      technical: message
    });
    const verification = await verifyDemoQuestJob(job);
    return {
      jobId: job.id,
      label: job.label,
      generated: 0,
      skipped: 0,
      generationErrors: [{ cardId: "all", message }],
      verification,
      durationMs: Date.now() - start
    };
  }

  for (const err of generationErrors) {
    await upsertDemoRefreshIssue({
      job,
      cardId: err.cardId,
      title: `${job.label} — card ${err.cardId} needs attention`,
      problemPlain: err.message,
      technical: err.message
    });
  }

  const verification = await verifyDemoQuestJob(job);

  for (const card of verification.cards) {
    if (!card.ok) {
      await upsertDemoRefreshIssue({
        job,
        cardId: card.cardId,
        title: `${job.label} — still sounds too technical`,
        problemPlain:
          card.flags.join(", ") || "Answer did not pass human-first quality check.",
        technical: card.preview || card.flags.join(", ")
      });
    }
  }

  if (verification.missingCards.length > 0) {
    for (const cardId of verification.missingCards) {
      await upsertDemoRefreshIssue({
        job,
        cardId,
        title: `${job.label} — missing answer`,
        problemPlain: `Card ${cardId} has no saved explanation.`,
        technical: `empty:${cardId}`
      });
    }
  }

  if (verification.ok && generationErrors.length === 0) {
    await resolveDemoRefreshIssuesForJob(job);
  }

  return {
    jobId: job.id,
    label: job.label,
    generated,
    skipped,
    generationErrors,
    verification,
    durationMs: Date.now() - start
  };
}
