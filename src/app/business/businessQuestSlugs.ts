/**
 * Business pillar quest slugs — match `/business/[questSlug]` routes.
 */
export {
  BUSINESS_QUEST_SLUGS,
  LEGACY_BUSINESS_SLUGS,
  BUSINESS_SLUG_FROM_LEGACY,
  canonicalBusinessQuestSlug,
  isBusinessQuestSlug,
  isLegacyBusinessSlug,
  migrateBusinessProgressSlug,
  type BusinessQuestSlug,
  type LegacyBusinessQuestSlug
} from "@/lib/business/businessSlugMigration";

import {
  BUSINESS_QUEST_SLUGS,
  type BusinessQuestSlug
} from "@/lib/business/businessSlugMigration";

/** Quests wired to SEC → AI → DB pipeline. */
export const BUSINESS_AI_QUEST_SLUGS = BUSINESS_QUEST_SLUGS;

export type BusinessAiQuestSlug = BusinessQuestSlug;

export function isBusinessAiQuestSlug(
  value: string
): value is BusinessAiQuestSlug {
  return (BUSINESS_AI_QUEST_SLUGS as readonly string[]).includes(value);
}

/** @deprecated Use {@link isBusinessAiQuestSlug} */
export const isBusinessAiQuestSlugValue = isBusinessAiQuestSlug;
