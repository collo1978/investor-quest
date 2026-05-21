import { secApiPost } from "@/lib/sec/secApiClient";
import type { SecFilingFormType, SecFilingRef } from "@/lib/sec/types";

type SecQueryFilingRow = {
  accessionNo: string;
  formType: string;
  filedAt: string;
  linkToFilingDetails?: string;
  linkToHtml?: string;
  periodOfReport?: string;
  ticker?: string;
  companyName?: string;
};

type SecQueryResponse = {
  filings?: SecQueryFilingRow[];
};

function normalizeFilingUrl(url: string | undefined): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("www.")) {
    return `https://${trimmed}`;
  }
  return `https://www.${trimmed.replace(/^\/+/, "")}`;
}

function mapFilingRow(
  row: SecQueryFilingRow,
  formType: SecFilingFormType
): SecFilingRef | null {
  const url =
    normalizeFilingUrl(row.linkToFilingDetails) ??
    normalizeFilingUrl(row.linkToHtml);

  if (!url || !row.accessionNo || !row.filedAt) return null;

  return {
    formType,
    filedAt: row.filedAt,
    url,
    accessionNumber: row.accessionNo,
    periodOfReport: row.periodOfReport
  };
}

async function fetchLatestFiling(
  ticker: string,
  formType: SecFilingFormType
): Promise<SecFilingRef | null> {
  const response = await secApiPost<SecQueryResponse>({
    query: `ticker:${ticker} AND formType:"${formType}"`,
    from: "0",
    size: "1",
    sort: [{ filedAt: { order: "desc" } }]
  });

  const row = response.filings?.[0];
  if (!row) return null;

  return mapFilingRow(row, formType);
}

export async function fetchLatest10K(ticker: string): Promise<SecFilingRef | null> {
  return fetchLatestFiling(ticker, "10-K");
}

export async function fetchLatest10Q(ticker: string): Promise<SecFilingRef | null> {
  return fetchLatestFiling(ticker, "10-Q");
}

export async function fetchLatestDef14A(
  ticker: string
): Promise<SecFilingRef | null> {
  return fetchLatestFiling(ticker, "DEF 14A");
}
