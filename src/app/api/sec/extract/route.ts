import { NextResponse } from "next/server";

import { apiErrorResponse } from "@/lib/api/errorResponse";
import { checkRateLimit } from "@/lib/api/rateLimit";
import { isTickerAllowedForGeneration } from "@/lib/demo/controlledDemo";
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
  if (!checkRateLimit(request, "sec/extract")) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

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

  if (!isTickerAllowedForGeneration(validated.ticker)) {
    return NextResponse.json(
      { error: `Generation is limited to the demo company while in controlled-demo mode.` },
      { status: 403 }
    );
  }

  try {
    const result = await runCompanySectionExtraction(validated.ticker);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (err) {
    if (err instanceof SecCompanyNotFoundError) {
      // Controlled, expected message (e.g. "Company AAPL not found") — safe to show as-is.
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err instanceof SecApiConfigError) {
      return apiErrorResponse(
        "sec/extract",
        err,
        503,
        "SEC filing lookup is not configured."
      );
    }
    if (err instanceof SecApiRequestError) {
      return apiErrorResponse(
        "sec/extract",
        err,
        502,
        "SEC filing lookup request failed."
      );
    }
    return apiErrorResponse("sec/extract", err, 500, "Section extraction failed.");
  }
}
