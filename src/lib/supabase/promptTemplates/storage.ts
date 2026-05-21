import {
  formatPromptTemplateKey,
  getCodeDefaultForTemplateKey,
  getCodeDefaultSystemPrompt,
  getCodeDefaultUserTemplate,
  listCodeDefaultTemplates,
  parsePromptTemplateKey,
  SYNC_FROM_CODE_CHANGE_NOTE
} from "@/lib/ai/promptDefaults";
import type { PillarId } from "@/data/pillars";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

import type {
  PromptTemplateDetailDto,
  PromptTemplateDto,
  PromptTemplateRow,
  PromptTemplateVersionDto,
  PromptTemplateVersionRow,
  ResetPromptFromCodeResult,
  SavePromptVersionInput,
  SyncPromptFromCodeResult,
  SyncPromptsFromCodeSummary
} from "./types";
import { SYNC_FROM_CODE_SOURCE_LABEL } from "./types";

function mapTemplate(row: PromptTemplateRow, extras?: {
  activeVersionNumber?: number | null;
  versionCount?: number;
}): PromptTemplateDto {
  return {
    id: row.id,
    templateKey: row.template_key,
    scope: row.scope,
    pillarId: row.pillar_id,
    questSlug: row.quest_slug,
    label: row.label,
    description: row.description,
    activeVersionId: row.active_version_id,
    activeVersionNumber: extras?.activeVersionNumber ?? null,
    versionCount: extras?.versionCount ?? 0,
    updatedAt: row.updated_at
  };
}

function mapVersion(
  row: PromptTemplateVersionRow,
  activeVersionId: string | null
): PromptTemplateVersionDto {
  return {
    id: row.id,
    templateId: row.template_id,
    versionNumber: row.version_number,
    body: row.body,
    model: row.model,
    temperature: Number(row.temperature),
    changeNote: row.change_note,
    tags: Array.isArray(row.tags) ? row.tags : [],
    teachingNotes: row.teaching_notes ?? "",
    isRecommended: Boolean(row.is_recommended),
    createdBy: row.created_by,
    createdAt: row.created_at,
    isActive: row.id === activeVersionId
  };
}

export async function ensurePromptTemplatesSeeded(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;

  const supabase = await createSupabaseServerClient();
  const { count, error: countError } = await supabase
    .from("prompt_templates")
    .select("id", { count: "exact", head: true });

  if (countError) {
    throw new Error(countError.message);
  }
  if ((count ?? 0) > 0) return 0;

  const defaults = listCodeDefaultTemplates();
  let seeded = 0;

  for (const def of defaults) {
    const { data: template, error: insertError } = await supabase
      .from("prompt_templates")
      .insert({
        template_key: def.templateKey,
        scope: def.scope,
        pillar_id: def.pillarId,
        quest_slug: def.questSlug,
        label: def.label,
        description: def.description
      })
      .select()
      .single();

    if (insertError || !template) {
      throw new Error(
        insertError?.message ?? `Failed to seed ${def.templateKey}`
      );
    }

    const { data: version, error: versionError } = await supabase
      .from("prompt_template_versions")
      .insert({
        template_id: template.id,
        version_number: 1,
        body: def.body,
        model: "gpt-4o-mini",
        temperature: 0.25,
        change_note: "Initial seed from code defaults"
      })
      .select()
      .single();

    if (versionError || !version) {
      throw new Error(versionError?.message ?? "Failed to seed version");
    }

    const { error: activateError } = await supabase
      .from("prompt_templates")
      .update({
        active_version_id: version.id,
        updated_at: new Date().toISOString()
      })
      .eq("id", template.id);

    if (activateError) {
      throw new Error(activateError.message);
    }

    seeded++;
  }

  return seeded;
}

export async function listPromptTemplates(): Promise<PromptTemplateDto[]> {
  if (!isSupabaseConfigured()) return [];

  await ensurePromptTemplatesSeeded();

  const supabase = await createSupabaseServerClient();
  const { data: templates, error } = await supabase
    .from("prompt_templates")
    .select("*")
    .order("pillar_id", { ascending: true })
    .order("scope", { ascending: true })
    .order("quest_slug", { ascending: true, nullsFirst: true });

  if (error) throw new Error(error.message);
  if (!templates?.length) return [];

  const templateIds = templates.map((t) => t.id);
  const { data: versions, error: versionsError } = await supabase
    .from("prompt_template_versions")
    .select("id, template_id, version_number")
    .in("template_id", templateIds);

  if (versionsError) throw new Error(versionsError.message);

  const versionCountByTemplate = new Map<string, number>();
  const versionNumberById = new Map<string, number>();

  for (const v of versions ?? []) {
    versionCountByTemplate.set(
      v.template_id,
      (versionCountByTemplate.get(v.template_id) ?? 0) + 1
    );
    versionNumberById.set(v.id, v.version_number);
  }

  return (templates as PromptTemplateRow[]).map((row) =>
    mapTemplate(row, {
      versionCount: versionCountByTemplate.get(row.id) ?? 0,
      activeVersionNumber: row.active_version_id
        ? (versionNumberById.get(row.active_version_id) ?? null)
        : null
    })
  );
}

export async function getPromptTemplateDetail(
  templateKey: string
): Promise<PromptTemplateDetailDto | null> {
  if (!isSupabaseConfigured()) return null;

  await ensurePromptTemplatesSeeded();

  const supabase = await createSupabaseServerClient();
  const { data: template, error } = await supabase
    .from("prompt_templates")
    .select("*")
    .eq("template_key", templateKey)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!template) return null;

  const row = template as PromptTemplateRow;

  const { data: versions, error: versionsError } = await supabase
    .from("prompt_template_versions")
    .select("*")
    .eq("template_id", row.id)
    .order("version_number", { ascending: false });

  if (versionsError) throw new Error(versionsError.message);

  const versionRows = (versions ?? []) as PromptTemplateVersionRow[];
  const active = versionRows.find((v) => v.id === row.active_version_id);

  return {
    ...mapTemplate(row, {
      versionCount: versionRows.length,
      activeVersionNumber: active?.version_number ?? null
    }),
    activeBody: active?.body ?? null,
    activeModel: active?.model ?? "gpt-4o-mini",
    activeTemperature: active ? Number(active.temperature) : 0.25,
    versions: versionRows.map((v) => mapVersion(v, row.active_version_id))
  };
}

async function getOrCreateTemplate(
  templateKey: string
): Promise<PromptTemplateRow> {
  const parsed = parsePromptTemplateKey(templateKey);
  if (!parsed) {
    throw new Error(`Invalid template key: ${templateKey}`);
  }

  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase
    .from("prompt_templates")
    .select("*")
    .eq("template_key", templateKey)
    .maybeSingle();

  if (existing) return existing as PromptTemplateRow;

  const defaults = listCodeDefaultTemplates().find(
    (d) => d.templateKey === templateKey
  );

  const label =
    defaults?.label ??
    `${parsed.scope} — ${parsed.pillarId}${parsed.questSlug ? ` (${parsed.questSlug})` : ""}`;

  const { data: created, error } = await supabase
    .from("prompt_templates")
    .insert({
      template_key: templateKey,
      scope: parsed.scope,
      pillar_id: parsed.pillarId,
      quest_slug: parsed.questSlug,
      label,
      description: defaults?.description ?? ""
    })
    .select()
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? "Failed to create prompt template.");
  }

  return created as PromptTemplateRow;
}

export async function savePromptTemplateVersion(
  templateKey: string,
  input: SavePromptVersionInput
): Promise<PromptTemplateDetailDto> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const body = input.body?.trim();
  if (!body) throw new Error("Prompt body is required.");

  const template = await getOrCreateTemplate(templateKey);
  const supabase = await createSupabaseServerClient();

  const { data: latest } = await supabase
    .from("prompt_template_versions")
    .select("version_number")
    .eq("template_id", template.id)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (latest?.version_number ?? 0) + 1;

  const { data: version, error: versionError } = await supabase
    .from("prompt_template_versions")
    .insert({
      template_id: template.id,
      version_number: nextVersion,
      body,
      model: input.model?.trim() || "gpt-4o-mini",
      temperature:
        typeof input.temperature === "number" ? input.temperature : 0.25,
      change_note: input.changeNote?.trim() || "",
      tags: input.tags ?? [],
      teaching_notes: input.teachingNotes?.trim() ?? "",
      is_recommended: Boolean(input.isRecommended),
      created_by: input.createdBy?.trim() || null
    })
    .select()
    .single();

  if (versionError || !version) {
    throw new Error(versionError?.message ?? "Failed to save version.");
  }

  if (input.publish !== false) {
    const { error: activateError } = await supabase
      .from("prompt_templates")
      .update({
        active_version_id: version.id,
        updated_at: new Date().toISOString()
      })
      .eq("id", template.id);

    if (activateError) throw new Error(activateError.message);
  }

  const detail = await getPromptTemplateDetail(templateKey);
  if (!detail) throw new Error("Template missing after save.");
  return detail;
}

export async function activatePromptTemplateVersion(
  templateKey: string,
  versionId: string
): Promise<PromptTemplateDetailDto> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const supabase = await createSupabaseServerClient();
  const template = await getOrCreateTemplate(templateKey);

  const { data: version, error: versionError } = await supabase
    .from("prompt_template_versions")
    .select("id")
    .eq("id", versionId)
    .eq("template_id", template.id)
    .maybeSingle();

  if (versionError) throw new Error(versionError.message);
  if (!version) throw new Error("Version not found for this template.");

  const { error } = await supabase
    .from("prompt_templates")
    .update({
      active_version_id: versionId,
      updated_at: new Date().toISOString()
    })
    .eq("id", template.id);

  if (error) throw new Error(error.message);

  const detail = await getPromptTemplateDetail(templateKey);
  if (!detail) throw new Error("Template missing after activate.");
  return detail;
}

export type ActivePromptSlot = {
  body: string;
  model: string;
  temperature: number;
  versionId: string | null;
  versionNumber: number | null;
  source: "database" | "code_default";
};

async function loadActiveSlot(
  templateKey: string
): Promise<ActivePromptSlot | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const { data: template } = await supabase
    .from("prompt_templates")
    .select("id, active_version_id, scope, pillar_id")
    .eq("template_key", templateKey)
    .maybeSingle();

  if (!template?.active_version_id) return null;

  const { data: version } = await supabase
    .from("prompt_template_versions")
    .select("*")
    .eq("id", template.active_version_id)
    .maybeSingle();

  if (!version) return null;

  return {
    body: version.body,
    model: version.model,
    temperature: Number(version.temperature),
    versionId: version.id,
    versionNumber: version.version_number,
    source: "database"
  };
}

function buildSyncFromCodeResult(
  templateKey: string,
  detail: PromptTemplateDetailDto,
  published: boolean,
  bodyChanged: boolean
): SyncPromptFromCodeResult {
  const active = detail.versions.find((v) => v.isActive);
  return {
    templateKey,
    versionNumber:
      active?.versionNumber ?? detail.activeVersionNumber ?? 1,
    published,
    bodyChanged,
    updatedAt: detail.updatedAt,
    changeNote: active?.changeNote ?? SYNC_FROM_CODE_CHANGE_NOTE,
    source: SYNC_FROM_CODE_SOURCE_LABEL
  };
}

async function publishCodeDefaultVersion(
  templateKey: string,
  options?: { force?: boolean }
): Promise<{
  detail: PromptTemplateDetailDto;
  published: boolean;
  bodyChanged: boolean;
}> {
  const def = getCodeDefaultForTemplateKey(templateKey);
  if (!def) {
    throw new Error(`No code default for template: ${templateKey}`);
  }

  const detail = await getPromptTemplateDetail(templateKey);
  const activeBody = detail?.activeBody?.trim() ?? "";
  const codeBody = def.body.trim();
  const bodyChanged = activeBody !== codeBody;

  if (!options?.force && !bodyChanged && detail?.activeVersionNumber != null) {
    return {
      detail: detail!,
      published: false,
      bodyChanged: false
    };
  }

  const saved = await savePromptTemplateVersion(templateKey, {
    body: def.body,
    model: detail?.activeModel ?? "gpt-4o-mini",
    temperature: detail?.activeTemperature ?? 0.25,
    changeNote: SYNC_FROM_CODE_CHANGE_NOTE,
    publish: true
  });

  return { detail: saved, published: true, bodyChanged: true };
}

/** Reset one template: always publish a new active version from code defaults. */
export async function resetPromptTemplateToCodeDefault(
  templateKey: string
): Promise<ResetPromptFromCodeResult> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  await ensurePromptTemplatesSeeded();

  const { detail, published, bodyChanged } = await publishCodeDefaultVersion(
    templateKey,
    { force: true }
  );

  return {
    ...buildSyncFromCodeResult(templateKey, detail, published, bodyChanged),
    template: detail
  };
}

/** Publish new versions from current code defaults (Prompt Studio + generation). */
export async function syncPromptTemplatesFromCodeDefaults(): Promise<SyncPromptsFromCodeSummary> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  await ensurePromptTemplatesSeeded();

  const results: SyncPromptFromCodeResult[] = [];
  let synced = 0;
  let unchanged = 0;

  for (const def of listCodeDefaultTemplates()) {
    const { detail, published, bodyChanged } = await publishCodeDefaultVersion(
      def.templateKey
    );

    if (!published) {
      unchanged++;
    } else {
      synced++;
    }

    results.push(
      buildSyncFromCodeResult(def.templateKey, detail, published, bodyChanged)
    );
  }

  return { synced, unchanged, results };
}

export async function resolveTemplateKeyChain(
  scope: "system" | "user",
  pillarId: PillarId,
  questSlug?: string | null
): Promise<{ key: string; slot: ActivePromptSlot | null }> {
  const keys: string[] = [];
  if (questSlug?.trim()) {
    keys.push(formatPromptTemplateKey(scope, pillarId, questSlug.trim()));
  }
  keys.push(formatPromptTemplateKey(scope, pillarId));

  for (const key of keys) {
    const slot = await loadActiveSlot(key);
    if (slot) return { key, slot };
  }

  const fallbackKey = formatPromptTemplateKey(scope, pillarId);
  const body =
    scope === "system"
      ? getCodeDefaultSystemPrompt(pillarId)
      : getCodeDefaultUserTemplate(pillarId);

  return {
    key: fallbackKey,
    slot: {
      body,
      model: "gpt-4o-mini",
      temperature: 0.25,
      versionId: null,
      versionNumber: null,
      source: "code_default"
    }
  };
}
