/** Management pillar quest slugs — hub + `/quest?pillar=management&quest=` routes. */
export const MANAGEMENT_QUEST_SLUGS = [
  "mgmt-1",
  "mgmt-quiz",
  "mgmt-2",
  "mgmt-governance",
  "mgmt-financial-strength",
  "management-summary"
] as const;

export type ManagementQuestSlug = (typeof MANAGEMENT_QUEST_SLUGS)[number];

export const MANAGEMENT_AI_QUEST_SLUGS = [...MANAGEMENT_QUEST_SLUGS] as const;

export type ManagementAiQuestSlug = (typeof MANAGEMENT_AI_QUEST_SLUGS)[number];

export function isManagementQuestSlug(
  value: string
): value is ManagementQuestSlug {
  return (MANAGEMENT_QUEST_SLUGS as readonly string[]).includes(value);
}

export function isManagementAiQuestSlug(
  value: string
): value is ManagementAiQuestSlug {
  return (MANAGEMENT_AI_QUEST_SLUGS as readonly string[]).includes(value);
}
