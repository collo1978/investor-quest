import type { SchoolsAvatarId } from "@/lib/schools/avatars";
import { SCHOOLS_AVATAR_IDS } from "@/lib/schools/avatars";
import { hasSchoolsArmorSelected } from "@/lib/schools/schoolsIdentityStorage";

const STORAGE_KEY = "investor-quest::schools-avatar";

export type StoredSchoolsAvatar = {
  id: SchoolsAvatarId;
  selectedAt: number;
};

function isAvatarId(value: unknown): value is SchoolsAvatarId {
  return (
    typeof value === "string" &&
    (SCHOOLS_AVATAR_IDS as readonly string[]).includes(value)
  );
}

export function saveSchoolsAvatar(id: SchoolsAvatarId): void {
  if (typeof window === "undefined") return;
  const payload: StoredSchoolsAvatar = { id, selectedAt: Date.now() };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function readSchoolsAvatar(): StoredSchoolsAvatar | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { id?: unknown; selectedAt?: unknown };
    if (!isAvatarId(parsed.id)) return null;
    return {
      id: parsed.id,
      selectedAt:
        typeof parsed.selectedAt === "number" ? parsed.selectedAt : Date.now()
    };
  } catch {
    return null;
  }
}

export function hasSchoolsAvatarSelected(): boolean {
  return readSchoolsAvatar() != null || hasSchoolsArmorSelected();
}
