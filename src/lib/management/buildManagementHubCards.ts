import type { QuestDefinition } from "@/data/quests/types";
import { resolveManagementHubIconGlyph } from "@/lib/management/managementHubIcons";
import type { ManagementHubQuestCard } from "@/lib/management/managementHubTypes";
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
import { CONTROLLED_DEMO_MODE } from "@/lib/demo/controlledDemo";

const SLUG_FALLBACK_ORDER: Record<string, number> = {
  "board-leadership": 1,
  "mgmt-1": 1,
  "executive-compensation": 2,
  "mgmt-quiz": 2,
  "capital-allocation": 3,
  "mgmt-2": 3,
  "governance-control": 4,
  "mgmt-governance": 4,
  "management-summary": 5,
  "mgmt-financial-strength": 5
};

const CANONICAL_PRIOR_SLUG: Record<number, string | undefined> = {
  2: "mgmt-1",
  3: "mgmt-quiz",
  4: "mgmt-2",
  5: "mgmt-governance"
};

export function managementQuestPath(slug: string): string {
  if (CONTROLLED_DEMO_MODE) {
    return `/management/${slug}`;
  }
  return `/quest?pillar=management&quest=${encodeURIComponent(slug)}`;
}

export function resolveManagementHubLocked(
  orderNumber: number,
  hubLocked: boolean | null | undefined,
  priorSlotCompleted = false
): boolean {
  return resolveHubSlotLocked(orderNumber, hubLocked, priorSlotCompleted);
}

export function buildManagementHubCards(
  quests: readonly QuestDefinition[],
  viewsBySlug: Record<string, QuestView | undefined>,
  readSlugs: ReadonlySet<string>
): ManagementHubQuestCard[] {
  const managementQuests = quests.filter((q) => q.pillarId === "management");
  const slotted = assignHubSlotQuests(managementQuests, SLUG_FALLBACK_ORDER);
  const questBySlug = new Map(managementQuests.map((q) => [q.slug, q]));

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
      icon: resolveManagementHubIconGlyph(quest.hubIcon, quest.type),
      cardCount: resolveHubCardCount(quest),
      progressPct,
      route: quest.hubRoute?.trim() || managementQuestPath(quest.slug),
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
