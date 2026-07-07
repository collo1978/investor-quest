import type { CompanyId } from "@/data/companies";

const STORAGE_PREFIX = "iq-business-checklist-l2-unlock-seen";

export const BUSINESS_CHECKLIST_UNLOCK_EVENT = "iq-business-checklist-unlock-changed";

function storageKey(companyId: CompanyId): string {
  return `${STORAGE_PREFIX}:${companyId}`;
}

export function readLevel2UnlockSeen(companyId: CompanyId): boolean {
  if (typeof localStorage === "undefined") return true;
  try {
    return localStorage.getItem(storageKey(companyId)) === "1";
  } catch {
    return true;
  }
}

export function markLevel2UnlockSeen(companyId: CompanyId): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(storageKey(companyId), "1");
    window.dispatchEvent(new Event(BUSINESS_CHECKLIST_UNLOCK_EVENT));
  } catch {
    /* ignore */
  }
}

export function clearLevel2UnlockSeen(companyId: CompanyId): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(storageKey(companyId));
    window.dispatchEvent(new Event(BUSINESS_CHECKLIST_UNLOCK_EVENT));
  } catch {
    /* ignore */
  }
}
