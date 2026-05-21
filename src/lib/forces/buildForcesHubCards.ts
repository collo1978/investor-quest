import type { CompanyId } from "@/data/companies";
import { buildQuestId } from "@/data/quests/library";
import type { ForcesCategoryId } from "@/data/quests/forcesCategories";
import type { QuestDefinition } from "@/data/quests/types";
import {
  FORCES_HUB_CATEGORY_SLOTS,
  forcesCategoryPath,
  isForcesHubQuest
} from "@/lib/forces/forcesHubCategories";
import { resolveForcesHubIconGlyph } from "@/lib/forces/forcesHubIcons";
import type { ForcesHubQuestCard } from "@/lib/forces/forcesHubTypes";
import { assignHubPrimaryActive } from "@/lib/quests/assignHubPrimaryActive";
import { resolveHubCardCount } from "@/lib/quests/resolveHubCardCount";
import { resolveHubSlotLocked } from "@/lib/quests/resolveHubChainUnlock";
import {
  isHubQuestComplete,
  resolveHubVisualState
} from "@/lib/quests/resolveHubVisualState";
import type { QuestView } from "@/engine";
import { getQuestProgressPct } from "@/engine";

export function resolveForcesHubLocked(
  orderNumber: number,
  hubLocked: boolean | null | undefined,
  priorCategoryComplete = false
): boolean {
  return resolveHubSlotLocked(orderNumber, hubLocked, priorCategoryComplete);
}

function categoryProgressPct(
  categoryQuests: readonly QuestDefinition[],
  viewsBySlug: Record<string, QuestView | undefined>
): number {
  if (categoryQuests.length === 0) return 0;
  const topicQuests = categoryQuests.filter((q) => !isForcesHubQuest(q));
  const pool = topicQuests.length > 0 ? topicQuests : categoryQuests;
  const sum = pool.reduce((acc, q) => {
    const view = viewsBySlug[q.slug];
    return acc + (view ? getQuestProgressPct(view) : 0);
  }, 0);
  return Math.round(sum / pool.length);
}

function categoryComplete(
  categoryQuests: readonly QuestDefinition[],
  viewsBySlug: Record<string, QuestView | undefined>
): boolean {
  const topicQuests = categoryQuests.filter((q) => !isForcesHubQuest(q));
  const pool = topicQuests.length > 0 ? topicQuests : categoryQuests;
  if (pool.length === 0) return false;
  return pool.every((q) => viewsBySlug[q.slug]?.completed);
}

function findHubRow(
  quests: readonly QuestDefinition[],
  slot: (typeof FORCES_HUB_CATEGORY_SLOTS)[number]
): QuestDefinition | undefined {
  return (
    quests.find((q) => q.slug === slot.hubSlug) ??
    quests.find(
      (q) =>
        q.pillarId === "forces" &&
        q.forcesCategory === slot.categoryId &&
        isForcesHubQuest(q)
    ) ??
    quests.find(
      (q) =>
        q.pillarId === "forces" &&
        q.forcesCategory === slot.categoryId &&
        (q.displayOrder ?? 99) === slot.orderNumber
    )
  );
}

export function buildForcesHubCards(
  quests: readonly QuestDefinition[],
  viewsBySlug: Record<string, QuestView | undefined>,
  readSlugs: ReadonlySet<string>,
  companyId: CompanyId
): ForcesHubQuestCard[] {
  const forcesQuests = quests.filter((q) => q.pillarId === "forces");
  const priorCompleteByOrder = new Map<number, boolean>();

  const cards = FORCES_HUB_CATEGORY_SLOTS.map((slot) => {
    const categoryQuests = forcesQuests.filter(
      (q) => q.forcesCategory === slot.categoryId
    );
    const topicQuests = categoryQuests.filter((q) => !isForcesHubQuest(q));
    const hubRow = findHubRow(forcesQuests, slot);

    const orderNumber = slot.orderNumber;
    const priorOrder = orderNumber - 1;
    const priorCategoryComplete =
      orderNumber <= 1
        ? true
        : (priorCompleteByOrder.get(priorOrder) ?? false);

    const locked = resolveForcesHubLocked(
      orderNumber,
      hubRow?.hubLocked,
      priorCategoryComplete
    );
    const route =
      hubRow?.hubRoute?.trim() || forcesCategoryPath(slot.categoryId);
    const title = hubRow?.title?.trim() || slot.defaultTitle;
    const subtitle =
      hubRow?.hubSubtitle?.trim() ||
      hubRow?.investorQuestion?.trim() ||
      hubRow?.description?.trim() ||
      slot.defaultSubtitle;
    const cardCount = hubRow
      ? resolveHubCardCount(hubRow)
      : topicQuests.length > 0
        ? topicQuests.length
        : 5;
    const rawProgress = locked
      ? 0
      : categoryProgressPct(categoryQuests, viewsBySlug);
    const engineCompleted = categoryComplete(categoryQuests, viewsBySlug);
    const completed = !locked && isHubQuestComplete(rawProgress, engineCompleted);
    const progressPct = completed ? 100 : rawProgress;
    const visualState = locked
      ? "locked"
      : resolveHubVisualState(false, progressPct, engineCompleted);

    priorCompleteByOrder.set(orderNumber, completed);

    const priorSlot = FORCES_HUB_CATEGORY_SLOTS.find(
      (s) => s.orderNumber === priorOrder
    );
    const priorTitle = priorSlot?.defaultTitle ?? "previous category";

    const slug = hubRow?.slug ?? slot.hubSlug;
    const read =
      topicQuests.length > 0
        ? topicQuests.every((q) => readSlugs.has(q.slug))
        : readSlugs.has(slug);

    return {
      orderNumber,
      slug,
      questId: hubRow?.id ?? buildQuestId(companyId, "forces", slot.hubSlug),
      categoryId: slot.categoryId as ForcesCategoryId,
      title,
      subtitle,
      icon: resolveForcesHubIconGlyph(hubRow?.hubIcon, slot.categoryId),
      cardCount,
      progressPct,
      route,
      locked,
      visualState,
      isPrimaryActive: false,
      isActive: !locked && visualState === "active",
      completed,
      read,
      unlockSource:
        locked && orderNumber > 1
          ? { slug: priorSlot?.hubSlug ?? "", title: priorTitle }
          : null
    };
  });

  return assignHubPrimaryActive(cards);
}
