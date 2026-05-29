import type { SchoolsAvatarId } from "@/lib/schools/avatars";

import { getAvatarCardCropPixels, SCHOOLS_CHOOSE_AVATAR_NATURAL } from "@/lib/schools/avatarImageZones";

/** Portrait-only slice of each card (head + shoulders + upper armor — no footer text). */
const PORTRAIT_HEIGHT_RATIO = 0.68;

export type PortraitCrop = { x: number; y: number; w: number; h: number };

export function getAvatarPortraitCrop(id: SchoolsAvatarId): PortraitCrop {
  const card = getAvatarCardCropPixels(id);
  const h = Math.round(card.h * PORTRAIT_HEIGHT_RATIO);
  return { x: Math.round(card.x), y: Math.round(card.y), w: Math.round(card.w), h };
}

/** Standalone portrait PNG (generated from master art — not a live crop). */
export function getSchoolsAvatarPortraitSrc(id: SchoolsAvatarId): string {
  return `/images/schools/avatars/${id}.png`;
}

export const SCHOOLS_AVATAR_PORTRAIT_ASPECT =
  getAvatarPortraitCrop("alex").w / getAvatarPortraitCrop("alex").h;

export { SCHOOLS_CHOOSE_AVATAR_NATURAL };
