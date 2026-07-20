import { createSupabaseServiceRoleClient } from "@/lib/supabase/serviceClient";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { buildAiPromptFromSectionIds } from "@/lib/sec/aiPromptBuilder";
import type { AiGenerationJobRow } from "@/lib/supabase/sec/types";

export type CreateAiJobInput = {
  ticker: string;
  filingId?: string;
  jobType: "quest_generation" | "quiz_generation" | "section_summary";
  sectionIds: string[];
};

/**
 * Creates a pending AI job with prompt_payload containing section excerpts only.
 * Does not invoke an LLM — generation is wired in a later phase.
 */
export async function createPendingAiGenerationJob(
  input: CreateAiJobInput
): Promise<AiGenerationJobRow | null> {
  if (!isSupabaseConfigured()) return null;

  const promptPayload = await buildAiPromptFromSectionIds(input.sectionIds);

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("ai_generation_jobs")
    .insert({
      ticker: input.ticker.toUpperCase(),
      filing_id: input.filingId ?? null,
      job_type: input.jobType,
      status: "pending",
      input_section_ids: input.sectionIds,
      prompt_payload: promptPayload
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as AiGenerationJobRow;
}
