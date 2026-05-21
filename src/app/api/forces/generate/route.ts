import { NextResponse } from "next/server";

import { companyByTicker } from "@/data/companies";
import { isOpenAiConfigured, OpenAiConfigError } from "@/lib/ai/env";
import {
  generateForcesQuestAnswers,
  parseForcesQuestSlugParam
} from "@/lib/ai/generateForcesQuestAnswers";
import { OpenAiRequestError } from "@/lib/ai/openaiClient";
import { resolveQuestGenerationOptions } from "@/lib/ai/questGenerationMode";
import { parseGenerateQuestParams } from "@/lib/quests/parseGenerateQuestParams";
import { validateTickerParam } from "@/lib/sec/validateTicker";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

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

  const { searchParams } = new URL(request.url);
  const validated = validateTickerParam(searchParams.get("ticker"));

  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const company = companyByTicker(validated.ticker);
  if (!company) {
    return NextResponse.json(
      { error: `Ticker ${validated.ticker} is not in the company directory.` },
      { status: 400 }
    );
  }

  const slugParam = searchParams.get("slug");
  if (slugParam && !parseForcesQuestSlugParam(slugParam)) {
    return NextResponse.json(
      { error: `Invalid forces topic slug: ${slugParam}` },
      { status: 400 }
    );
  }

  const genParams = parseGenerateQuestParams(searchParams);

  try {
    const result = await generateForcesQuestAnswers({
      ticker: validated.ticker,
      companyId: company.id,
      questSlug: parseForcesQuestSlugParam(slugParam),
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
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    if (err instanceof OpenAiRequestError) {
      return NextResponse.json(
        { error: "OpenAI request failed.", detail: err.message },
        { status: err.status >= 400 && err.status < 600 ? err.status : 502 }
      );
    }
    const message =
      err instanceof Error ? err.message : "Forces quest generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
