import { NextResponse } from "next/server";

import { SecCompanyNotFoundError } from "@/lib/sec/companyService";
import { runCompanySectionExtraction } from "@/lib/sec/extractionPipeline";
import { isSecApiConfigured, SecApiConfigError } from "@/lib/sec/env";
import { SecApiRequestError } from "@/lib/sec/secApiClient";
import { validateTickerParam } from "@/lib/sec/validateTicker";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

/**
 * POST /api/sec/extract?ticker=AAPL
 * Extract quest-relevant filing sections via SEC-API.io and store in Supabase.
 * Does not invoke AI.
 */
export async function POST(request: Request) {
  if (!isSecApiConfigured()) {
    return NextResponse.json(
      { error: "SEC_API_KEY is not configured." },
      { status: 503 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Supabase is not configured. Section storage requires Supabase credentials."
      },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const validated = validateTickerParam(searchParams.get("ticker"));

  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  try {
    const result = await runCompanySectionExtraction(validated.ticker);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (err) {
    if (err instanceof SecCompanyNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err instanceof SecApiConfigError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    if (err instanceof SecApiRequestError) {
      return NextResponse.json(
        { error: "SEC-API.io request failed.", detail: err.message },
        { status: 502 }
      );
    }
    const message =
      err instanceof Error ? err.message : "Section extraction failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
