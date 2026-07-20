import type { PillarId } from "@/data/pillars";
import type { PromptQualityAnalysis } from "@/lib/ai/promptQualityAnalysis";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/serviceClient";
import { isSupabaseConfigured } from "@/lib/supabase/env";

import type {
  PromptTemplateScope,
  PromptVersionInsightsDto
} from "./types";

export type PromptVersionBody = {
  id: string;
  templateId: string;
  versionNumber: number;
  body: string;
  model: string;
  temperature: number;
  scope: PromptTemplateScope;
  tags: string[];
  teachingNotes: string;
  isRecommended: boolean;
};

export async function getPromptVersionBody(
  versionId: string
): Promise<PromptVersionBody> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("prompt_template_versions")
    .select(
      "id, template_id, version_number, body, model, temperature, tags, teaching_notes, is_recommended"
    )
    .eq("id", versionId)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Version not found.");
  }

  const { data: template } = await supabase
    .from("prompt_templates")
    .select("scope")
    .eq("id", data.template_id)
    .maybeSingle();

  return {
    id: data.id,
    templateId: data.template_id,
    versionNumber: data.version_number,
    body: data.body,
    model: data.model,
    temperature: Number(data.temperature),
    scope: (template?.scope as PromptTemplateScope) ?? "user",
    tags: Array.isArray(data.tags) ? data.tags : [],
    teachingNotes: data.teaching_notes ?? "",
    isRecommended: Boolean(data.is_recommended)
  };
}

export async function savePromptPreviewEvaluation(params: {
  templateId: string;
  versionId: string | null;
  pillarId: PillarId;
  ticker: string;
  questSlug: string;
  cardId: string;
  plainEnglishAnswer: string;
  investorInsight: string | null;
  quality: PromptQualityAnalysis;
  compareLabel?: string;
}): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("prompt_preview_evaluations")
    .insert({
      template_id: params.templateId,
      version_id: params.versionId,
      pillar_id: params.pillarId,
      ticker: params.ticker.trim().toUpperCase(),
      quest_slug: params.questSlug,
      card_id: params.cardId,
      plain_english_answer: params.plainEnglishAnswer,
      investor_insight: params.investorInsight,
      readability_score: params.quality.readability.score,
      repetition_score: params.quality.repetition.score,
      teaching_flow_score: params.quality.teachingFlow.score,
      composite_score: params.quality.compositeScore,
      analysis: params.quality,
      compare_label: params.compareLabel ?? null
    })
    .select("id")
    .single();

  if (error) {
    console.warn("[prompt_preview_evaluations]", error.message);
    return null;
  }

  return data?.id ?? null;
}

export async function getPromptVersionInsights(
  templateId: string
): Promise<PromptVersionInsightsDto[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createSupabaseServiceRoleClient();

  const { data: versions, error: vErr } = await supabase
    .from("prompt_template_versions")
    .select(
      "id, version_number, tags, teaching_notes, is_recommended, change_note, created_at"
    )
    .eq("template_id", templateId)
    .order("version_number", { ascending: false });

  if (vErr) throw new Error(vErr.message);

  const { data: evals, error: eErr } = await supabase
    .from("prompt_preview_evaluations")
    .select(
      "version_id, composite_score, readability_score, repetition_score, teaching_flow_score, created_at"
    )
    .eq("template_id", templateId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (eErr) {
    return (versions ?? []).map((v) => ({
      versionId: v.id,
      versionNumber: v.version_number,
      tags: Array.isArray(v.tags) ? v.tags : [],
      teachingNotes: v.teaching_notes ?? "",
      isRecommended: Boolean(v.is_recommended),
      changeNote: v.change_note ?? "",
      runCount: 0,
      avgComposite: null,
      avgReadability: null,
      avgRepetition: null,
      avgTeachingFlow: null,
      lastEvaluatedAt: null,
      rank: 0,
      autoBest: false
    }));
  }

  const byVersion = new Map<
    string,
    {
      count: number;
      composite: number;
      readability: number;
      repetition: number;
      teaching: number;
      lastAt: string;
    }
  >();

  for (const row of evals ?? []) {
    if (!row.version_id) continue;
    const cur = byVersion.get(row.version_id) ?? {
      count: 0,
      composite: 0,
      readability: 0,
      repetition: 0,
      teaching: 0,
      lastAt: row.created_at
    };
    cur.count += 1;
    cur.composite += Number(row.composite_score);
    cur.readability += Number(row.readability_score);
    cur.repetition += Number(row.repetition_score);
    cur.teaching += Number(row.teaching_flow_score);
    if (row.created_at > cur.lastAt) cur.lastAt = row.created_at;
    byVersion.set(row.version_id, cur);
  }

  const insights: PromptVersionInsightsDto[] = (versions ?? []).map((v) => {
    const agg = byVersion.get(v.id);
    const runCount = agg?.count ?? 0;
    return {
      versionId: v.id,
      versionNumber: v.version_number,
      tags: Array.isArray(v.tags) ? v.tags : [],
      teachingNotes: v.teaching_notes ?? "",
      isRecommended: Boolean(v.is_recommended),
      changeNote: v.change_note ?? "",
      runCount,
      avgComposite:
        runCount > 0 ? Math.round((agg!.composite / runCount) * 10) / 10 : null,
      avgReadability:
        runCount > 0
          ? Math.round((agg!.readability / runCount) * 10) / 10
          : null,
      avgRepetition:
        runCount > 0
          ? Math.round((agg!.repetition / runCount) * 10) / 10
          : null,
      avgTeachingFlow:
        runCount > 0
          ? Math.round((agg!.teaching / runCount) * 10) / 10
          : null,
      lastEvaluatedAt: agg?.lastAt ?? null,
      rank: 0,
      autoBest: false
    };
  });

  const ranked = [...insights]
    .filter((i) => i.runCount > 0 && i.avgComposite != null)
    .sort((a, b) => (b.avgComposite ?? 0) - (a.avgComposite ?? 0));

  ranked.forEach((item, idx) => {
    item.rank = idx + 1;
    if (idx === 0 && (item.runCount ?? 0) >= 2) item.autoBest = true;
  });

  for (const item of insights) {
    const r = ranked.find((x) => x.versionId === item.versionId);
    if (r) {
      item.rank = r.rank;
      item.autoBest = r.autoBest;
    }
  }

  return insights.sort((a, b) => b.versionNumber - a.versionNumber);
}

export async function updatePromptVersionMeta(
  templateId: string,
  versionId: string,
  patch: {
    tags?: string[];
    teachingNotes?: string;
    isRecommended?: boolean;
    changeNote?: string;
  }
): Promise<void> {
  const supabase = createSupabaseServiceRoleClient();
  const payload: Record<string, unknown> = {};

  if (patch.tags) payload.tags = patch.tags;
  if (patch.teachingNotes !== undefined) {
    payload.teaching_notes = patch.teachingNotes;
  }
  if (patch.isRecommended !== undefined) {
    payload.is_recommended = patch.isRecommended;
  }
  if (patch.changeNote !== undefined) {
    payload.change_note = patch.changeNote;
  }

  const { error } = await supabase
    .from("prompt_template_versions")
    .update(payload)
    .eq("id", versionId)
    .eq("template_id", templateId);

  if (error) throw new Error(error.message);

  if (patch.isRecommended === true) {
    await supabase
      .from("prompt_template_versions")
      .update({ is_recommended: false })
      .eq("template_id", templateId)
      .neq("id", versionId);
  }
}
