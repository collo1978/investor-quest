import type { CompanyId } from "@/data/companies";
import {
  BUSINESS_ISLAND_STORY_LOCATIONS,
  locationsForNotebookQuestion,
  type BusinessIslandStoryLocationId
} from "@/lib/business/businessIslandStoryLocations";
import {
  digDeeperKey,
  INVESTOR_NOTEBOOK_QUESTIONS,
  type InvestorNotebookQuestionId
} from "@/lib/business/businessIslandInvestorNotebook";

export const BUSINESS_ISLAND_STORY_PROGRESS_EVENT =
  "iq:business-island-story-progress";

export type BusinessIslandStoryLocationVisualState =
  | "locked"
  | "available"
  | "active"
  | "visited";

export type BusinessIslandStoryProgressState = {
  visitedLocationIds: BusinessIslandStoryLocationId[];
  /** Soft highlight on notebook when evidence was just added. */
  pulseQuestionId: InvestorNotebookQuestionId | null;
  /** Evidence labels collected per mastery question (from campus places). */
  evidenceByQuestion: Partial<Record<InvestorNotebookQuestionId, string[]>>;
  /** Latest evidence chip to toast in the notebook. */
  lastEvidenceLabel: string | null;
  /** Mastered main questions — drives the green tick. */
  masteredQuestionIds: InvestorNotebookQuestionId[];
  /** Completed Dig Deeper challenge keys (`questionId:index`). */
  digDeeperCompletedKeys: string[];
  /** Armed-but-not-solved Bonus Investigation — shows the glowing HQ marker. */
  pendingBonus: BonusInvestigationRef | null;
};

export type BonusInvestigationRef = {
  questionId: InvestorNotebookQuestionId;
  index: number;
};

const EMPTY: BusinessIslandStoryProgressState = {
  visitedLocationIds: [],
  pulseQuestionId: null,
  evidenceByQuestion: {},
  lastEvidenceLabel: null,
  masteredQuestionIds: [],
  digDeeperCompletedKeys: [],
  pendingBonus: null
};

function storageKey(companyId: CompanyId): string {
  return `iq.business.island.story.v5.${companyId}`;
}

function isLocationId(value: unknown): value is BusinessIslandStoryLocationId {
  return (
    typeof value === "string" &&
    BUSINESS_ISLAND_STORY_LOCATIONS.some((loc) => loc.id === value)
  );
}

function isQuestionId(value: unknown): value is InvestorNotebookQuestionId {
  return (
    typeof value === "string" &&
    INVESTOR_NOTEBOOK_QUESTIONS.some((q) => q.id === value)
  );
}

function normalizeEvidence(
  value: unknown
): Partial<Record<InvestorNotebookQuestionId, string[]>> {
  if (!value || typeof value !== "object") return {};
  const out: Partial<Record<InvestorNotebookQuestionId, string[]>> = {};
  for (const [key, labels] of Object.entries(
    value as Record<string, unknown>
  )) {
    if (!isQuestionId(key) || !Array.isArray(labels)) continue;
    out[key] = labels.filter((label): label is string => typeof label === "string");
  }
  return out;
}

function normalizeQuestionIds(value: unknown): InvestorNotebookQuestionId[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isQuestionId);
}

function normalizeDigDeeperKeys(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((key): key is string => typeof key === "string");
}

function normalizePendingBonus(value: unknown): BonusInvestigationRef | null {
  if (!value || typeof value !== "object") return null;
  const questionId = (value as { questionId?: unknown }).questionId;
  const index = (value as { index?: unknown }).index;
  if (
    isQuestionId(questionId) &&
    typeof index === "number" &&
    Number.isInteger(index) &&
    index >= 0
  ) {
    return { questionId, index };
  }
  return null;
}

export function readBusinessIslandStoryProgress(
  companyId: CompanyId
): BusinessIslandStoryProgressState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(storageKey(companyId));
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<BusinessIslandStoryProgressState>;
    const visited = Array.isArray(parsed.visitedLocationIds)
      ? parsed.visitedLocationIds.filter(isLocationId)
      : [];
    return {
      visitedLocationIds: visited,
      pulseQuestionId: isQuestionId(parsed.pulseQuestionId)
        ? parsed.pulseQuestionId
        : null,
      evidenceByQuestion: normalizeEvidence(parsed.evidenceByQuestion),
      lastEvidenceLabel:
        typeof parsed.lastEvidenceLabel === "string"
          ? parsed.lastEvidenceLabel
          : null,
      masteredQuestionIds: normalizeQuestionIds(parsed.masteredQuestionIds),
      digDeeperCompletedKeys: normalizeDigDeeperKeys(parsed.digDeeperCompletedKeys),
      pendingBonus: normalizePendingBonus(parsed.pendingBonus)
    };
  } catch {
    return EMPTY;
  }
}

function writeProgress(
  companyId: CompanyId,
  next: BusinessIslandStoryProgressState
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(companyId), JSON.stringify(next));
    window.dispatchEvent(
      new CustomEvent(BUSINESS_ISLAND_STORY_PROGRESS_EVENT, {
        detail: { companyId }
      })
    );
  } catch {
    /* ignore quota */
  }
}

export function markBusinessIslandStoryLocationVisited(
  companyId: CompanyId,
  locationId: BusinessIslandStoryLocationId
): BusinessIslandStoryProgressState {
  const current = readBusinessIslandStoryProgress(companyId);
  const location = BUSINESS_ISLAND_STORY_LOCATIONS.find(
    (loc) => loc.id === locationId
  );
  if (!location) return current;

  const alreadyVisited = current.visitedLocationIds.includes(locationId);
  const visited = alreadyVisited
    ? current.visitedLocationIds
    : [...current.visitedLocationIds, locationId];

  const evidenceByQuestion = { ...current.evidenceByQuestion };
  const primaryQuestion = location.notebookQuestionIds[0] ?? null;
  if (!alreadyVisited) {
    for (const questionId of location.notebookQuestionIds) {
      const prior = evidenceByQuestion[questionId] ?? [];
      if (!prior.includes(location.evidenceLabel)) {
        evidenceByQuestion[questionId] = [...prior, location.evidenceLabel];
      }
    }
  }

  const addsEvidence = !alreadyVisited && location.notebookQuestionIds.length > 0;
  const next: BusinessIslandStoryProgressState = {
    ...current,
    visitedLocationIds: visited,
    pulseQuestionId: alreadyVisited ? current.pulseQuestionId : primaryQuestion,
    evidenceByQuestion,
    lastEvidenceLabel: addsEvidence
      ? location.evidenceLabel
      : alreadyVisited
        ? current.lastEvidenceLabel
        : null
  };
  writeProgress(companyId, next);
  return next;
}

/** Green-tick mastery — learner affirms they can explain the main question. */
export function markInvestorNotebookQuestionMastered(
  companyId: CompanyId,
  questionId: InvestorNotebookQuestionId
): BusinessIslandStoryProgressState {
  const current = readBusinessIslandStoryProgress(companyId);
  if (current.masteredQuestionIds.includes(questionId)) return current;
  const next: BusinessIslandStoryProgressState = {
    ...current,
    masteredQuestionIds: [...current.masteredQuestionIds, questionId],
    pulseQuestionId: questionId
  };
  writeProgress(companyId, next);
  return next;
}

/**
 * Completes one Dig Deeper challenge. Returns null if already completed.
 */
export function markInvestorNotebookDigDeeperComplete(
  companyId: CompanyId,
  questionId: InvestorNotebookQuestionId,
  index: number
): BusinessIslandStoryProgressState | null {
  const key = digDeeperKey(questionId, index);
  const current = readBusinessIslandStoryProgress(companyId);
  if (current.digDeeperCompletedKeys.includes(key)) return null;
  const next: BusinessIslandStoryProgressState = {
    ...current,
    digDeeperCompletedKeys: [...current.digDeeperCompletedKeys, key]
  };
  writeProgress(companyId, next);
  return next;
}

/**
 * Arms a Bonus Investigation from the checklist (Dig Deeper click). No XP yet —
 * this just surfaces the glowing marker on Headquarters. Skips already-solved ones.
 */
export function armBonusInvestigation(
  companyId: CompanyId,
  questionId: InvestorNotebookQuestionId,
  index: number
): BusinessIslandStoryProgressState {
  const current = readBusinessIslandStoryProgress(companyId);
  const key = digDeeperKey(questionId, index);
  if (current.digDeeperCompletedKeys.includes(key)) return current;
  if (
    current.pendingBonus &&
    current.pendingBonus.questionId === questionId &&
    current.pendingBonus.index === index
  ) {
    return current;
  }
  const next: BusinessIslandStoryProgressState = {
    ...current,
    pendingBonus: { questionId, index }
  };
  writeProgress(companyId, next);
  return next;
}

export function clearPendingBonusInvestigation(companyId: CompanyId): void {
  const current = readBusinessIslandStoryProgress(companyId);
  if (!current.pendingBonus) return;
  writeProgress(companyId, { ...current, pendingBonus: null });
}

/**
 * Marks a Bonus Investigation solved: records the Dig Deeper key and clears the
 * armed marker. Returns null when it was already solved (so XP isn't re-awarded).
 */
export function completeBonusInvestigation(
  companyId: CompanyId,
  questionId: InvestorNotebookQuestionId,
  index: number
): BusinessIslandStoryProgressState | null {
  const key = digDeeperKey(questionId, index);
  const current = readBusinessIslandStoryProgress(companyId);
  const pendingMatches =
    current.pendingBonus?.questionId === questionId &&
    current.pendingBonus?.index === index;
  const alreadyDone = current.digDeeperCompletedKeys.includes(key);
  const next: BusinessIslandStoryProgressState = {
    ...current,
    digDeeperCompletedKeys: alreadyDone
      ? current.digDeeperCompletedKeys
      : [...current.digDeeperCompletedKeys, key],
    pendingBonus: pendingMatches ? null : current.pendingBonus
  };
  writeProgress(companyId, next);
  return alreadyDone ? null : next;
}

export function clearBusinessIslandStoryPulse(companyId: CompanyId): void {
  const current = readBusinessIslandStoryProgress(companyId);
  if (!current.pulseQuestionId && !current.lastEvidenceLabel) return;
  writeProgress(companyId, {
    ...current,
    pulseQuestionId: null,
    lastEvidenceLabel: null
  });
}

export function resetBusinessIslandStoryProgress(companyId: CompanyId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(companyId));
    window.localStorage.removeItem(`iq.business.island.story.v4.${companyId}`);
    window.localStorage.removeItem(`iq.business.island.story.v3.${companyId}`);
    window.localStorage.removeItem(`iq.business.island.story.v2.${companyId}`);
    window.localStorage.removeItem(`iq.business.island.story.v1.${companyId}`);
    window.dispatchEvent(
      new CustomEvent(BUSINESS_ISLAND_STORY_PROGRESS_EVENT, {
        detail: { companyId }
      })
    );
  } catch {
    /* ignore */
  }
}

/** True when every mastery question in the district has a green tick. */
export function isBusinessIslandDistrictCleared(
  locationId: BusinessIslandStoryLocationId,
  progress: BusinessIslandStoryProgressState
): boolean {
  const location = BUSINESS_ISLAND_STORY_LOCATIONS.find(
    (loc) => loc.id === locationId
  );
  if (!location) return false;
  if (location.notebookQuestionIds.length === 0) {
    return progress.visitedLocationIds.includes(locationId);
  }
  return location.notebookQuestionIds.every((questionId) =>
    progress.masteredQuestionIds.includes(questionId)
  );
}

/** Cleared districts drive unlock progression (adventure path). */
export function resolveClearedBusinessIslandDistrictIds(
  progress: BusinessIslandStoryProgressState
): Set<BusinessIslandStoryLocationId> {
  const cleared = new Set<BusinessIslandStoryLocationId>();
  for (const location of BUSINESS_ISLAND_STORY_LOCATIONS) {
    if (isBusinessIslandDistrictCleared(location.id, progress)) {
      cleared.add(location.id);
    }
  }
  return cleared;
}

export function isBusinessIslandStoryLocationUnlocked(
  locationId: BusinessIslandStoryLocationId,
  cleared: ReadonlySet<string>
): boolean {
  const location = BUSINESS_ISLAND_STORY_LOCATIONS.find(
    (loc) => loc.id === locationId
  );
  if (!location) return false;
  if (location.order <= 1) return true;
  const prior = BUSINESS_ISLAND_STORY_LOCATIONS.find(
    (loc) => loc.order === location.order - 1
  );
  return prior ? cleared.has(prior.id) : false;
}

export function resolveBusinessIslandStoryLocationState(
  locationId: BusinessIslandStoryLocationId,
  cleared: ReadonlySet<string>,
  activeId: BusinessIslandStoryLocationId | null
): BusinessIslandStoryLocationVisualState {
  if (cleared.has(locationId)) return "visited";
  if (!isBusinessIslandStoryLocationUnlocked(locationId, cleared)) {
    return "locked";
  }
  if (activeId === locationId) return "active";
  return "available";
}

/** Campus evidence ready — learner has explored contributing places. */
export function hasInvestorNotebookQuestionEvidence(
  questionId: InvestorNotebookQuestionId,
  visited: ReadonlySet<string>
): boolean {
  const contributors = locationsForNotebookQuestion(questionId);
  if (contributors.length === 0) return true;
  return contributors.some((loc) => visited.has(loc.id));
}

/** @deprecated Prefer mastery — kept for call sites checking evidence readiness. */
export function isInvestorNotebookQuestionAnswered(
  questionId: InvestorNotebookQuestionId,
  visited: ReadonlySet<string>
): boolean {
  return hasInvestorNotebookQuestionEvidence(questionId, visited);
}

export function isInvestorNotebookQuestionMastered(
  questionId: InvestorNotebookQuestionId,
  progress: BusinessIslandStoryProgressState
): boolean {
  return progress.masteredQuestionIds.includes(questionId);
}

/** Checklist question unlocks with its primary district. */
export function isInvestorNotebookQuestionUnlocked(
  questionId: InvestorNotebookQuestionId,
  progress: BusinessIslandStoryProgressState
): boolean {
  const district = locationsForNotebookQuestion(questionId)[0];
  if (!district) return true;
  const cleared = resolveClearedBusinessIslandDistrictIds(progress);
  return isBusinessIslandStoryLocationUnlocked(district.id, cleared);
}

export function resolveActiveBusinessIslandStoryLocationId(
  cleared: ReadonlySet<string>
): BusinessIslandStoryLocationId | null {
  for (const location of BUSINESS_ISLAND_STORY_LOCATIONS) {
    if (
      isBusinessIslandStoryLocationUnlocked(location.id, cleared) &&
      !cleared.has(location.id)
    ) {
      return location.id;
    }
  }
  return null;
}

export function resolveNextBusinessIslandStoryLocation(
  afterId: BusinessIslandStoryLocationId
) {
  const current = BUSINESS_ISLAND_STORY_LOCATIONS.find((loc) => loc.id === afterId);
  if (!current) return null;
  return (
    BUSINESS_ISLAND_STORY_LOCATIONS.find(
      (loc) => loc.order === current.order + 1
    ) ?? null
  );
}
