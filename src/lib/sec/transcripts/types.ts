/**
 * Earnings call transcripts are NOT SEC filings.
 * Wire a separate transcript provider here later (e.g. third-party API).
 * Do not route transcript fetches through SEC-API.io.
 */

export type TranscriptLookupRequest = {
  ticker: string;
  /** Fiscal year or call date — shape TBD per provider */
  fiscalYear?: number;
};

export type TranscriptLookupResult = {
  provider: "none";
  available: false;
};
