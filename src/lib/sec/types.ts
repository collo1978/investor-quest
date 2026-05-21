/** SEC EDGAR filing reference (10-K, 10-Q, DEF 14A). Not used for earnings transcripts. */

export type SecFilingFormType = "10-K" | "10-Q" | "DEF 14A";

export type SecFilingRef = {
  formType: SecFilingFormType;
  /** ISO datetime from SEC-API `filedAt` */
  filedAt: string;
  /** Filing details page URL on sec.gov */
  url: string;
  accessionNumber: string;
  periodOfReport?: string;
};

export type SecCompanyMapping = {
  name: string;
  ticker: string;
  cik: string;
  exchange?: string;
  isDelisted: boolean;
};

export type SecCompanyFilingsResult = {
  companyName: string;
  ticker: string;
  cik: string;
  latest10K: SecFilingRef | null;
  latest10Q: SecFilingRef | null;
  latestDef14A: SecFilingRef | null;
};

/** Reserved for a future non-SEC earnings transcript provider. */
export type EarningsTranscriptProviderId = "none";

export type ExtractedSectionSummary = {
  sectionKey: string;
  sectionLabel: string;
  questCategory: string;
  charCount: number;
  truncated: boolean;
};
