import { PILLAR_ORDER, type PillarId } from "@/data/pillars";
import type { CompanyProgress, GameState, PillarState } from "@/engine/progression/state";

function mergePillarReadState(
  inMemory: PillarState,
  loaded: PillarState
): PillarState {
  const readSet = new Set([
    ...loaded.readQuestSlugs,
    ...inMemory.readQuestSlugs
  ]);
  return {
    ...loaded,
    readQuestSlugs: [...readSet],
    readAt: { ...loaded.readAt, ...inMemory.readAt }
  };
}

function mergeCompanyProgress(
  inMemory: CompanyProgress | undefined,
  loaded: CompanyProgress
): CompanyProgress {
  if (!inMemory) return loaded;

  const pillars = { ...loaded.pillars };
  for (const pillarId of PILLAR_ORDER) {
    const mem = inMemory.pillars[pillarId];
    const load = loaded.pillars[pillarId];
    if (mem && load) {
      pillars[pillarId] = mergePillarReadState(mem, load);
    }
  }

  return {
    ...loaded,
    pillars,
    activeQuestSlug: inMemory.activeQuestSlug ?? loaded.activeQuestSlug,
    activePillarId: inMemory.activePillarId ?? loaded.activePillarId
  };
}

/**
 * Apply persisted state without dropping in-tab reads (Strict Mode remount
 * or slow hydration after "Mark as read").
 */
export function mergeLoadedGameState(
  inMemory: GameState,
  loaded: GameState
): GameState {
  const companyIds = new Set([
    ...Object.keys(loaded.companies),
    ...Object.keys(inMemory.companies)
  ]);

  const companies = { ...loaded.companies };
  for (const companyId of companyIds) {
    const mem = inMemory.companies[companyId];
    const load = loaded.companies[companyId];
    if (load) {
      companies[companyId] = mergeCompanyProgress(mem, load);
    }
  }

  return {
    ...loaded,
    activeCompanyId: inMemory.activeCompanyId || loaded.activeCompanyId,
    companies
  };
}
