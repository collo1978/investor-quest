import { NextResponse } from "next/server";

import { isFinancialsQuestSlug } from "@/app/financials/financialsQuestSlugs";
import { loadFinancialQuestAnswersPayload } from "@/lib/financialQuest/loadFinancialQuestAnswers";
import { validateTickerParam } from "@/lib/sec/validateTicker";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

/**
 * GET /api/companies/AAPL/financial-quest-answers/growth
 * Returns generated card answers + pipeline status for one Financial quest.
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

  if (!isFinancialsQuestSlug(slug)) {
    return NextResponse.json(
      { error: `Invalid financials quest slug: ${slug}` },
      { status: 400 }
    );
  }

  const payload = await loadFinancialQuestAnswersPayload({
    ticker: validated.ticker,
    questSlug: slug
  });

  return NextResponse.json(payload, {
    headers: { "Cache-Control": "no-store" }
  });
}
