import { createSupabaseServiceRoleClient } from "@/lib/supabase/serviceClient";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { SecFilingFormType } from "@/lib/sec/types";

/**
 * Load a pre-extracted SEC section for AI prompts — never the full filing.
 * Returns null when the section has not been extracted yet for this ticker.
 */
export async function loadExtractedSectionForQuest(params: {
  ticker: string;
  sourceFilingType: SecFilingFormType;
  sourceSectionKey: string;
  maxChars?: number;
}): Promise<{
  excerpt: string;
  sectionLabel: string;
  accessionNumber: string;
  truncated: boolean;
} | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createSupabaseServiceRoleClient();
  const { data: filing } = await supabase
    .from("sec_filings")
    .select("id, accession_number")
    .eq("ticker", params.ticker.toUpperCase())
    .eq("form_type", params.sourceFilingType)
    .order("filed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!filing) return null;

  const { data: section } = await supabase
    .from("filing_sections")
    .select(
      "content_text, section_label, truncated, char_count"
    )
    .eq("filing_id", filing.id)
    .eq("section_key", params.sourceSectionKey)
    .maybeSingle();

  if (!section?.content_text) return null;

  const max = params.maxChars ?? 12_000;
  const text = section.content_text as string;
  const truncated = text.length > max || Boolean(section.truncated);

  return {
    excerpt: text.length > max ? `${text.slice(0, max)}\n[excerpt truncated]` : text,
    sectionLabel: section.section_label as string,
    accessionNumber: filing.accession_number as string,
    truncated
  };
}
