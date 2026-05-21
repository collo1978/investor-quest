import type { Company } from "@/data/companies";

import type { QuestDefinition } from "@/data/quests/types";

import { resolveHubIconGlyph } from "@/lib/business/businessHubIcons";

import type { BusinessHubQuestCard } from "@/lib/business/businessHubTypes";

import { resolveHubCardCount } from "@/lib/quests/resolveHubCardCount";

import { isHubPriorSlotComplete } from "@/lib/quests/isHubPriorSlotComplete";

import { resolveHubSlotLocked } from "@/lib/quests/resolveHubChainUnlock";

import { assignHubSlotQuests } from "@/lib/quests/resolveHubOrderNumber";

import { resolveHubQuestProgressPct } from "@/lib/quests/resolveHubQuestProgress";

import {

  isHubQuestComplete,

  resolveHubVisualState

} from "@/lib/quests/resolveHubVisualState";

import type { QuestView } from "@/engine";



const SLUG_FALLBACK_ORDER: Record<string, number> = {

  snapshot: 1,

  revenue: 2,

  operations: 3,

  advantage: 4,

  industry: 5

};



/** Canonical prior quest slug for each hub slot (not “whatever occupies slot N−1”). */

const CANONICAL_PRIOR_SLUG: Record<number, string | undefined> = {

  2: "snapshot",

  3: "revenue",

  4: "operations",

  5: "advantage"

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

  readSlugs: ReadonlySet<string>

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

    const visualState: BusinessHubQuestCard["visualState"] = locked

      ? "locked"

      : resolveHubVisualState(false, progressPct, engineCompleted);

    const route = quest.hubRoute?.trim() || `/business/${quest.slug}`;

    const subtitle =

      quest.hubSubtitle?.trim() ||

      quest.investorQuestion ||

      quest.description;

    const cardCount = resolveHubCardCount(quest);

    const priorTitle = priorQuest?.title ?? priorSlug ?? "previous quest";



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

      unlockSource:

        locked && priorSlug

          ? { slug: priorSlug, title: priorTitle }

          : null

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

