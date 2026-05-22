import { PILLAR_ORDER, type PillarId } from "@/data/pillars";
import type { CompanyId } from "@/data/companies";
import {
  STATE_VERSION,
  STORAGE_KEY,
  type CompanyProgress,
  type GameState,
  type PillarState
} from "@/engine/progression/state";
import { questCardCompositeSlug } from "@/lib/quests/questCardReadProgress";

export type QuestProgressRepairMode =
  | "repair"
  | "reset"
  | "unlock_quiz";

export type QuestProgressClientRepairParams = {
  companyId: CompanyId;
  pillarId: PillarId;
  questSlug: string;
  cardIds: string[];
  mode: QuestProgressRepairMode;
};

function loadState(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (parsed.version !== STATE_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveState(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function slugsForQuest(questSlug: string, cardIds: string[]): string[] {
  const slugs = cardIds.map((id) => questCardCompositeSlug(questSlug, id));
  slugs.push(questSlug);
  return [...new Set(slugs)];
}

function isQuestReadSlug(slug: string, questSlug: string): boolean {
  return slug === questSlug || slug.startsWith(`${questSlug}#`);
}

function patchPillarReads(
  pillar: PillarState,
  questSlug: string,
  cardIds: string[],
  mode: QuestProgressRepairMode
): PillarState {
  const existing = new Set(pillar.readQuestSlugs);
  const now = Date.now();
  const readAt = { ...pillar.readAt };

  if (mode === "reset") {
    const nextSlugs = pillar.readQuestSlugs.filter(
      (s) => !isQuestReadSlug(s, questSlug)
    );
    for (const key of Object.keys(readAt)) {
      if (isQuestReadSlug(key, questSlug)) delete readAt[key];
    }
    return { ...pillar, readQuestSlugs: nextSlugs, readAt };
  }

  for (const slug of slugsForQuest(questSlug, cardIds)) {
    if (!existing.has(slug)) {
      existing.add(slug);
      readAt[slug] = now;
    }
  }

  return {
    ...pillar,
    readQuestSlugs: [...existing],
    readAt
  };
}

/**
 * Apply quest read-state repair in the browser (localStorage).
 * Used from Mission Control mobile fix on a test device.
 */
export function applyQuestProgressClientRepair(
  params: QuestProgressClientRepairParams
): { ok: boolean; message: string; laymanMessage: string } {
  if (typeof window === "undefined") {
    return {
      ok: false,
      message: "Client repair requires a browser.",
      laymanMessage: "Open this fix link on a phone or laptop with the game open."
    };
  }

  const state = loadState();
  if (!state) {
    return {
      ok: false,
      message: "No saved game state in localStorage.",
      laymanMessage:
        "No saved progress found on this device. Play the quest once, then try again."
    };
  }

  const company = state.companies[params.companyId];
  if (!company) {
    return {
      ok: false,
      message: `Company ${params.companyId} not in save.`,
      laymanMessage: "This device does not have that company in saved progress."
    };
  }

  if (!PILLAR_ORDER.includes(params.pillarId)) {
    return {
      ok: false,
      message: `Unknown pillar ${params.pillarId}`,
      laymanMessage: "Quest pillar not recognized."
    };
  }

  const pillar = company.pillars[params.pillarId];
  const nextPillar = patchPillarReads(
    pillar,
    params.questSlug,
    params.cardIds,
    params.mode
  );

  const nextCompany: CompanyProgress = {
    ...company,
    pillars: { ...company.pillars, [params.pillarId]: nextPillar }
  };

  saveState({
    ...state,
    companies: { ...state.companies, [params.companyId]: nextCompany }
  });

  const modeLabel =
    params.mode === "reset"
      ? "Reset"
      : params.mode === "unlock_quiz"
        ? "Quiz unlock"
        : "Repair";

  return {
    ok: true,
    message: `${modeLabel} applied for ${params.questSlug} (${params.companyId}).`,
    laymanMessage: `${modeLabel} saved on this device. Hard-refresh the quest page (pull to refresh on mobile) to see the quiz unlock.`
  };
}
