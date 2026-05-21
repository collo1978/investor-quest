import { NextResponse } from "next/server";

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
      return NextResponse.json({ error: err.message }, { status: 503 });
    }

    if (err instanceof SecApiRequestError) {
      const status = err.status >= 400 && err.status < 600 ? err.status : 502;
      return NextResponse.json(
        { error: "SEC-API.io request failed.", detail: err.message },
        { status: status === 401 || status === 403 ? 502 : status }
      );
    }

    const message =
      err instanceof Error ? err.message : "Failed to load SEC company filings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
