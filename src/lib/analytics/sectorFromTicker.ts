import { COMPANIES } from "@/data/companies";

const EXTRA_SECTORS: Record<string, string> = {
  AMZN: "Consumer / E-commerce",
  META: "Media / Social"
};

/** Map ticker → sector for growth breakdowns. */
export function sectorFromTicker(ticker: string | null | undefined): string {
  if (!ticker) return "Unknown";
  const fromCatalog = COMPANIES.find(
    (c) => c.ticker.toUpperCase() === ticker.toUpperCase()
  );
  if (fromCatalog) return fromCatalog.sector;
  return EXTRA_SECTORS[ticker.toUpperCase()] ?? "Other";
}
