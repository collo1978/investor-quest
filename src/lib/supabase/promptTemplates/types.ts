import type { PillarId } from "@/data/pillars";

export type PromptTemplateScope = "system" | "user";

export type PromptTemplateRow = {
  id: string;
  template_key: string;
  scope: PromptTemplateScope;
  pillar_id: PillarId | null;
  quest_slug: string | null;
  label: string;
  description: string;
  active_version_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PromptTemplateVersionRow = {
  id: string;
  template_id: string;
  version_number: number;
  body: string;
  model: string;
  temperature: number;
  change_note: string;
  tags?: string[] | null;
  teaching_notes?: string | null;
  is_recommended?: boolean | null;
  created_by: string | null;
  created_at: string;
};

export type PromptTemplateDto = {
  id: string;
  templateKey: string;
  scope: PromptTemplateScope;
  pillarId: PillarId | null;
  questSlug: string | null;
  label: string;
  description: string;
  activeVersionId: string | null;
  activeVersionNumber: number | null;
  versionCount: number;
  updatedAt: string;
};

export type PromptTemplateDetailDto = PromptTemplateDto & {
  activeBody: string | null;
  activeModel: string;
  activeTemperature: number;
  versions: PromptTemplateVersionDto[];
};

export type PromptTemplateVersionDto = {
  id: string;
  templateId: string;
  versionNumber: number;
  body: string;
  model: string;
  temperature: number;
  changeNote: string;
  tags: string[];
  teachingNotes: string;
  isRecommended: boolean;
  createdBy: string | null;
  createdAt: string;
  isActive: boolean;
};

export type PromptVersionInsightsDto = {
  versionId: string;
  versionNumber: number;
  tags: string[];
  teachingNotes: string;
  isRecommended: boolean;
  changeNote: string;
  runCount: number;
  avgComposite: number | null;
  avgReadability: number | null;
  avgRepetition: number | null;
  avgTeachingFlow: number | null;
  lastEvaluatedAt: string | null;
  rank: number;
  autoBest: boolean;
};

export type SavePromptVersionInput = {
  body: string;
  model?: string;
  temperature?: number;
  changeNote?: string;
  tags?: string[];
  teachingNotes?: string;
  isRecommended?: boolean;
  createdBy?: string;
  /** When true, immediately set as active (publish). */
  publish?: boolean;
};

export type ResolvedPromptBundle = {
  systemPrompt: string;
  userTemplate: string;
  model: string;
  temperature: number;
  source: "database" | "code_default";
  systemTemplateKey: string;
  userTemplateKey: string;
  systemVersionId: string | null;
  systemVersionNumber: number | null;
  userVersionId: string | null;
  userVersionNumber: number | null;
};

export const SYNC_FROM_CODE_SOURCE_LABEL = "Synced from code defaults" as const;

export type SyncPromptFromCodeResult = {
  templateKey: string;
  versionNumber: number;
  published: boolean;
  bodyChanged: boolean;
  updatedAt: string | null;
  changeNote: string;
  source: typeof SYNC_FROM_CODE_SOURCE_LABEL;
};

export type SyncPromptsFromCodeSummary = {
  synced: number;
  unchanged: number;
  results: SyncPromptFromCodeResult[];
};

export type ResetPromptFromCodeResult = SyncPromptFromCodeResult & {
  template: PromptTemplateDetailDto;
};
