import { extractFilingSection } from "@/lib/sec/extractorService";
import { extractDef14AProxySections } from "@/lib/sec/proxySectionExtractor";
import { getSectionMappingsForForm } from "@/lib/sec/sectionMappings";
import type { SectionExtractInput } from "@/lib/supabase/sec/filingStorage";
import {
  listStoredSectionsForTicker,
  upsertFilingWithSections
} from "@/lib/supabase/sec/filingStorage";
import { getCompanySecFilings } from "@/lib/sec/companyService";
import { parseGeographicRevenueFromFiling } from "@/lib/geographicRevenue/parseGeographicRevenueFromFiling";
import { upsertGeographicRevenueReport } from "@/lib/supabase/geographicRevenue";
import type { SecFilingFormType, SecFilingRef } from "@/lib/sec/types";

export type FilingExtractionResult = {
  formType: SecFilingFormType;
  accessionNumber: string;
  sectionsExtracted: number;
  sectionKeys: string[];
  stored: boolean;
  skipped?: string;
};

export type CompanyExtractionPipelineResult = {
  ticker: string;
  cik: string;
  companyName: string;
  filings: FilingExtractionResult[];
  totalSectionsStored: number;
};

async function extractSectionsForFiling(
  filing: SecFilingRef
): Promise<SectionExtractInput[]> {
  const mappings = getSectionMappingsForForm(filing.formType);
  const sections: SectionExtractInput[] = [];

  if (filing.formType === "DEF 14A") {
    const proxySections = await extractDef14AProxySections(filing.url, mappings);
    for (const mapping of mappings) {
      const extracted = proxySections.get(mapping.sectionKey);
      if (!extracted?.text) continue;
      sections.push({
        sectionKey: mapping.sectionKey,
        sectionLabel: mapping.sectionLabel,
        questCategory: mapping.questCategory,
        contentText: extracted.text,
        truncated: extracted.truncated
      });
    }
    return sections;
  }

  for (const mapping of mappings) {
    if (!mapping.extractorItem) continue;
    try {
      const { text, truncated } = await extractFilingSection({
        filingUrl: filing.url,
        extractorItem: mapping.extractorItem
      });
      if (!text || text.length < 80) continue;
      sections.push({
        sectionKey: mapping.sectionKey,
        sectionLabel: mapping.sectionLabel,
        questCategory: mapping.questCategory,
        contentText: text,
        truncated
      });
    } catch {
      // Section may be missing in non-standard filings — continue with others.
    }
  }

  return sections;
}

const GEO_REVENUE_SECTION_KEYS = ["item_8", "item_7", "item_1"] as const;

async function persistGeographicRevenueFromSections(
  ticker: string,
  companyName: string | undefined,
  sections: SectionExtractInput[],
  filing: SecFilingRef
): Promise<void> {
  for (const sectionKey of GEO_REVENUE_SECTION_KEYS) {
    const section = sections.find((s) => s.sectionKey === sectionKey);
    if (!section?.contentText || section.contentText.length < 200) continue;

    const parsed = parseGeographicRevenueFromFiling(
      section.contentText,
      companyName
    );
    if (parsed.segments.length < 2) continue;

    const fiscalYear =
      parsed.fiscalYear ?? new Date(filing.filedAt).getUTCFullYear();

    await upsertGeographicRevenueReport({
      ticker,
      fiscalYear,
      segments: parsed.segments,
      investorInsight: parsed.investorInsight,
      sourceForm: "10-K",
      sourceSectionLabel: section.sectionLabel,
      accessionNumber: filing.accessionNumber
    });
    return;
  }
}

async function processOneFiling(
  ticker: string,
  cik: string,
  filing: SecFilingRef | null,
  formType: SecFilingFormType,
  companyName?: string
): Promise<FilingExtractionResult> {
  if (!filing) {
    return {
      formType,
      accessionNumber: "",
      sectionsExtracted: 0,
      sectionKeys: [],
      stored: false,
      skipped: "No filing found"
    };
  }

  const sections = await extractSectionsForFiling(filing);
  const stored = await upsertFilingWithSections({
    ticker,
    cik,
    filing,
    sections
  });

  if (stored && formType === "10-K") {
    await persistGeographicRevenueFromSections(
      ticker,
      companyName,
      sections,
      filing
    );
  }

  return {
    formType: filing.formType,
    accessionNumber: filing.accessionNumber,
    sectionsExtracted: sections.length,
    sectionKeys: sections.map((s) => s.sectionKey),
    stored: Boolean(stored)
  };
}

/**
 * Extract quest-relevant sections for latest 10-K, 10-Q, and DEF 14A;
 * persist to Supabase for reuse. Does not send content to any LLM.
 */
export async function runCompanySectionExtraction(
  ticker: string
): Promise<CompanyExtractionPipelineResult> {
  const catalog = await getCompanySecFilings(ticker);

  const results = await Promise.all([
    processOneFiling(
      catalog.ticker,
      catalog.cik,
      catalog.latest10K,
      "10-K",
      catalog.companyName
    ),
    processOneFiling(catalog.ticker, catalog.cik, catalog.latest10Q, "10-Q"),
    processOneFiling(
      catalog.ticker,
      catalog.cik,
      catalog.latestDef14A,
      "DEF 14A"
    )
  ]);

  const totalSectionsStored = results.reduce(
    (sum, r) => sum + r.sectionsExtracted,
    0
  );

  return {
    ticker: catalog.ticker,
    cik: catalog.cik,
    companyName: catalog.companyName,
    filings: results,
    totalSectionsStored
  };
}

export async function getStoredCompanySectionSummary(ticker: string) {
  return listStoredSectionsForTicker(ticker);
}
