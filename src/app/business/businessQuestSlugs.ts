/** Business pillar quest slugs — match `/business/[questSlug]` routes. */
export const BUSINESS_QUEST_SLUGS = [
  "snapshot",
  "revenue",
  "operations",
  "advantage",
  "industry"
] as const;

export type BusinessQuestSlug = (typeof BUSINESS_QUEST_SLUGS)[number];

/** Quests wired to SEC → AI → DB pipeline. */
export const BUSINESS_AI_QUEST_SLUGS = [
  "snapshot",
  "revenue",
  "operations",
  "advantage",
  "industry"
] as const;

export type BusinessAiQuestSlug = (typeof BUSINESS_AI_QUEST_SLUGS)[number];

export function isBusinessQuestSlug(value: string): value is BusinessQuestSlug {
  return (BUSINESS_QUEST_SLUGS as readonly string[]).includes(value);
}

export function isBusinessAiQuestSlug(value: string): value is BusinessAiQuestSlug {
  return (BUSINESS_AI_QUEST_SLUGS as readonly string[]).includes(value);
}
