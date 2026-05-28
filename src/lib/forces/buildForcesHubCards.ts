import { companyById, type CompanyId } from "@/data/companies";
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
import { fillQuestTokens } from "@/lib/quests/fillQuestTokens";

export function resolveForcesHubLocked(
  orderNumber: number,
  hubLocked: boolean | null | undefined,
  priorCategoryComplete = false
): boolean {
  return resolveHubSlotLocked(orderNumber, hubLocked, priorCategoryComplete);
}

function categoryProgressPct(
  categoryQuests: readonly QuestDefinition[],
  viewsBySlug: Record<string, QuestView | undefined>,
  hubSlug: string,
  readSlugs: ReadonlySet<string>
): number {
  const topicQuests = categoryQuests.filter((q) => !isForcesHubQuest(q));
  if (topicQuests.length === 0) return 0;

  const hubDone = Boolean(viewsBySlug[hubSlug]?.completed);
  if (hubDone) return 100;

  const readCount = topicQuests.filter((q) => readSlugs.has(q.slug)).length;
  const topicPct = Math.round((readCount / topicQuests.length) * 85);
  return readCount === topicQuests.length ? Math.max(topicPct, 85) : topicPct;
}

function categoryComplete(
  categoryQuests: readonly QuestDefinition[],
  viewsBySlug: Record<string, QuestView | undefined>,
  hubSlug: string,
  readSlugs: ReadonlySet<string>
): boolean {
  const topicQuests = categoryQuests.filter((q) => !isForcesHubQuest(q));
  if (topicQuests.length === 0) return false;
  const allTopicsRead = topicQuests.every((q) => readSlugs.has(q.slug));
  const hubQuizDone = Boolean(viewsBySlug[hubSlug]?.completed);
  return allTopicsRead && hubQuizDone;
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
  const company = companyById(companyId);
  const forcesQuests = quests.filter((q) => q.pillarId === "forces");
  const priorCompleteByOrder = new Map<number, boolean>();

  const hubSlots = FORCES_HUB_CATEGORY_SLOTS;

  const cards = hubSlots.map((slot) => {
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
    const subtitle = fillQuestTokens(
      hubRow?.hubSubtitle?.trim() ||
        hubRow?.investorQuestion?.trim() ||
        hubRow?.description?.trim() ||
        slot.defaultSubtitle,
      company
    );
    const cardCount = hubRow
      ? resolveHubCardCount(hubRow)
      : topicQuests.length > 0
        ? topicQuests.length
        : 5;
    const hubSlugForCategory = hubRow?.slug ?? slot.hubSlug;
    const rawProgress = locked
      ? 0
      : categoryProgressPct(
          categoryQuests,
          viewsBySlug,
          hubSlugForCategory,
          readSlugs
        );
    const engineCompleted = categoryComplete(
      categoryQuests,
      viewsBySlug,
      hubSlugForCategory,
      readSlugs
    );
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
