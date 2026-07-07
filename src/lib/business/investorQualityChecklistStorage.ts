import type { CompanyId } from "@/data/companies";

import {
  resolveCardChecklistItems,
  type InvestorQualityChecklistItemId,
  type InvestorQualityChecklistSnapshot,
  type InvestorQualityRating,
  type InvestorQualityRatingValue
} from "@/lib/business/investorQualityChecklist";

const STORAGE_PREFIX = "iq-investor-quality-checklist";

export const INVESTOR_QUALITY_CHECKLIST_CHANGED_EVENT =
  "iq-investor-quality-checklist-changed";

function storageKey(companyId: CompanyId): string {
  return `${STORAGE_PREFIX}:${companyId}`;
}

function emptySnapshot(): InvestorQualityChecklistSnapshot {
  return { evidenceCount: {}, evidenceCards: {}, ratings: {} };
}

export function readInvestorQualityChecklist(
  companyId: CompanyId
): InvestorQualityChecklistSnapshot {
  if (typeof localStorage === "undefined") return emptySnapshot();
  try {
    const raw = localStorage.getItem(storageKey(companyId));
    if (!raw) return emptySnapshot();
    const parsed = JSON.parse(raw) as InvestorQualityChecklistSnapshot;
    return {
      evidenceCount: parsed.evidenceCount ?? {},
      evidenceCards: parsed.evidenceCards ?? {},
      ratings: parsed.ratings ?? {}
    };
  } catch {
    return emptySnapshot();
  }
}

function writeSnapshot(
  companyId: CompanyId,
  snapshot: InvestorQualityChecklistSnapshot
): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(storageKey(companyId), JSON.stringify(snapshot));
    window.dispatchEvent(new Event(INVESTOR_QUALITY_CHECKLIST_CHANGED_EVENT));
  } catch {
    /* ignore quota */
  }
}

export function clearInvestorQualityChecklist(companyId: CompanyId): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(storageKey(companyId));
    window.dispatchEvent(new Event(INVESTOR_QUALITY_CHECKLIST_CHANGED_EVENT));
  } catch {
    /* ignore */
  }
}

function evidenceSnapshotsEqual(
  a: InvestorQualityChecklistSnapshot,
  b: InvestorQualityChecklistSnapshot
): boolean {
  return (
    JSON.stringify(a.evidenceCount) === JSON.stringify(b.evidenceCount) &&
    JSON.stringify(a.evidenceCards) === JSON.stringify(b.evidenceCards)
  );
}

/**
 * Rebuild checklist evidence from engine read slugs — single source of truth.
 * Clears stale localStorage after demo reset; trims evidence on unmark-as-read.
 */
export function syncChecklistEvidenceFromReadSlugs(
  companyId: CompanyId,
  readQuestSlugs: readonly string[]
): InvestorQualityChecklistSnapshot {
  const current = readInvestorQualityChecklist(companyId);
  const evidenceCount: Partial<Record<InvestorQualityChecklistItemId, number>> =
    {};
  const evidenceCards: Partial<
    Record<InvestorQualityChecklistItemId, string[]>
  > = {};

  for (const markSlug of readQuestSlugs) {
    const hashIdx = markSlug.indexOf("#");
    const questSlug = hashIdx >= 0 ? markSlug.slice(0, hashIdx) : markSlug;
    const cardId = hashIdx >= 0 ? markSlug.slice(hashIdx + 1) : "card-1";
    const cardSlugKey = hashIdx >= 0 ? markSlug : `${questSlug}#${cardId}`;
    const items = resolveCardChecklistItems(questSlug, cardId);
    if (items.length === 0) continue;

    for (const itemId of items) {
      const existing = evidenceCards[itemId] ?? [];
      if (existing.includes(cardSlugKey)) continue;
      evidenceCards[itemId] = [...existing, cardSlugKey];
      evidenceCount[itemId] = (evidenceCount[itemId] ?? 0) + 1;
    }
  }

  const next: InvestorQualityChecklistSnapshot = {
    evidenceCount,
    evidenceCards,
    ratings: current.ratings
  };

  if (evidenceSnapshotsEqual(current, next)) {
    return current;
  }

  writeSnapshot(companyId, next);
  return next;
}

export type AddChecklistEvidenceResult = {
  snapshot: InvestorQualityChecklistSnapshot;
  addedItems: InvestorQualityChecklistItemId[];
  cardSlug: string;
};

/** Add evidence from a card read. Idempotent per card slug + item. */
export function addChecklistEvidence(
  companyId: CompanyId,
  questSlug: string,
  cardId: string,
  items: readonly InvestorQualityChecklistItemId[]
): AddChecklistEvidenceResult {
  const cardSlug = `${questSlug}#${cardId}`;
  const snapshot = readInvestorQualityChecklist(companyId);
  const addedItems: InvestorQualityChecklistItemId[] = [];

  for (const itemId of items) {
    const existing = snapshot.evidenceCards[itemId] ?? [];
    if (existing.includes(cardSlug)) continue;

    snapshot.evidenceCards[itemId] = [...existing, cardSlug];
    snapshot.evidenceCount[itemId] = (snapshot.evidenceCount[itemId] ?? 0) + 1;
    addedItems.push(itemId);
  }

  if (addedItems.length > 0) {
    writeSnapshot(companyId, snapshot);
  }

  return { snapshot, addedItems, cardSlug };
}

export function saveChecklistRatings(
  companyId: CompanyId,
  questSlug: string,
  ratings: Partial<
    Record<InvestorQualityChecklistItemId, InvestorQualityRatingValue>
  >
): InvestorQualityChecklistSnapshot {
  const snapshot = readInvestorQualityChecklist(companyId);
  const now = Date.now();

  for (const [itemId, value] of Object.entries(ratings) as [
    InvestorQualityChecklistItemId,
    InvestorQualityRatingValue
  ][]) {
    if (!value) continue;
    const next: InvestorQualityRating = {
      value,
      updatedAt: now,
      questSlug
    };
    snapshot.ratings[itemId] = next;
  }

  writeSnapshot(companyId, snapshot);
  return snapshot;
}
