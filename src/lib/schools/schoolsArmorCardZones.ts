import type { SchoolsArmorId } from "@/lib/schools/schoolsIdentities";
import { SCHOOLS_ARMOR_IMAGE_NATURAL, SCHOOLS_ARMOR_IMAGE_SRC } from "@/lib/schools/schoolsIdentityImageZones";

export { SCHOOLS_ARMOR_IMAGE_SRC, SCHOOLS_ARMOR_IMAGE_NATURAL };

type PixelRect = { x: number; y: number; w: number; h: number };

/** Full per-card crop rects measured on the 1536×1024 master art (verified pixel-scan). */
const CARD_TOP = 120;
const CARD_BOTTOM = 895;
const CARD_H = CARD_BOTTOM - CARD_TOP;

const CARD_PIXELS: Record<SchoolsArmorId, PixelRect> = {
  builder: { x: 14, y: CARD_TOP, w: 372, h: CARD_H },
  pioneer: { x: 390, y: CARD_TOP, w: 366, h: CARD_H },
  titan: { x: 762, y: CARD_TOP, w: 378, h: CARD_H },
  visionary: { x: 1145, y: CARD_TOP, w: 382, h: CARD_H }
};

export type ArmorCardCrop = {
  /** Natural aspect ratio of this card's crop (w / h). */
  aspect: number;
  /** `background-size` percentages so the crop scales with the card's own box. */
  backgroundSizePct: { x: number; y: number };
  /** `background-position` percentages for the same box. */
  backgroundPositionPct: { x: number; y: number };
};

export function getArmorCardCrop(id: SchoolsArmorId): ArmorCardCrop {
  const rect = CARD_PIXELS[id];
  const { width: W, height: H } = SCHOOLS_ARMOR_IMAGE_NATURAL;
  const sizeX = (W / rect.w) * 100;
  const sizeY = (H / rect.h) * 100;
  const posX = W === rect.w ? 0 : (rect.x / (W - rect.w)) * 100;
  const posY = H === rect.h ? 0 : (rect.y / (H - rect.h)) * 100;
  return {
    aspect: rect.w / rect.h,
    backgroundSizePct: { x: sizeX, y: sizeY },
    backgroundPositionPct: { x: posX, y: posY }
  };
}
