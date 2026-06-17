"use client";

import type { PillarQuestPipelineConfig } from "@/lib/quests/pillarQuestPipelineConfig";
import type { PillarQuestAnswersPayload } from "@/lib/supabase/questCardAnswers/types";

import { getQuestAnswersPollMs } from "@/lib/quests/questGenerationModeClient";
import { isSchoolsDemoProtectedPath } from "@/lib/schools/schoolsDemoProtection";

/** @deprecated Use getQuestAnswersPollMs() */
export const QUEST_ANSWERS_POLL_MS = 2000;

export async function fetchQuestAnswersPayload(
  config: PillarQuestPipelineConfig,
  ticker: string,
  questSlug: string
): Promise<PillarQuestAnswersPayload> {
  if (isSchoolsDemoProtectedPath()) {
    return {
      pillarId: config.pillarId,
      status: "ready",
      questSlug,
      ticker,
      cards: {},
      expectedCardIds: [],
      sourceLabel: null
    };
  }
  const res = await fetch(
    `/api/companies/${encodeURIComponent(ticker)}/${config.answersPath}/${questSlug}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Failed to load answers (${res.status})`);
  }
  return (await res.json()) as PillarQuestAnswersPayload;
}

export async function postQuestGenerate(
  config: PillarQuestPipelineConfig,
  params: {
    ticker: string;
    questSlug: string;
    cardIds?: string[];
    extract?: boolean;
    force?: boolean;
    fast?: boolean;
  }
): Promise<{
  ok: boolean;
  generated?: number;
  extractRan?: boolean;
  errors?: Array<{ message: string }>;
  error?: string;
}> {
  if (isSchoolsDemoProtectedPath()) {
    return { ok: true, generated: 0 };
  }
  const qs = new URLSearchParams({
    ticker: params.ticker,
    slug: params.questSlug
  });
  if (params.extract) qs.set("extract", "1");
  if (params.force) qs.set("force", "1");
  if (params.fast) qs.set("fast", "1");
  if (params.cardIds?.length === 1) {
    qs.set("cardId", params.cardIds[0]!);
  } else if (params.cardIds && params.cardIds.length > 1) {
    qs.set("cardIds", params.cardIds.join(","));
  }

  const res = await fetch(`/api/${config.generatePath}?${qs}`, {
    method: "POST",
    cache: "no-store"
  });
  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    detail?: string;
    generated?: number;
    extractRan?: boolean;
    errors?: Array<{ message: string }>;
  };

  if (!res.ok) {
    return {
      ok: false,
      error: body.error ?? body.detail ?? `Generate failed (${res.status})`
    };
  }

  return {
    ok: true,
    generated: body.generated,
    extractRan: body.extractRan,
    errors: body.errors
  };
}

export async function postSecExtract(ticker: string): Promise<void> {
  if (isSchoolsDemoProtectedPath()) return;
  const res = await fetch(
    `/api/sec/extract?ticker=${encodeURIComponent(ticker)}`,
    { method: "POST", cache: "no-store" }
  );
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `SEC extract failed (${res.status})`);
  }
}
