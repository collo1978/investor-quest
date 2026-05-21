import type { QuestDefinition } from "@/data/quests/types";
import type { QuestView } from "@/engine";
import { buildBusinessHubCards } from "@/lib/business/buildBusinessHubCards";

/** Hub map card for a business quest slug (lock state, progress, route). */
export function resolveBusinessHubCardBySlug(
  quests: readonly QuestDefinition[],
  viewsBySlug: Record<string, QuestView | undefined>,
  readSlugs: ReadonlySet<string>,
  slug: string
) {
  const cards = buildBusinessHubCards(quests, viewsBySlug, readSlugs);
  return cards.find((c) => c.slug === slug) ?? null;
}
