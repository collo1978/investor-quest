import {
  fetchLatest10K,
  fetchLatest10Q,
  fetchLatestDef14A
} from "@/lib/sec/filingsService";
import { resolveCompanyByTicker } from "@/lib/sec/mappingService";
import type { SecCompanyFilingsResult } from "@/lib/sec/types";

export class SecCompanyNotFoundError extends Error {
  readonly ticker: string;

  constructor(ticker: string) {
    super(`No SEC company mapping found for ticker: ${ticker}`);
    this.name = "SecCompanyNotFoundError";
    this.ticker = ticker;
  }
}

/**
 * Company lookup + latest SEC filings (10-K, 10-Q, DEF 14A).
 * Earnings call transcripts are intentionally excluded — use a future transcript provider.
 */
export async function getCompanySecFilings(
  ticker: string
): Promise<SecCompanyFilingsResult> {
  const company = await resolveCompanyByTicker(ticker);
  if (!company) {
    throw new SecCompanyNotFoundError(ticker);
  }

  const symbol = company.ticker;

  const [latest10K, latest10Q, latestDef14A] = await Promise.all([
    fetchLatest10K(symbol),
    fetchLatest10Q(symbol),
    fetchLatestDef14A(symbol)
  ]);

  return {
    companyName: company.name,
    ticker: symbol,
    cik: company.cik,
    latest10K,
    latest10Q,
    latestDef14A
  };
}
