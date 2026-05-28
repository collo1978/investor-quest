import { getPlayableDemoCompanies } from "@/lib/demo/playableDemo";
import type { Company } from "@/data/companies";

export type SupportedSearchRow = {
  kind: "supported";
  company: Company;
};

export type UnsupportedSearchRow = {
  kind: "unsupported";
  query: string;
  /** Display ticker (uppercase). */
  ticker: string;
  /** Best-effort label for the row title. */
  label: string;
};

export type CompanySearchRow = SupportedSearchRow | UnsupportedSearchRow;

export type CompanySearchResult =
  | { kind: "empty" }
  | { kind: "results"; rows: readonly CompanySearchRow[] };

function normalizeQuery(raw: string): string {
  return raw.trim();
}

function matchSupportedCompanies(query: string): Company[] {
  const upper = query.toUpperCase();
  const lower = query.toLowerCase();
  const playable = getPlayableDemoCompanies();

  return playable.filter(
    (c) =>
      c.ticker === upper ||
      c.ticker.startsWith(upper) ||
      c.name.toLowerCase().includes(lower)
  );
}

function unsupportedLabel(query: string): string {
  const q = query.trim();
  if (/^[A-Za-z]{1,5}$/.test(q)) return q.toUpperCase();
  return q
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Playable demo companies (AAPL, NKE, NVDA) plus an optional disabled row
 * when the query does not match the directory.
 */
export function resolveCompanySearch(query: string): CompanySearchResult {
  const q = normalizeQuery(query);
  if (!q) return { kind: "empty" };

  const matches = matchSupportedCompanies(q);
  const rows: CompanySearchRow[] = matches.map((company) => ({
    kind: "supported",
    company
  }));

  const exactSupported = matches.some(
    (c) =>
      c.ticker === q.toUpperCase() ||
      c.name.toLowerCase() === q.toLowerCase()
  );

  if (!exactSupported && matches.length === 0) {
    rows.push({
      kind: "unsupported",
      query: q,
      ticker: q.toUpperCase(),
      label: unsupportedLabel(q)
    });
  }

  return { kind: "results", rows };
}

/** Playable demo companies for empty-query hints. */
export const SUPPORTED_EXPLORE_COMPANIES = getPlayableDemoCompanies();
