import { NextResponse } from "next/server";

import { apiErrorResponse } from "@/lib/api/errorResponse";
import { checkRateLimit } from "@/lib/api/rateLimit";
import { isTickerAllowedForGeneration } from "@/lib/demo/controlledDemo";
import {
  getCompanySecFilings,
  SecCompanyNotFoundError
} from "@/lib/sec/companyService";
import { isSecApiConfigured, SecApiConfigError } from "@/lib/sec/env";
import { SecApiRequestError } from "@/lib/sec/secApiClient";
import { validateTickerParam } from "@/lib/sec/validateTicker";

export const dynamic = "force-dynamic";

/**
 * GET /api/sec/company?ticker=AAPL
 * Backend-only SEC-API.io proxy — latest 10-K, 10-Q, and DEF 14A for a ticker.
 */
export async function GET(request: Request) {
  if (!checkRateLimit(request, "sec/company")) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

  if (!isSecApiConfigured()) {
    return NextResponse.json(
      { error: "SEC API is not configured. Set SEC_API_KEY in .env.local." },
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
    const result = await getCompanySecFilings(validated.ticker);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }
    });
  } catch (err) {
    if (err instanceof SecCompanyNotFoundError) {
      return NextResponse.json(
        { error: err.message, ticker: err.ticker },
        { status: 404 }
      );
    }

    if (err instanceof SecApiConfigError) {
      return apiErrorResponse(
        "sec/company",
        err,
        503,
        "SEC filing lookup is not configured."
      );
    }

    if (err instanceof SecApiRequestError) {
      const status = err.status >= 400 && err.status < 600 ? err.status : 502;
      return apiErrorResponse(
        "sec/company",
        err,
        status === 401 || status === 403 ? 502 : status,
        "SEC filing lookup request failed."
      );
    }

    return apiErrorResponse(
      "sec/company",
      err,
      500,
      "Failed to load SEC company filings."
    );
  }
}
