import { secApiGet } from "@/lib/sec/secApiClient";
import type { SecCompanyMapping } from "@/lib/sec/types";

type SecMappingRow = {
  name: string;
  ticker: string;
  cik: string;
  exchange?: string;
  isDelisted?: boolean;
};

/** Map ticker → company metadata via SEC-API.io Mapping API. */
export async function searchCompaniesByTicker(
  ticker: string
): Promise<SecCompanyMapping[]> {
  const rows = await secApiGet<SecMappingRow[]>(
    `/mapping/ticker/${encodeURIComponent(ticker)}`
  );

  if (!Array.isArray(rows) || rows.length === 0) return [];

  return rows.map((row) => ({
    name: row.name,
    ticker: row.ticker.toUpperCase(),
    cik: row.cik,
    exchange: row.exchange,
    isDelisted: Boolean(row.isDelisted)
  }));
}

/** Resolve a single primary listing for a ticker (prefers active listings). */
export async function resolveCompanyByTicker(
  ticker: string
): Promise<SecCompanyMapping | null> {
  const matches = await searchCompaniesByTicker(ticker);
  if (!matches.length) return null;

  const active = matches.filter((m) => !m.isDelisted);
  const pool = active.length ? active : matches;

  return (
    pool.find((m) => m.ticker === ticker) ??
    pool.sort((a, b) => a.name.localeCompare(b.name))[0] ??
    null
  );
}

/** Company name search via SEC-API.io Mapping API (for future routes). */
export async function searchCompaniesByName(
  name: string
): Promise<SecCompanyMapping[]> {
  const rows = await secApiGet<SecMappingRow[]>(
    `/mapping/name/${encodeURIComponent(name)}`
  );

  if (!Array.isArray(rows)) return [];

  return rows.map((row) => ({
    name: row.name,
    ticker: row.ticker.toUpperCase(),
    cik: row.cik,
    exchange: row.exchange,
    isDelisted: Boolean(row.isDelisted)
  }));
}
