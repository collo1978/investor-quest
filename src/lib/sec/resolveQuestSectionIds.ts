import {
  listStoredSectionsForTicker,
  loadSectionsForAiPrompt
} from "@/lib/supabase/sec/filingStorage";
import type { QuestCardSpec } from "@/lib/sec/questCardSpec";
import type { SecFilingFormType } from "@/lib/sec/types";

export type SectionRequirement = {
  formType: SecFilingFormType;
  sectionKey: string;
};

/** Unique (form, section) pairs required by a set of card specs. */
export function sectionRequirementsFromSpecs(
  specs: readonly QuestCardSpec[]
): SectionRequirement[] {
  const seen = new Set<string>();
  const out: SectionRequirement[] = [];
  for (const spec of specs) {
    for (const sectionKey of spec.sectionKeys) {
      const id = `${spec.formType}:${sectionKey}`;
      if (seen.has(id)) continue;
      seen.add(id);
      out.push({ formType: spec.formType, sectionKey });
    }
  }
  return out;
}

export async function getExtractReadinessForSpecs(
  ticker: string,
  specs: readonly QuestCardSpec[]
): Promise<QuestExtractReadiness> {
  const requirements = sectionRequirementsFromSpecs(specs);
  const stored = await listStoredSectionsForTicker(ticker);
  const missingSectionKeys: string[] = [];
  let hasAnyFiling = false;

  for (const req of requirements) {
    const filing = stored.find((f) => f.filing.form_type === req.formType);
    if (!filing) {
      missingSectionKeys.push(`${req.formType}:${req.sectionKey}`);
      continue;
    }
    hasAnyFiling = true;
    const present = new Set(filing.sections.map((s) => s.section_key));
    if (!present.has(req.sectionKey)) {
      missingSectionKeys.push(`${req.formType}:${req.sectionKey}`);
    }
  }

  return {
    ready: missingSectionKeys.length === 0,
    missingSectionKeys,
    hasFiling: hasAnyFiling
  };
}

export type ResolvedQuestSections = {
  filingId: string;
  accessionNumber: string;
  formType: SecFilingFormType;
  sectionIds: string[];
  sectionKeys: string[];
  sectionHashes: string[];
};

export type QuestExtractReadiness = {
  ready: boolean;
  missingSectionKeys: string[];
  hasFiling: boolean;
};

export async function getQuestExtractReadiness(params: {
  ticker: string;
  formType: SecFilingFormType;
  requiredSectionKeys: readonly string[];
}): Promise<QuestExtractReadiness> {
  const stored = await listStoredSectionsForTicker(params.ticker);
  const filing = stored.find((f) => f.filing.form_type === params.formType);
  if (!filing) {
    return {
      ready: false,
      missingSectionKeys: [...params.requiredSectionKeys],
      hasFiling: false
    };
  }

  const present = new Set(filing.sections.map((s) => s.section_key));
  const missingSectionKeys = params.requiredSectionKeys.filter(
    (k) => !present.has(k)
  );

  return {
    ready: missingSectionKeys.length === 0,
    missingSectionKeys,
    hasFiling: true
  };
}

export async function resolveSectionIdsForQuestCard(
  ticker: string,
  spec: QuestCardSpec
): Promise<ResolvedQuestSections | null> {
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
