import type { QuestDefinition } from "@/data/quests/types";
import {
  financialsQuestPath,
  isFinancialsQuestSlug
} from "@/app/financials/financialsQuestSlugs";
import { resolveFinancialsHubIconGlyph } from "@/lib/financials/financialsHubIcons";
import type { FinancialsHubQuestCard } from "@/lib/financials/financialsHubTypes";
import { assignHubPrimaryActive } from "@/lib/quests/assignHubPrimaryActive";
import { isHubPriorSlotComplete } from "@/lib/quests/isHubPriorSlotComplete";
import { resolveHubCardCount } from "@/lib/quests/resolveHubCardCount";
import { assignHubSlotQuests } from "@/lib/quests/resolveHubOrderNumber";
import { resolveHubQuestProgressPct } from "@/lib/quests/resolveHubQuestProgress";
import { resolveHubSlotLocked } from "@/lib/quests/resolveHubChainUnlock";
import {
  isHubQuestComplete,
  resolveHubVisualState
} from "@/lib/quests/resolveHubVisualState";
import type { QuestView } from "@/engine";

const SLUG_FALLBACK_ORDER: Record<string, number> = {
  growth: 1,
  profitability: 2,
  expenses: 3,
  cash: 4,
  "financial-strength": 5
};

const CANONICAL_PRIOR_SLUG: Record<number, string | undefined> = {
  2: "growth",
  3: "profitability",
  4: "expenses",
  5: "cash"
};

function hubRouteFor(quest: QuestDefinition): string {
  const override = quest.hubRoute?.trim();
  if (override) return override;
  if (isFinancialsQuestSlug(quest.slug)) {
    return financialsQuestPath(quest.slug);
  }
  return `/financials/${encodeURIComponent(quest.slug)}`;
}

export function resolveFinancialsHubLocked(
  orderNumber: number,
  hubLocked: boolean | null | undefined,
  priorSlotCompleted = false
): boolean {
  return resolveHubSlotLocked(orderNumber, hubLocked, priorSlotCompleted);
}

export function buildFinancialsHubCards(
  quests: readonly QuestDefinition[],
  viewsBySlug: Record<string, QuestView | undefined>,
  readSlugs: ReadonlySet<string>
): FinancialsHubQuestCard[] {
  const financialsQuests = quests.filter((q) => q.pillarId === "financials");
  const slotted = assignHubSlotQuests(financialsQuests, SLUG_FALLBACK_ORDER);
  const questBySlug = new Map(financialsQuests.map((q) => [q.slug, q]));

  const cards = slotted.map(({ quest, orderNumber }) => {
    const view = viewsBySlug[quest.slug];
    const priorSlug = CANONICAL_PRIOR_SLUG[orderNumber];
    const priorQuest = priorSlug ? questBySlug.get(priorSlug) : undefined;
    const priorView = priorSlug ? viewsBySlug[priorSlug] : undefined;
    const priorSlotCompleted =
      orderNumber <= 1
        ? true
        : priorSlug && priorQuest
          ? isHubPriorSlotComplete(priorQuest, priorView, readSlugs)
          : false;

    const locked = resolveHubSlotLocked(
      orderNumber,
      quest.hubLocked,
      priorSlotCompleted
    );
    const rawProgress = locked
      ? 0
      : resolveHubQuestProgressPct(quest, view, readSlugs);
    const engineCompleted = view?.completed ?? false;
    const completed = !locked && isHubQuestComplete(rawProgress, engineCompleted);
    const progressPct = completed ? 100 : rawProgress;
    const visualState = locked
      ? "locked"
      : resolveHubVisualState(false, progressPct, engineCompleted);

    return {
      orderNumber,
      slug: quest.slug,
      questId: quest.id,
      title: quest.title,
      subtitle:
        quest.hubSubtitle?.trim() ||
        quest.investorQuestion ||
        quest.description,
      icon: resolveFinancialsHubIconGlyph(quest.hubIcon, quest.type),
      cardCount: resolveHubCardCount(quest),
      progressPct,
      route: hubRouteFor(quest),
      locked,
      visualState,
      isPrimaryActive: false,
      isActive: !locked && visualState === "active",
      completed,
      read: readSlugs.has(quest.slug),
      unlockSource:
        locked && priorSlug
          ? { slug: priorSlug, title: priorQuest?.title ?? priorSlug }
          : null
    };
  });

  return assignHubPrimaryActive(cards);
}
