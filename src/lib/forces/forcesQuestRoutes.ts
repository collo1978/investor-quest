import { isForcesHubQuest } from "@/lib/forces/forcesHubCategories";
import {
  isForcesHubSlug,
  isForcesTopicSlug
} from "@/lib/sec/forcesTopicSectionMap";

/** Retired topic slugs — must not appear in nav or catalog merges. */
export const FORCES_LEGACY_TOPIC_SLUGS = new Set([
  "positive-inside-business-strength",
  "inside-forces",
  "outside-forces"
]);

/** Old bookmarks / CMS rows → current playable topic slug. */
export const FORCES_RETIRED_TOPIC_SLUG_ALIASES: Readonly<Record<string, string>> = {
  "positive-inside-business-strength": "positive-inside-brand-strength"
};

export function resolveForcesQuestSlug(slug: string): string {
  return FORCES_RETIRED_TOPIC_SLUG_ALIASES[slug] ?? slug;
}

export function isLegacyForcesTopicSlug(slug: string): boolean {
  return FORCES_LEGACY_TOPIC_SLUGS.has(slug);
}

export function isValidForcesQuestSlug(slug: string): boolean {
  const resolved = resolveForcesQuestSlug(slug);
  if (isForcesHubSlug(resolved)) return true;
  return isForcesTopicSlug(resolved);
}

/** Drop retired rows; keep hub + current topic decks only. */
export function filterPlayableForcesTemplates<
  T extends { slug: string; pillarId?: string | null }
>(templates: readonly T[]): T[] {
  return templates.filter((t) => {
    if (t.pillarId !== "forces") return true;
    if (isLegacyForcesTopicSlug(t.slug)) return false;
    if (isForcesHubSlug(t.slug) || isForcesHubQuest(t)) return true;
    const resolved = resolveForcesQuestSlug(t.slug);
    return isForcesTopicSlug(resolved) && !isLegacyForcesTopicSlug(t.slug);
  });
}

export function forcesTopicQuestPath(slug: string): string {
  return `/forces/${resolveForcesQuestSlug(slug)}`;
}

/** Topic deck rows that map to a real, playable quest route. */
export function isPlayableForcesTopicTemplate(slug: string): boolean {
  const resolved = resolveForcesQuestSlug(slug);
  return isForcesTopicSlug(resolved) && isValidForcesQuestSlug(resolved);
}
