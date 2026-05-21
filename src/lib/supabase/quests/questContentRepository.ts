import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  mapInputToRow,
  mapRowToAdminDto,
  mapRowToQuestTemplate
} from "@/lib/supabase/quests/mapQuestContentCard";
import type {
  QuestContentCardInput,
  QuestContentCardRow,
  QuestContentCardUpdate
} from "@/lib/supabase/quests/types";
import type { PillarId } from "@/data/pillars";
import type { QuestTemplate } from "@/data/quests/types";

function partnerFilter(partnerId?: string | null) {
  if (!partnerId) return () => true;
  return (row: QuestContentCardRow) =>
    !row.partner_ids?.length || row.partner_ids.includes(partnerId);
}

export async function listQuestContentCards(options?: {
  partnerId?: string;
  includeInactive?: boolean;
}): Promise<QuestContentCardRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("quest_content_cards")
    .select("*")
    .order("pillar_id", { ascending: true })
    .order("display_order", { ascending: true });

  if (!options?.includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as QuestContentCardRow[];
  return rows.filter(partnerFilter(options?.partnerId));
}

export async function listQuestContentAdmin(options?: {
  partnerId?: string;
}) {
  const rows = await listQuestContentCards({
    partnerId: options?.partnerId,
    includeInactive: true
  });
  return rows.map(mapRowToAdminDto);
}

export async function getQuestContentCardById(
  id: string
): Promise<QuestContentCardRow | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("quest_content_cards")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as QuestContentCardRow) ?? null;
}

export async function createQuestContentCard(input: QuestContentCardInput) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const supabase = await createSupabaseServerClient();
  const row = mapInputToRow(input);

  const { data, error } = await supabase
    .from("quest_content_cards")
    .insert({
      ...row,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRowToAdminDto(data as QuestContentCardRow);
}

export async function updateQuestContentCard(
  id: string,
  patch: QuestContentCardUpdate
) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const existing = await getQuestContentCardById(id);
  if (!existing) throw new Error("Quest card not found.");

  const merged: QuestContentCardInput = {
    slug: patch.slug ?? existing.slug,
    pillarId: patch.pillarId ?? existing.pillar_id,
    questType: patch.questType ?? existing.quest_type,
    title: patch.title ?? existing.title,
    objective: patch.objective ?? existing.objective,
    description: patch.description ?? existing.description,
    investorQuestion: patch.investorQuestion ?? existing.investor_question,
    whyThisMatters: patch.whyThisMatters ?? existing.why_this_matters,
    plainEnglishAnswer:
      patch.plainEnglishAnswer !== undefined
        ? patch.plainEnglishAnswer
        : existing.plain_english_answer,
    sourceFilingType: patch.sourceFilingType ?? existing.source_filing_type,
    sourceSectionKey: patch.sourceSectionKey ?? existing.source_section_key,
    sourceSectionLabel:
      patch.sourceSectionLabel ?? existing.source_section_label,
    aiPromptTemplate: patch.aiPromptTemplate ?? existing.ai_prompt_template,
    xpReward: patch.xpReward ?? existing.xp_reward,
    quizFormat: patch.quizFormat ?? existing.quiz_format,
    quizConfig:
      patch.quizConfig !== undefined ? patch.quizConfig : existing.quiz_config,
    displayOrder: patch.displayOrder ?? existing.display_order,
    hubIcon:
      patch.hubIcon !== undefined ? patch.hubIcon : existing.hub_icon,
    hubSubtitle:
      patch.hubSubtitle !== undefined
        ? patch.hubSubtitle
        : existing.hub_subtitle,
    hubCardCount:
      patch.hubCardCount !== undefined
        ? patch.hubCardCount
        : existing.hub_card_count,
    hubRoute:
      patch.hubRoute !== undefined ? patch.hubRoute : existing.hub_route,
    hubLocked:
      patch.hubLocked !== undefined ? patch.hubLocked : existing.hub_locked,
    forcesCategory:
      patch.forcesCategory !== undefined
        ? patch.forcesCategory
        : existing.forces_category,
    partnerIds: patch.partnerIds ?? existing.partner_ids,
    isActive: patch.isActive ?? existing.is_active
  };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("quest_content_cards")
    .update({
      ...mapInputToRow(merged),
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRowToAdminDto(data as QuestContentCardRow);
}

export async function reorderQuestContentCards(
  orderedIds: string[],
  pillarId: PillarId
) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const supabase = await createSupabaseServerClient();

  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("quest_content_cards")
      .update({
        display_order: (i + 1) * 10,
        updated_at: new Date().toISOString()
      })
      .eq("id", orderedIds[i])
      .eq("pillar_id", pillarId);

    if (error) throw new Error(error.message);
  }
}

export async function loadQuestTemplatesFromSupabase(options?: {
  partnerId?: string;
}): Promise<QuestTemplate[]> {
  const rows = await listQuestContentCards(options);
  return rows.map(mapRowToQuestTemplate);
}
