import { loadSectionsForAiPrompt } from "@/lib/supabase/sec/filingStorage";

const MAX_PROMPT_CHARS_PER_SECTION = 12_000;

/**
 * Assembles AI prompt input from stored filing sections only.
 * Never includes full filing text — excerpts are capped per section.
 */
export async function buildAiPromptFromSectionIds(sectionIds: string[]) {
  const sections = await loadSectionsForAiPrompt(sectionIds);

  return {
    source: "filing_sections" as const,
    sectionCount: sections.length,
    sections: sections.map((s) => ({
      sectionId: s.id,
      sectionKey: s.sectionKey,
      sectionLabel: s.sectionLabel,
      questCategory: s.questCategory,
      charCount: s.charCount,
      truncated: s.truncated,
      excerpt:
        s.excerpt.length > MAX_PROMPT_CHARS_PER_SECTION
          ? `${s.excerpt.slice(0, MAX_PROMPT_CHARS_PER_SECTION)}\n\n[excerpt truncated for prompt]`
          : s.excerpt
    }))
  };
}
