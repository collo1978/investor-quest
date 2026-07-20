import { NextResponse } from "next/server";

import type { PillarId } from "@/data/pillars";
import { isOpenAiConfigured, OpenAiConfigError } from "@/lib/ai/env";
import { apiErrorResponse } from "@/lib/api/errorResponse";
import {
  regenerateAllCompanies,
  regenerateQuestContent
} from "@/lib/admin/regenerateCompanyQuests";
import { OpenAiRequestError } from "@/lib/ai/openaiClient";
import { resolveQuestGenerationOptions } from "@/lib/ai/questGenerationMode";
import { pillarHasQuestPipeline } from "@/lib/quests/pillarQuestPipelineConfig";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type Body = {
  ticker?: string;
  allCompanies?: boolean;
  pillarId?: PillarId;
  questSlug?: string;
  cardIds?: string[];
  extract?: boolean;
  force?: boolean;
  fast?: boolean;
  unlockedOnly?: boolean;
  freshPlayerOnly?: boolean;
};

/**
 * POST /api/admin/quest-generation/regenerate
 * Batch-regenerate AI quest answers for one company, one island, or all companies.
 */
export async function POST(request: Request) {
  if (!isOpenAiConfigured()) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 503 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 }
    );
  }

  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (body.pillarId && !pillarHasQuestPipeline(body.pillarId)) {
    return NextResponse.json(
      { error: `Invalid or unsupported pillarId: ${body.pillarId}` },
      { status: 400 }
    );
  }

  const runExtract = body.extract === true;
  const generationOptions = resolveQuestGenerationOptions({
    forceRegenerate: body.force === true,
    fastMode: body.fast === true
  });

  try {
    if (body.allCompanies) {
      const results = await regenerateAllCompanies({
        pillarId: body.pillarId,
        questSlug: body.questSlug?.trim() || undefined,
        cardIds: body.cardIds,
        runExtractIfMissing: runExtract,
        unlockedOnly: Boolean(body.unlockedOnly),
        freshPlayerOnly: Boolean(body.freshPlayerOnly),
        generationOptions
      });
      return NextResponse.json(
        { allCompanies: true, results },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const ticker = body.ticker?.trim().toUpperCase();
    if (!ticker) {
      return NextResponse.json(
        { error: "ticker is required (or set allCompanies: true)." },
        { status: 400 }
      );
    }

    const result = await regenerateQuestContent({
      ticker,
      pillarId: body.pillarId,
      questSlug: body.questSlug?.trim() || undefined,
      cardIds: body.cardIds,
      runExtractIfMissing: runExtract,
      unlockedOnly: Boolean(body.unlockedOnly),
      freshPlayerOnly: Boolean(body.freshPlayerOnly),
      generationOptions
    });

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (err) {
    if (err instanceof OpenAiConfigError) {
      return apiErrorResponse(
        "admin/quest-generation/regenerate",
        err,
        503,
        "AI generation is not configured."
      );
    }
    if (err instanceof OpenAiRequestError) {
      return apiErrorResponse(
        "admin/quest-generation/regenerate",
        err,
        err.status >= 400 && err.status < 600 ? err.status : 502,
        "AI generation request failed."
      );
    }
    return apiErrorResponse(
      "admin/quest-generation/regenerate",
      err,
      500,
      "Quest regeneration failed."
    );
  }
}
