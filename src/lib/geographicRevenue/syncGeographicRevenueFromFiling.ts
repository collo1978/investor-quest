import { parseGeographicRevenueFromFiling } from "@/lib/geographicRevenue/parseGeographicRevenueFromFiling";
import { upsertGeographicRevenueReport } from "@/lib/supabase/geographicRevenue";
import { loadLatestFilingSectionText } from "@/lib/supabase/sec/filingStorage";

const GEO_SECTION_KEYS = ["item_8", "item_7", "item_1"] as const;

/**
 * Parse latest 10-K geographic tables from stored filing sections and persist to Supabase.
 * Returns true when a report with ≥2 regions was saved.
 */
export async function syncGeographicRevenueFromStoredFiling(
  ticker: string,
  companyName?: string
): Promise<boolean> {
  for (const sectionKey of GEO_SECTION_KEYS) {
    const section = await loadLatestFilingSectionText(ticker, "10-K", sectionKey);
    if (!section?.contentText || section.contentText.length < 200) continue;

    const parsed = parseGeographicRevenueFromFiling(
      section.contentText,
      companyName
    );
    if (parsed.segments.length < 2) continue;

    const fiscalYear =
      parsed.fiscalYear ??
      (section.periodOfReport
        ? new Date(section.periodOfReport).getUTCFullYear()
        : new Date(section.filedAt).getUTCFullYear());

    await upsertGeographicRevenueReport({
      ticker,
      fiscalYear,
      segments: parsed.segments,
      investorInsight: parsed.investorInsight,
      sourceForm: "10-K",
      sourceSectionLabel: section.sectionLabel,
      accessionNumber: section.accessionNumber
    });

    return true;
  }

  return false;
}
