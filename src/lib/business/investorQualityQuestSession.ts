import type { CompanyId } from "@/data/companies";
import type { InvestorQualityChecklistItemId } from "@/lib/business/investorQualityChecklist";

const SESSION_PREFIX = "iq-quest-checklist-session";

type QuestChecklistSession = {
  evidenceItems: InvestorQualityChecklistItemId[];
  ratingSubmitted: boolean;
};

function sessionKey(companyId: CompanyId, questSlug: string): string {
  return `${SESSION_PREFIX}:${companyId}:${questSlug}`;
}

export function readQuestChecklistSession(
  companyId: CompanyId,
  questSlug: string
): QuestChecklistSession {
  if (typeof sessionStorage === "undefined") {
    return { evidenceItems: [], ratingSubmitted: false };
  }
  try {
    const raw = sessionStorage.getItem(sessionKey(companyId, questSlug));
    if (!raw) return { evidenceItems: [], ratingSubmitted: false };
    const parsed = JSON.parse(raw) as QuestChecklistSession;
    return {
      evidenceItems: Array.isArray(parsed.evidenceItems)
        ? parsed.evidenceItems.filter(Boolean)
        : [],
      ratingSubmitted: Boolean(parsed.ratingSubmitted)
    };
  } catch {
    return { evidenceItems: [], ratingSubmitted: false };
  }
}

export function writeQuestChecklistSession(
  companyId: CompanyId,
  questSlug: string,
  session: QuestChecklistSession
): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(sessionKey(companyId, questSlug), JSON.stringify(session));
  } catch {
    /* ignore */
  }
}

export function appendQuestSessionEvidence(
  companyId: CompanyId,
  questSlug: string,
  items: readonly InvestorQualityChecklistItemId[]
): InvestorQualityChecklistItemId[] {
  const session = readQuestChecklistSession(companyId, questSlug);
  const merged = new Set(session.evidenceItems);
  for (const item of items) merged.add(item);
  const evidenceItems = [...merged];
  writeQuestChecklistSession(companyId, questSlug, {
    ...session,
    evidenceItems
  });
  return evidenceItems;
}

export function markQuestRatingSubmitted(
  companyId: CompanyId,
  questSlug: string
): void {
  const session = readQuestChecklistSession(companyId, questSlug);
  writeQuestChecklistSession(companyId, questSlug, {
    ...session,
    ratingSubmitted: true
  });
}

export function clearQuestChecklistSessions(companyId: CompanyId): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    const prefix = `${SESSION_PREFIX}:${companyId}:`;
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(prefix)) keys.push(key);
    }
    for (const key of keys) sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
