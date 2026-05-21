import type { QuestDefinition } from "@/data/quests/types";
import type { QuestView } from "@/engine";
import { getQuestProgressPct } from "@/engine";

function compositeCardSlug(parentSlug: string, cardId: string): string {
  return `${parentSlug}#${cardId}`;
}

/**
 * Hub map progress for a quest — drives chain unlock (prior slot must reach 100%).
 * Uses engine completion, sub-card read state, and quest-type progress rules.
 */
export function resolveHubQuestProgressPct(
  quest: QuestDefinition,
  view: QuestView | undefined,
  readSlugs: ReadonlySet<string>
): number {
  if (view?.completed) return 100;

  const cards = quest.cards ?? [];
  if (cards.length > 0) {
    if (readSlugs.has(quest.slug)) return 100;
    const readCount = cards.filter((c) =>
      readSlugs.has(compositeCardSlug(quest.slug, c.id))
    ).length;
    if (readCount >= cards.length) return 100;
    return Math.round((readCount / cards.length) * 100);
  }

  return Math.min(100, Math.max(0, getQuestProgressPct(view ?? null, quest)));
}

/** True when a hub slot is fully complete for chain unlock purposes. */
export function isHubQuestChainComplete(progressPct: number): boolean {
  return progressPct >= 100;
}
