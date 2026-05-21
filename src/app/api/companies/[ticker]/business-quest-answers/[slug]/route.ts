import { NextResponse } from "next/server";

import { isBusinessAiQuestSlug } from "@/app/business/businessQuestSlugs";
import { loadBusinessQuestAnswersPayload } from "@/lib/businessQuest/loadBusinessQuestAnswers";
import { validateTickerParam } from "@/lib/sec/validateTicker";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

/**
 * GET /api/companies/AAPL/business-quest-answers/snapshot
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ ticker: string; slug: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 }
    );
  }

  const { ticker: rawTicker, slug } = await context.params;
  const validated = validateTickerParam(rawTicker);

  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  if (!isBusinessAiQuestSlug(slug)) {
    return NextResponse.json(
      { error: `Invalid business quest slug: ${slug}` },
      { status: 400 }
    );
  }

  const payload = await loadBusinessQuestAnswersPayload({
    ticker: validated.ticker,
    questSlug: slug
  });

  return NextResponse.json(payload, {
    headers: { "Cache-Control": "no-store" }
  });
}
