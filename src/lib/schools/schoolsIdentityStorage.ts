import {
  SCHOOLS_ARMOR_IDS,
  type SchoolsArmorId
} from "@/lib/schools/schoolsIdentities";

const STORAGE_KEY = "investor-quest::schools-armor";

export type StoredSchoolsArmor = {
  id: SchoolsArmorId;
  selectedAt: number;
};

/** @deprecated Use {@link StoredSchoolsArmor}. */
export type StoredSchoolsIdentity = StoredSchoolsArmor;

function isArmorId(value: unknown): value is SchoolsArmorId {
  return (
    typeof value === "string" &&
    (SCHOOLS_ARMOR_IDS as readonly string[]).includes(value)
  );
}

export function saveSchoolsArmor(id: SchoolsArmorId): void {
  if (typeof window === "undefined") return;
  const payload: StoredSchoolsArmor = { id, selectedAt: Date.now() };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

/** @deprecated Use {@link saveSchoolsArmor}. */
export function saveSchoolsIdentity(id: SchoolsArmorId): void {
  saveSchoolsArmor(id);
}

export function readSchoolsArmor(): StoredSchoolsArmor | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { id?: unknown; selectedAt?: unknown };
    if (!isArmorId(parsed.id)) return null;
    return {
      id: parsed.id,
      selectedAt:
        typeof parsed.selectedAt === "number" ? parsed.selectedAt : Date.now()
    };
  } catch {
    return null;
  }
}

/** @deprecated Use {@link readSchoolsArmor}. */
export function readSchoolsIdentity(): StoredSchoolsArmor | null {
  return readSchoolsArmor();
}

export function hasSchoolsArmorSelected(): boolean {
  return readSchoolsArmor() != null;
}

/** @deprecated Use {@link hasSchoolsArmorSelected}. */
export function hasSchoolsIdentitySelected(): boolean {
  return hasSchoolsArmorSelected();
}
