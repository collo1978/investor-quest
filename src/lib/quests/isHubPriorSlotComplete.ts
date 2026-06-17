import type { QuestDefinition } from "@/data/quests/types";
import type { QuestView } from "@/engine";

function compositeCardSlug(parentSlug: string, cardId: string): string {
  return `${parentSlug}#${cardId}`;
}

/**
 * Whether the prior hub slot is done enough to unlock the next quest.
 * Uses engine completion (quiz pass / checklist) — not read % alone.
 */
export function isHubPriorSlotComplete(
  quest: QuestDefinition,
  view: QuestView | undefined,
  readSlugs: ReadonlySet<string>
): boolean {
  if (view?.completed) return true;

  const rule = quest.completionState;
  const work = view?.work;

  if (rule.kind === "quiz") {
    // Chain unlock follows engine completion (`complete-quest` on quiz pass),
    // not stale questWork.passed / bestScore from merges or partial sessions.
    return false;
  }

  if (rule.kind === "checklist") {
    const keys = rule.checklistKeys;
    const checklistDone =
      keys.length > 0 && keys.every((k) => work?.checklist?.[k]);
    if (checklistDone) return true;
    const cards = quest.cards ?? [];
    if (cards.length === 0) return false;
    const allCardsRead = cards.every((c) =>
      readSlugs.has(compositeCardSlug(quest.slug, c.id))
    );
    return allCardsRead && readSlugs.has(quest.slug);
  }

  if (rule.kind === "read") {
    return readSlugs.has(quest.slug);
  }

  return false;
}
