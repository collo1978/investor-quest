import { analyzePromptAnswerQuality } from "@/lib/ai/promptQualityAnalysis";
import type { BusinessAiQuestSlug } from "@/app/business/businessQuestSlugs";
import type { FinancialsQuestSlug } from "@/app/financials/financialsQuestSlugs";
import { getBusinessCardSpecs } from "@/lib/sec/businessQuestSectionMap";
import { getFinancialCardSpecs } from "@/lib/sec/financialQuestSectionMap";
import { FORCES_TOPIC_CARD_ID } from "@/lib/sec/forcesTopicSectionMap";
import { fetchQuestCardAnswersForSlug } from "@/lib/supabase/questCardAnswers/storage";

import {
  findDemoRefreshJob,
  getDemoRefreshPlan,
  type DemoRefreshJob
} from "./config";

export type DemoCardVerification = {
  cardId: string;
  ok: boolean;
  productionReady: boolean;
  flags: string[];
  preview: string;
  jargonHits: string[];
};

export type DemoQuestVerification = {
  jobId: string;
  label: string;
  ticker: string;
  pillarId: string;
  questSlug: string;
  ok: boolean;
  cards: DemoCardVerification[];
  missingCards: string[];
};

export type DemoContentReadiness = {
  ready: boolean;
  totalJobs: number;
  readyJobs: number;
  totalCards: number;
  readyCards: number;
  quests: DemoQuestVerification[];
  technicalFlags: string[];
};

function expectedCardIds(job: DemoRefreshJob): string[] {
  if (job.pillarId === "business") {
    return getBusinessCardSpecs(job.questSlug as BusinessAiQuestSlug).map(
      (s) => s.cardId
    );
  }
  if (job.pillarId === "financials") {
    return getFinancialCardSpecs(job.questSlug as FinancialsQuestSlug).map(
      (s) => s.cardId
    );
  }
  return [FORCES_TOPIC_CARD_ID];
}

export async function verifyDemoQuestJob(
  job: DemoRefreshJob
): Promise<DemoQuestVerification> {
  const answers = await fetchQuestCardAnswersForSlug({
    ticker: job.ticker,
    pillarId: job.pillarId,
    questSlug: job.questSlug
  });

  const expected = expectedCardIds(job);
  const cards: DemoCardVerification[] = [];
  const missingCards: string[] = [];

  for (const cardId of expected) {
    const row = answers[cardId];
    if (!row?.plainEnglishAnswer?.trim()) {
      missingCards.push(cardId);
      cards.push({
        cardId,
        ok: false,
        productionReady: false,
        flags: ["empty_answer"],
        preview: "",
        jargonHits: []
      });
      continue;
    }

    const combined = row.investorInsight
      ? `${row.plainEnglishAnswer}\n\nWhy investors care:\n${row.investorInsight}`
      : row.plainEnglishAnswer;

    const quality = analyzePromptAnswerQuality(combined, {
      jargonContext: {
        pillarId: job.pillarId,
        questSlug: job.questSlug,
        cardId
      }
    });

    const jargonHits = quality.jargonGate.hits.map((h) => h.label);
    const flags = [
      ...quality.flags,
      ...quality.humanFirst.flags.map((f) => `human_first:${f}`)
    ];

    cards.push({
      cardId,
      ok: quality.productionReady,
      productionReady: quality.productionReady,
      flags,
      preview: row.plainEnglishAnswer.slice(0, 120).trim(),
      jargonHits
    });
  }

  const ok =
    missingCards.length === 0 && cards.length > 0 && cards.every((c) => c.ok);

  return {
    jobId: job.id,
    label: job.label,
    ticker: job.ticker,
    pillarId: job.pillarId,
    questSlug: job.questSlug,
    ok,
    cards,
    missingCards
  };
}

export async function verifyAllDemoContent(): Promise<DemoContentReadiness> {
  const plan = getDemoRefreshPlan();
  const quests: DemoQuestVerification[] = [];

  for (const job of plan) {
    quests.push(await verifyDemoQuestJob(job));
  }

  const readyJobs = quests.filter((q) => q.ok).length;
  const totalCards = quests.reduce((n, q) => n + q.cards.length, 0);
  const readyCards = quests.reduce(
    (n, q) => n + q.cards.filter((c) => c.ok).length,
    0
  );

  const technicalFlags = quests.flatMap((q) =>
    q.cards
      .filter((c) => !c.ok)
      .map((c) => `${q.label} · ${c.cardId}: ${c.flags.join(", ") || "not ready"}`)
  );

  return {
    ready: readyJobs === plan.length && readyCards === totalCards && totalCards > 0,
    totalJobs: plan.length,
    readyJobs,
    totalCards,
    readyCards,
    quests,
    technicalFlags
  };
}

export async function verifyDemoJobById(
  jobId: string
): Promise<DemoQuestVerification | null> {
  const job = findDemoRefreshJob(jobId);
  if (!job) return null;
  return verifyDemoQuestJob(job);
}
