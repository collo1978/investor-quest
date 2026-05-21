import type { PillarId } from "@/data/pillars";
import { sortForcesQuestTemplates } from "@/data/quests/forcesCategories";
import type { QuestTemplate } from "@/data/quests/types";
import { mergePillarTemplatesWithDemo } from "@/lib/quests/mergeQuestTemplateWithDemo";
import { BUSINESS_QUEST_TEMPLATES } from "@/data/quests/templates/business";
import { FORCES_QUEST_TEMPLATES } from "@/data/quests/templates/forces";
import { FINANCIALS_QUEST_TEMPLATES } from "@/data/quests/templates/financials";
import { MANAGEMENT_QUEST_TEMPLATES } from "@/data/quests/templates/management";

export type QuestContentCatalogSource = "supabase" | "demo";

const DEMO_BY_PILLAR: Record<PillarId, readonly QuestTemplate[]> = {
  business: BUSINESS_QUEST_TEMPLATES,
  forces: FORCES_QUEST_TEMPLATES,
  financials: FINANCIALS_QUEST_TEMPLATES,
  management: MANAGEMENT_QUEST_TEMPLATES
};

const HUB_PILLARS: readonly PillarId[] = [
  "business",
  "financials",
  "management",
  "forces"
];

let catalogCache: QuestTemplate[] | null = null;
let catalogSource: QuestContentCatalogSource = "demo";
let catalogPartnerId: string | null = null;

export function hydrateQuestContentCatalog(
  templates: QuestTemplate[],
  source: QuestContentCatalogSource = "supabase",
  partnerId?: string | null
): void {
  catalogCache = templates.length ? [...templates] : null;
  catalogSource = templates.length ? source : "demo";
  catalogPartnerId = partnerId ?? null;
}

export function getQuestCatalogSource(): QuestContentCatalogSource {
  return catalogSource;
}

export function getPillarQuestTemplates(pillarId: PillarId): readonly QuestTemplate[] {
  const demo = DEMO_BY_PILLAR[pillarId] ?? [];
  const fromCache = catalogCache?.filter((t) => t.pillarId === pillarId) ?? [];

  let raw: readonly QuestTemplate[];
  if (!fromCache.length) {
    raw = demo;
  } else if (HUB_PILLARS.includes(pillarId)) {
    raw = mergePillarTemplatesWithDemo(demo, fromCache);
  } else {
    raw = fromCache;
  }

  if (pillarId === "forces") return sortForcesQuestTemplates(raw);
  return raw;
}

export function listAllCachedQuestTemplates(): readonly QuestTemplate[] {
  if (catalogCache?.length) return catalogCache;
  return Object.values(DEMO_BY_PILLAR).flat();
}
