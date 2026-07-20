import { NextResponse } from "next/server";

import { companyByTicker } from "@/data/companies";
import { isOpenAiConfigured, OpenAiConfigError } from "@/lib/ai/env";
import { apiErrorResponse } from "@/lib/api/errorResponse";
import { checkRateLimit } from "@/lib/api/rateLimit";
import { isTickerAllowedForGeneration } from "@/lib/demo/controlledDemo";
import {
  generateManagementQuestAnswers,
  parseManagementQuestSlugParam
} from "@/lib/ai/generateManagementQuestAnswers";
import { OpenAiRequestError } from "@/lib/ai/openaiClient";
import { resolveQuestGenerationOptions } from "@/lib/ai/questGenerationMode";
import { parseGenerateQuestParams } from "@/lib/quests/parseGenerateQuestParams";
import { validateTickerParam } from "@/lib/sec/validateTicker";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  if (!checkRateLimit(request, "management/generate")) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

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

  const { searchParams } = new URL(request.url);
  const validated = validateTickerParam(searchParams.get("ticker"));

  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  if (!isTickerAllowedForGeneration(validated.ticker)) {
    return NextResponse.json(
      { error: `Generation is limited to the demo company while in controlled-demo mode.` },
      { status: 403 }
    );
  }

  const company = companyByTicker(validated.ticker);
  if (!company) {
    return NextResponse.json(
      { error: `Ticker ${validated.ticker} is not in the company directory.` },
      { status: 400 }
    );
  }

  const slugParam = searchParams.get("slug");
  if (slugParam && !parseManagementQuestSlugParam(slugParam)) {
    return NextResponse.json(
      { error: `Invalid management quest slug: ${slugParam}` },
      { status: 400 }
    );
  }

  const genParams = parseGenerateQuestParams(searchParams);

  try {
    const result = await generateManagementQuestAnswers({
      ticker: validated.ticker,
      companyId: company.id,
      questSlug: parseManagementQuestSlugParam(slugParam),
      cardIds: genParams.cardIds,
      runExtractIfMissing: genParams.runExtractIfMissing,
      generationOptions: resolveQuestGenerationOptions({
        forceRegenerate: genParams.forceRegenerate,
        fastMode: genParams.fastMode
      })
    });

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (err) {
    if (err instanceof OpenAiConfigError) {
      return apiErrorResponse(
        "management/generate",
        err,
        503,
        "AI generation is not configured."
      );
    }
    if (err instanceof OpenAiRequestError) {
      return apiErrorResponse(
        "management/generate",
        err,
        err.status >= 400 && err.status < 600 ? err.status : 502,
        "AI generation request failed."
      );
    }
    return apiErrorResponse(
      "management/generate",
      err,
      500,
      "Management quest generation failed."
    );
  }
}
