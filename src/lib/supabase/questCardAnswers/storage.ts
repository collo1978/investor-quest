import { createHash } from "crypto";

import { sanitizeQuestAnswerText } from "@/lib/quests/sanitizeQuestAnswer";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/serviceClient";
import { isSupabaseConfigured } from "@/lib/supabase/env";

import type {
  CompanyQuestCardAnswerRow,
  StoredQuestCardAnswer
} from "@/lib/supabase/questCardAnswers/types";

export type UpsertQuestCardAnswerInput = {
  ticker: string;
  pillarId?: string;
  questSlug: string;
  cardId: string;
  plainEnglishAnswer: string;
  investorInsight?: string | null;
  sourceForm: string;
  sourceAccession: string | null;
  sourceSectionKeys: string[];
  filingSectionIds: string[];
  contentHash: string;
};

function mapRow(row: CompanyQuestCardAnswerRow): StoredQuestCardAnswer {
  return {
    cardId: row.card_id,
    plainEnglishAnswer: sanitizeQuestAnswerText(row.plain_english_answer),
    investorInsight: row.investor_insight
      ? sanitizeQuestAnswerText(row.investor_insight)
      : null,
    sourceAccession: row.source_accession,
    sourceForm: row.source_form,
    sourceSectionKeys: row.source_section_keys ?? [],
    generatedAt: row.generated_at
  };
}

export function hashSectionContent(texts: string[]): string {
  return createHash("sha256")
    .update(texts.join("\n---\n"), "utf8")
    .digest("hex");
}

export async function upsertQuestCardAnswer(
  input: UpsertQuestCardAnswerInput
): Promise<StoredQuestCardAnswer | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createSupabaseServiceRoleClient();
  const ticker = input.ticker.trim().toUpperCase();

  const { data, error } = await supabase
    .from("company_quest_card_answers")
    .upsert(
      {
        ticker,
        pillar_id: input.pillarId ?? "financials",
        quest_slug: input.questSlug,
        card_id: input.cardId,
        plain_english_answer: input.plainEnglishAnswer,
        investor_insight: input.investorInsight?.trim() || null,
        source_form: input.sourceForm,
        source_accession: input.sourceAccession,
        source_section_keys: input.sourceSectionKeys,
        filing_section_ids: input.filingSectionIds,
        content_hash: input.contentHash,
        generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { onConflict: "ticker,pillar_id,quest_slug,card_id" }
    )
    .select()
    .single();

  if (error || !data) {
    throw new Error(
      error?.message ?? "Failed to upsert company_quest_card_answers row."
    );
  }

  return mapRow(data as CompanyQuestCardAnswerRow);
}

export async function fetchQuestCardAnswersForSlug(params: {
  ticker: string;
  questSlug: string;
  pillarId?: string;
}): Promise<Record<string, StoredQuestCardAnswer>> {
  if (!isSupabaseConfigured()) return {};

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("company_quest_card_answers")
    .select(
      "id, ticker, pillar_id, quest_slug, card_id, plain_english_answer, investor_insight, source_form, source_accession, source_section_keys, filing_section_ids, content_hash, generated_at, updated_at"
    )
    .eq("ticker", params.ticker.trim().toUpperCase())
    .eq("pillar_id", params.pillarId ?? "financials")
    .eq("quest_slug", params.questSlug);

  if (error || !data?.length) return {};

  const out: Record<string, StoredQuestCardAnswer> = {};
  for (const row of data as CompanyQuestCardAnswerRow[]) {
    out[row.card_id] = mapRow(row);
  }
  return out;
}
