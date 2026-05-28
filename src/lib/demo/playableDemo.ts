/**
 * Player-facing demo scope — controlled mode: NVIDIA only.
 */
import {
  CONTROLLED_DEMO_COMPANY_ID,
  CONTROLLED_DEMO_MODE,
  isControlledDemoQuestAllowed,
  isPillarComingSoonInControlledDemo
} from "@/lib/demo/controlledDemo";
import {
  companyById,
  DEFAULT_COMPANY_ID,
  isCompanyId,
  type Company,
  type CompanyId
} from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import { findQuestDefinition } from "@/data/quests/library";
import type { QuestDefinition } from "@/data/quests/types";
import { resolveQuestCardDisplayContent } from "@/lib/quests/questCardContentSource";
import type { StoredQuestCardAnswer } from "@/lib/supabase/questCardAnswers/types";

export const PLAYABLE_DEMO_COMPANY_IDS = CONTROLLED_DEMO_MODE
  ? ([CONTROLLED_DEMO_COMPANY_ID] as const)
  : (["aapl", "nke", "nvda"] as const);

export type PlayableDemoCompanyId = (typeof PLAYABLE_DEMO_COMPANY_IDS)[number];

export const PLAYABLE_DEMO_TICKERS = PLAYABLE_DEMO_COMPANY_IDS.map((id) =>
  companyById(id).ticker
) as readonly string[];

const COMING_SOON_PILLARS: Partial<Record<CompanyId, readonly PillarId[]>> =
  CONTROLLED_DEMO_MODE ? {} : { nvda: ["management"] };

export function isPlayableDemoCompanyId(id: string): id is PlayableDemoCompanyId {
  return (PLAYABLE_DEMO_COMPANY_IDS as readonly string[]).includes(id);
}

export function getPlayableDemoCompanies(): Company[] {
  return PLAYABLE_DEMO_COMPANY_IDS.map((id) => companyById(id));
}

export function coercePlayableDemoCompanyId(id: string): CompanyId {
  if (CONTROLLED_DEMO_MODE) return CONTROLLED_DEMO_COMPANY_ID;
  if (isCompanyId(id) && isPlayableDemoCompanyId(id)) return id;
  return DEFAULT_COMPANY_ID;
}

export function normalizePlayableUnlockedCompanies(_raw: CompanyId[]): CompanyId[] {
  return [...PLAYABLE_DEMO_COMPANY_IDS];
}

export function isPillarComingSoon(
  companyId: CompanyId,
  pillarId: PillarId
): boolean {
  if (CONTROLLED_DEMO_MODE) {
    return isPillarComingSoonInControlledDemo(companyId, pillarId);
  }
  return COMING_SOON_PILLARS[companyId]?.includes(pillarId) ?? false;
}

export function filterDemoHubQuests(
  companyId: CompanyId,
  pillarId: PillarId,
  quests: readonly QuestDefinition[]
): QuestDefinition[] {
  if (!isPlayableDemoCompanyId(companyId)) return [];
  if (isPillarComingSoon(companyId, pillarId)) return [];
  if (CONTROLLED_DEMO_MODE) {
    return quests.filter((q) => isControlledDemoQuestAllowed(pillarId, q.slug));
  }
  return [...quests];
}

export function isDemoQuestPlayable(
  companyId: CompanyId,
  pillarId: PillarId,
  questSlug: string,
  options?: {
    generatedCards?: Record<string, StoredQuestCardAnswer> | null;
    pipelineGenerating?: boolean;
  }
): boolean {
  if (!isPlayableDemoCompanyId(companyId)) return false;
  if (isPillarComingSoon(companyId, pillarId)) return false;
  if (CONTROLLED_DEMO_MODE && isControlledDemoQuestAllowed(pillarId, questSlug)) {
    return true;
  }

  const quest = findQuestDefinition(companyId, pillarId, questSlug);
  if (!quest) return false;

  const cards = quest.cards;
  if (!cards || cards.length === 0) {
    const resolved = resolveQuestCardDisplayContent({
      companyId,
      pillarId,
      questSlug,
      cardId: "main",
      instantiatedCard: quest,
      generatedCard: null,
      pipelineGenerating: options?.pipelineGenerating
    });
    if (resolved.source === "generating") return true;
    return (
      resolved.source !== "template_fallback" &&
      Boolean(resolved.plainEnglishAnswer?.trim())
    );
  }

  for (const card of cards) {
    const resolved = resolveQuestCardDisplayContent({
      companyId,
      pillarId,
      questSlug,
      cardId: card.id,
      instantiatedCard: card,
      generatedCard: options?.generatedCards?.[card.id] ?? null,
      pipelineGenerating: options?.pipelineGenerating
    });
    if (resolved.source === "generating") return true;
    if (
      resolved.source !== "template_fallback" &&
      resolved.plainEnglishAnswer?.trim()
    ) {
      return true;
    }
  }

  return false;
}
