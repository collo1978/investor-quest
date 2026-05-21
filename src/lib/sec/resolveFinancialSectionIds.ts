import {
  listStoredSectionsForTicker,
  loadSectionsForAiPrompt
} from "@/lib/supabase/sec/filingStorage";
import {
  FINANCIAL_REQUIRED_10K_SECTION_KEYS,
  type FinancialQuestCardSpec
} from "@/lib/sec/financialQuestSectionMap";
import type { SecFilingFormType } from "@/lib/sec/types";

export type ResolvedFinancialSections = {
  filingId: string;
  accessionNumber: string;
  formType: SecFilingFormType;
  sectionIds: string[];
  sectionKeys: string[];
  sectionHashes: string[];
};

export type FinancialExtractReadiness = {
  ready: boolean;
  missingSectionKeys: string[];
  has10K: boolean;
};

export async function getFinancialExtractReadiness(
  ticker: string
): Promise<FinancialExtractReadiness> {
  const stored = await listStoredSectionsForTicker(ticker);
  const tenK = stored.find((f) => f.filing.form_type === "10-K");
  if (!tenK) {
    return {
      ready: false,
      missingSectionKeys: [...FINANCIAL_REQUIRED_10K_SECTION_KEYS],
      has10K: false
    };
  }

  const present = new Set(tenK.sections.map((s) => s.section_key));
  const missingSectionKeys = FINANCIAL_REQUIRED_10K_SECTION_KEYS.filter(
    (k) => !present.has(k)
  );

  return {
    ready: missingSectionKeys.length === 0,
    missingSectionKeys,
    has10K: true
  };
}

export async function resolveSectionIdsForCard(
  ticker: string,
  spec: FinancialQuestCardSpec
): Promise<ResolvedFinancialSections | null> {
  const stored = await listStoredSectionsForTicker(ticker);
  const filing = stored.find((f) => f.filing.form_type === spec.formType);
  if (!filing) return null;

  const byKey = new Map(
    filing.sections.map((s) => [s.section_key, s] as const)
  );

  const sectionIds: string[] = [];
  const sectionKeys: string[] = [];

  for (const key of spec.sectionKeys) {
    const row = byKey.get(key);
    if (!row) return null;
    sectionIds.push(row.id);
    sectionKeys.push(key);
  }

  if (!sectionIds.length) return null;

  const fullRows = await loadSectionHashes(sectionIds);
  if (!fullRows) return null;

  return {
    filingId: filing.filing.id,
    accessionNumber: filing.filing.accession_number,
    formType: spec.formType,
    sectionIds,
    sectionKeys,
    sectionHashes: fullRows
  };
}

async function loadSectionHashes(
  sectionIds: string[]
): Promise<string[] | null> {
  const sections = await loadSectionsForAiPrompt(sectionIds);
  if (sections.length !== sectionIds.length) return null;
  return sections.map((s) => s.excerpt);
}
