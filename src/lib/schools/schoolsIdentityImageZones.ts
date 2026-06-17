import type { SchoolsArmorId } from "@/lib/schools/schoolsIdentities";

/** Background art only (`public/logos/choose-your-investor-armor.png`). */
export const SCHOOLS_ARMOR_IMAGE_SRC = "/logos/choose-your-investor-armor.png";

/** @deprecated Use {@link SCHOOLS_ARMOR_IMAGE_SRC}. */
export const SCHOOLS_IDENTITY_IMAGE_SRC = SCHOOLS_ARMOR_IMAGE_SRC;

export const SCHOOLS_ARMOR_IMAGE_NATURAL = {
  width: 1536,
  height: 1024
} as const;

/** @deprecated Use {@link SCHOOLS_ARMOR_IMAGE_NATURAL}. */
export const SCHOOLS_IDENTITY_IMAGE_NATURAL = SCHOOLS_ARMOR_IMAGE_NATURAL;

export type ArmorOptionZone = {
  id: SchoolsArmorId;
  left: number;
  top: number;
  width: number;
  height: number;
};

/** @deprecated Use {@link ArmorOptionZone}. */
export type IdentityOptionZone = ArmorOptionZone;

type PixelRect = { x: number; y: number; w: number; h: number };

function toPercentRect({ x, y, w, h }: PixelRect): Omit<ArmorOptionZone, "id"> {
  const { width: W, height: H } = SCHOOLS_ARMOR_IMAGE_NATURAL;
  return {
    left: (x / W) * 100,
    top: (y / H) * 100,
    width: (w / W) * 100,
    height: (h / H) * 100
  };
}

/**
 * SELECT CTA per armor column on 1536×1024 art — inside each card, under the feet.
 */
const SELECT_BUTTON_PIXELS: Record<SchoolsArmorId, PixelRect> = {
  builder: { x: 98, y: 846, w: 200, h: 42 },
  pioneer: { x: 465, y: 846, w: 198, h: 40 },
  titan: { x: 838, y: 846, w: 182, h: 42 },
  visionary: { x: 1230, y: 846, w: 205, h: 42 }
};

export const ARMOR_SELECT_ZONES: readonly ArmorOptionZone[] = (
  Object.entries(SELECT_BUTTON_PIXELS) as [SchoolsArmorId, PixelRect][]
).map(([id, rect]) => ({
  id,
  ...toPercentRect(rect)
}));

/** @deprecated Use {@link ARMOR_SELECT_ZONES}. */
export const ARMOR_OPTION_ZONES = ARMOR_SELECT_ZONES;

/** @deprecated Use {@link ARMOR_SELECT_ZONES}. */
export const IDENTITY_OPTION_ZONES = ARMOR_SELECT_ZONES;

/** @deprecated Use {@link ARMOR_SELECT_ZONES}. */
export const IDENTITY_HIT_ZONES = ARMOR_SELECT_ZONES;

/** @deprecated Continue is a real HTML CTA — no image hit zone. */
export type IdentityHitZone = ArmorOptionZone;
