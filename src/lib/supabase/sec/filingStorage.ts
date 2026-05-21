import { createHash } from "crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type {
  FilingSectionRow,
  SecFilingRow
} from "@/lib/supabase/sec/types";
import type { SecFilingFormType, SecFilingRef } from "@/lib/sec/types";
import type { QuestSectionCategory } from "@/lib/sec/sectionMappings";

export type SectionExtractInput = {
  sectionKey: string;
  sectionLabel: string;
  questCategory: QuestSectionCategory;
  contentText: string;
  truncated: boolean;
};

export type StoredFilingExtraction = {
  filing: SecFilingRow;
  sections: FilingSectionRow[];
};

function hashContent(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

export async function upsertFilingWithSections(params: {
  ticker: string;
  cik: string;
  filing: SecFilingRef;
  sections: SectionExtractInput[];
}): Promise<StoredFilingExtraction | null> {
  if (!isSupabaseConfigured() || !params.sections.length) return null;

  const supabase = await createSupabaseServerClient();
  const formType = params.filing.formType as SecFilingFormType;

  const { data: filingRow, error: filingError } = await supabase
    .from("sec_filings")
    .upsert(
      {
        ticker: params.ticker.toUpperCase(),
        cik: params.cik,
        form_type: formType,
        accession_number: params.filing.accessionNumber,
        filed_at: params.filing.filedAt,
        filing_url: params.filing.url,
        period_of_report: params.filing.periodOfReport ?? null,
        updated_at: new Date().toISOString()
      },
      { onConflict: "accession_number" }
    )
    .select()
    .single();

  if (filingError || !filingRow) {
    throw new Error(filingError?.message ?? "Failed to upsert sec_filings row.");
  }

  const filing = filingRow as SecFilingRow;
  const sectionRows: FilingSectionRow[] = [];

  for (const section of params.sections) {
    const contentHash = hashContent(section.contentText);
    const { data, error } = await supabase
      .from("filing_sections")
      .upsert(
        {
          filing_id: filing.id,
          section_key: section.sectionKey,
          section_label: section.sectionLabel,
          quest_category: section.questCategory,
          content_text: section.contentText,
          content_hash: contentHash,
          char_count: section.contentText.length,
          truncated: section.truncated,
          extracted_at: new Date().toISOString()
        },
        { onConflict: "filing_id,section_key" }
      )
      .select()
      .single();

    if (error) {
      throw new Error(
        `Failed to store section ${section.sectionKey}: ${error.message}`
      );
    }

    if (data) sectionRows.push(data as FilingSectionRow);
  }

  return { filing, sections: sectionRows };
}

export async function listStoredSectionsForTicker(
  ticker: string
): Promise<
  Array<{
    filing: SecFilingRow;
    sections: Pick<
      FilingSectionRow,
      | "id"
      | "section_key"
      | "section_label"
      | "quest_category"
      | "char_count"
      | "truncated"
      | "extracted_at"
    >[];
  }>
> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createSupabaseServerClient();
  const symbol = ticker.toUpperCase();

  const { data: filings, error } = await supabase
    .from("sec_filings")
    .select(
      `
      id,
      ticker,
      cik,
      form_type,
      accession_number,
      filed_at,
      filing_url,
      period_of_report,
      created_at,
      updated_at,
      filing_sections (
        id,
        section_key,
        section_label,
        quest_category,
        char_count,
        truncated,
        extracted_at
      )
    `
    )
    .eq("ticker", symbol)
    .order("filed_at", { ascending: false });

  if (error || !filings?.length) return [];

  return (filings as Array<SecFilingRow & { filing_sections: FilingSectionRow[] }>).map(
    (row) => ({
      filing: {
        id: row.id,
        ticker: row.ticker,
        cik: row.cik,
        form_type: row.form_type,
        accession_number: row.accession_number,
        filed_at: row.filed_at,
        filing_url: row.filing_url,
        period_of_report: row.period_of_report,
        created_at: row.created_at,
        updated_at: row.updated_at
      },
      sections: (row.filing_sections ?? []).map((s) => ({
        id: s.id,
        section_key: s.section_key,
        section_label: s.section_label,
        quest_category: s.quest_category,
        char_count: s.char_count,
        truncated: s.truncated,
        extracted_at: s.extracted_at
      }))
    })
  );
}

/** Build AI-safe prompt payload from stored section rows (excerpts only). */
/** Latest stored section text for a ticker (e.g. 10-K Item 8 for geographic tables). */
export async function loadLatestFilingSectionText(
  ticker: string,
  formType: SecFilingFormType,
  sectionKey: string
): Promise<{
  contentText: string;
  sectionLabel: string;
  filedAt: string;
  periodOfReport: string | null;
  accessionNumber: string;
} | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const symbol = ticker.toUpperCase();

  const { data: filing, error: filingError } = await supabase
    .from("sec_filings")
    .select("id, filed_at, period_of_report, accession_number")
    .eq("ticker", symbol)
    .eq("form_type", formType)
    .order("filed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (filingError || !filing) return null;

  const { data: section, error: sectionError } = await supabase
    .from("filing_sections")
    .select("content_text, section_label")
    .eq("filing_id", filing.id)
    .eq("section_key", sectionKey)
    .maybeSingle();

  if (sectionError || !section?.content_text) return null;

  return {
    contentText: section.content_text,
    sectionLabel: section.section_label,
    filedAt: filing.filed_at,
    periodOfReport: filing.period_of_report,
    accessionNumber: filing.accession_number
  };
}

export async function loadSectionsForAiPrompt(
  sectionIds: string[]
): Promise<
  Array<{
    id: string;
    sectionKey: string;
    sectionLabel: string;
    questCategory: string;
    excerpt: string;
    charCount: number;
    truncated: boolean;
  }>
> {
  if (!sectionIds.length || !isSupabaseConfigured()) return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("filing_sections")
    .select("id, section_key, section_label, quest_category, content_text, char_count, truncated")
    .in("id", sectionIds);

  if (error || !data) return [];

  return (data as FilingSectionRow[]).map((row) => ({
    id: row.id,
    sectionKey: row.section_key,
    sectionLabel: row.section_label,
    questCategory: row.quest_category,
    excerpt: row.content_text,
    charCount: row.char_count,
    truncated: row.truncated
  }));
}
