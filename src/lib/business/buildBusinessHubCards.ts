import type { Company } from "@/data/companies";

import type { QuestDefinition } from "@/data/quests/types";

import { resolveHubIconGlyph } from "@/lib/business/businessHubIcons";

import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";

import { resolveHubCardCount } from "@/lib/quests/resolveHubCardCount";

import { isChecklistSectionQuestComplete } from "@/lib/business/isChecklistHubPriorComplete";
import type { BusinessInvestorFrameworkStoredState } from "@/lib/business/businessInvestorFrameworkStorage";

import { isHubPriorSlotComplete } from "@/lib/quests/isHubPriorSlotComplete";

import { resolveHubSlotLocked } from "@/lib/quests/resolveHubChainUnlock";

import { assignHubSlotQuests } from "@/lib/quests/resolveHubOrderNumber";

import { resolveHubQuestProgressPct } from "@/lib/quests/resolveHubQuestProgress";

import {

  isHubQuestComplete,

  resolveHubVisualState

} from "@/lib/quests/resolveHubVisualState";

import type { QuestView } from "@/engine";

/** Mirror `CONTROLLED_DEMO_MODE` — do not import `nvidiaDemoVoice` / `controlledDemo` here (library cycle). */
const NVDA_DEMO_HUB_SUBTITLES_OFF =
  process.env.NEXT_PUBLIC_CONTROLLED_DEMO !== "false";

/** Six hub slots — one per Investor Checklist section (who-competes stays off the island map). */
export const BUSINESS_HUB_CHECKLIST_SLUG_ORDER: Record<string, number> = {
  "what-they-do": 1,
  "why-buying": 2,
  "everyday-life": 3,
  "how-it-works": 4,
  competition: 5,
  "why-they-stay": 6
};

const SLUG_FALLBACK_ORDER = BUSINESS_HUB_CHECKLIST_SLUG_ORDER;

/** Canonical prior quest slug for each hub slot (not “whatever occupies slot N−1”). */
const CANONICAL_PRIOR_SLUG: Record<number, string | undefined> = {
  2: "what-they-do",
  3: "why-buying",
  4: "everyday-life",
  5: "how-it-works",
  6: "competition"
};



/** @deprecated Use {@link resolveHubSlotLocked} via buildBusinessHubCards. */

export function resolveBusinessHubLocked(

  orderNumber: number,

  hubLocked: boolean | null | undefined,

  priorSlotCompleted = false

): boolean {

  return resolveHubSlotLocked(orderNumber, hubLocked, priorSlotCompleted);

}



export function buildBusinessHubCards(

  quests: readonly QuestDefinition[],

  viewsBySlug: Record<string, QuestView | undefined>,

  readSlugs: ReadonlySet<string>,

  questCompletedAtBySlug: Readonly<Record<string, number>> = {},

  checklistStored?: BusinessInvestorFrameworkStoredState

): BusinessHubQuestCard[] {

  const businessQuests = quests.filter((q) => q.pillarId === "business");

  const slotted = assignHubSlotQuests(businessQuests, SLUG_FALLBACK_ORDER);

  const questBySlug = new Map(businessQuests.map((q) => [q.slug, q]));



  const cards = slotted.map(({ quest, orderNumber }) => {

    const view = viewsBySlug[quest.slug];

    const priorSlug = CANONICAL_PRIOR_SLUG[orderNumber];

    const priorQuest = priorSlug ? questBySlug.get(priorSlug) : undefined;

    const priorView = priorSlug ? viewsBySlug[priorSlug] : undefined;



    const priorSlotCompleted =

      orderNumber <= 1

        ? true

        : priorSlug && priorQuest

          ? isHubPriorSlotComplete(priorQuest, priorView, readSlugs) ||

            isChecklistSectionQuestComplete(priorSlug, checklistStored)

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

    const visualState: BusinessHubQuestCard["visualState"] = locked

      ? "locked"

      : resolveHubVisualState(false, progressPct, engineCompleted);

    const route = quest.hubRoute?.trim() || `/business/${quest.slug}`;

    const hubSubtitleOnly = quest.hubSubtitle?.trim() ?? "";
    const subtitle =
      NVDA_DEMO_HUB_SUBTITLES_OFF && quest.companyId === "nvda"
        ? hubSubtitleOnly
        : hubSubtitleOnly ||
          quest.investorQuestion ||
          quest.description;

    const cardCount = resolveHubCardCount(quest);

    const priorTitle = priorQuest?.title ?? priorSlug ?? "previous quest";

    const unlockEpoch =
      orderNumber <= 1 || locked || !priorSlug
        ? null
        : questCompletedAtBySlug[priorSlug] ?? null;



    return {

      orderNumber,

      slug: quest.slug,

      questId: quest.id,

      title: quest.title,

      subtitle,

      icon: resolveHubIconGlyph(quest.hubIcon, quest.type),

      cardCount,

      progressPct,

      route,

      locked,

      visualState,

      isPrimaryActive: false,

      isActive: !locked && visualState === "active",

      completed,

      read: readSlugs.has(quest.slug),

      rewardXp: quest.rewardXp ?? 0,

      unlockSource:

        locked && priorSlug

          ? { slug: priorSlug, title: priorTitle }

          : null,

      unlockEpoch

    };

  });



  const primary = cards

    .filter((c) => !c.locked && c.visualState === "active")

    .sort((a, b) => a.orderNumber - b.orderNumber)[0];



  if (primary) {

    return cards.map((c) => ({

      ...c,

      isPrimaryActive: !c.locked && c.orderNumber === primary.orderNumber

    }));

  }

  return cards;

}



/** Resolves logo for hub overlay — CMS `company_logo_url` then local asset. */

export function resolveCompanyLogoUrl(

  company: Company,

  companyLogoUrlOverride?: string | null

): string {

  const url =

    companyLogoUrlOverride?.trim() ||

    company.companyLogoUrl?.trim() ||

    company.logoSrc?.trim();

  return url ?? "";

}

