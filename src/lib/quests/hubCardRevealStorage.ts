import type { CompanyId } from "@/data/companies";
import type { PillarId } from "@/data/pillars";

const REVEAL_PREFIX = "iq-hub-card-revealed";
const REVEAL_EPOCH_PREFIX = "iq-hub-card-reveal-epoch";
const TOAST_PREFIX = "iq-hub-unlock-toast";

function revealKey(companyId: CompanyId, pillarId: PillarId, slug: string): string {
  return `${REVEAL_PREFIX}:${companyId}:${pillarId}:${slug}`;
}

function revealEpochKey(companyId: CompanyId, pillarId: PillarId, slug: string): string {
  return `${REVEAL_EPOCH_PREFIX}:${companyId}:${pillarId}:${slug}`;
}

function toastKey(companyId: CompanyId, pillarId: PillarId, slug: string): string {
  return `${TOAST_PREFIX}:${companyId}:${pillarId}:${slug}`;
}

function readSet(keyPrefix: string): Set<string> {
  if (typeof sessionStorage === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(keyPrefix);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? new Set(parsed.filter((v): v is string => typeof v === "string"))
      : new Set();
  } catch {
    return new Set();
  }
}

function writeSet(keyPrefix: string, values: Set<string>): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(keyPrefix, JSON.stringify([...values]));
  } catch {
    /* ignore quota */
  }
}

function revealSetKey(companyId: CompanyId, pillarId: PillarId): string {
  return `${REVEAL_PREFIX}-set:${companyId}:${pillarId}`;
}

function readRevealEpoch(
  companyId: CompanyId,
  pillarId: PillarId,
  slug: string
): number | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(revealEpochKey(companyId, pillarId, slug));
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Slot 1 and completed quests always show their title. */
export function isHubCardTitleRevealed(
  companyId: CompanyId,
  pillarId: PillarId,
  slug: string,
  orderNumber: number,
  completed: boolean,
  unlockEpoch: number | null | undefined
): boolean {
  if (orderNumber <= 1 || completed) return true;
  if (unlockEpoch == null) return false;
  if (!readSet(revealSetKey(companyId, pillarId)).has(slug)) return false;
  return readRevealEpoch(companyId, pillarId, slug) === unlockEpoch;
}

export function markHubCardTitleRevealed(
  companyId: CompanyId,
  pillarId: PillarId,
  slug: string,
  unlockEpoch: number | null | undefined
): void {
  if (unlockEpoch == null) return;
  const set = readSet(revealSetKey(companyId, pillarId));
  set.add(slug);
  writeSet(revealSetKey(companyId, pillarId), set);
  try {
    sessionStorage.setItem(revealKey(companyId, pillarId, slug), "1");
    sessionStorage.setItem(
      revealEpochKey(companyId, pillarId, slug),
      String(unlockEpoch)
    );
  } catch {
    /* ignore */
  }
}

export function clearHubCardTitleRevealed(
  companyId: CompanyId,
  pillarId: PillarId,
  slug: string
): void {
  const set = readSet(revealSetKey(companyId, pillarId));
  if (!set.has(slug)) return;
  set.delete(slug);
  writeSet(revealSetKey(companyId, pillarId), set);
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(revealKey(companyId, pillarId, slug));
    sessionStorage.removeItem(revealEpochKey(companyId, pillarId, slug));
  } catch {
    /* ignore */
  }
}

/** One-shot hub toast per newly unlocked card (until the player reveals it). */
export function consumeHubUnlockToast(
  companyId: CompanyId,
  pillarId: PillarId,
  slug: string
): boolean {
  if (typeof sessionStorage === "undefined") return false;
  const key = toastKey(companyId, pillarId, slug);
  try {
    if (sessionStorage.getItem(key) === "1") return false;
    sessionStorage.setItem(key, "1");
    return true;
  } catch {
    return false;
  }
}
