import { NextResponse } from "next/server";

import { isManagementAiQuestSlug } from "@/app/management/managementQuestSlugs";
import { loadManagementQuestAnswersPayload } from "@/lib/managementQuest/loadManagementQuestAnswers";
import { validateTickerParam } from "@/lib/sec/validateTicker";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

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

  if (!isManagementAiQuestSlug(slug)) {
    return NextResponse.json(
      { error: `Invalid management quest slug: ${slug}` },
      { status: 400 }
    );
  }

  const payload = await loadManagementQuestAnswersPayload({
    ticker: validated.ticker,
    questSlug: slug
  });

  return NextResponse.json(payload, {
    headers: { "Cache-Control": "no-store" }
  });
}
