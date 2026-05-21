import { NextResponse } from "next/server";

import { getStoredCompanySectionSummary } from "@/lib/sec/extractionPipeline";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { validateTickerParam } from "@/lib/sec/validateTicker";

export const dynamic = "force-dynamic";

/**
 * GET /api/sec/sections?ticker=AAPL
 * Returns stored section metadata (no full text) for reuse checks.
 */
export async function GET(request: Request) {
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

  const stored = await getStoredCompanySectionSummary(validated.ticker);

  return NextResponse.json(
    {
      ticker: validated.ticker,
      filings: stored.map(({ filing, sections }) => ({
        formType: filing.form_type,
        accessionNumber: filing.accession_number,
        filedAt: filing.filed_at,
        filingUrl: filing.filing_url,
        sections
      }))
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
