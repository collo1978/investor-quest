import type { PillarId } from "@/data/pillars";
import {
  resolveTemplateKeyChain,
  ensurePromptTemplatesSeeded
} from "@/lib/supabase/promptTemplates/storage";
import type { ResolvedPromptBundle } from "@/lib/supabase/promptTemplates/types";

export async function resolveActivePrompts(
  pillarId: PillarId,
  questSlug?: string | null
): Promise<ResolvedPromptBundle> {
  await ensurePromptTemplatesSeeded();

  const [system, user] = await Promise.all([
    resolveTemplateKeyChain("system", pillarId, questSlug),
    resolveTemplateKeyChain("user", pillarId, questSlug)
  ]);

  const source =
    system.slot?.source === "database" || user.slot?.source === "database"
      ? "database"
      : "code_default";

  return {
    systemPrompt: system.slot!.body,
    userTemplate: user.slot!.body,
    model: user.slot!.model,
    temperature: user.slot!.temperature,
    source,
    systemTemplateKey: system.key,
    userTemplateKey: user.key,
    systemVersionId: system.slot!.versionId,
    systemVersionNumber: system.slot!.versionNumber,
    userVersionId: user.slot!.versionId,
    userVersionNumber: user.slot!.versionNumber
  };
}

export type PromptDraftOverrides = {
  systemPrompt?: string;
  userTemplate?: string;
  model?: string;
  temperature?: number;
};

export function applyPromptDraftOverrides(
  resolved: ResolvedPromptBundle,
  draft?: PromptDraftOverrides | null
): ResolvedPromptBundle {
  if (!draft) return resolved;
  return {
    ...resolved,
    systemPrompt: draft.systemPrompt?.trim() || resolved.systemPrompt,
    userTemplate: draft.userTemplate?.trim() || resolved.userTemplate,
    model: draft.model?.trim() || resolved.model,
    temperature:
      typeof draft.temperature === "number"
        ? draft.temperature
        : resolved.temperature,
    source: "database"
  };
}
