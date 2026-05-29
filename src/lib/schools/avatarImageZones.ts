import type { SchoolsAvatarId } from "@/lib/schools/avatars";

/** Widescreen `choose-your-avatar` artwork (natural pixels). */
export const SCHOOLS_CHOOSE_AVATAR_IMAGE_SRC =
  "/images/schools/choose-your-avatar.png";

export const SCHOOLS_CHOOSE_AVATAR_NATURAL = {
  width: 1536,
  height: 1024
} as const;

export type AvatarImageZone = {
  id: SchoolsAvatarId;
  /** % from left edge of the rendered image */
  left: number;
  /** % from top edge of the rendered image */
  top: number;
  width: number;
  height: number;
};

type PixelRect = { x: number; y: number; w: number; h: number };

function toPercentRect({ x, y, w, h }: PixelRect): Omit<AvatarImageZone, "id"> {
  const { width: W, height: H } = SCHOOLS_CHOOSE_AVATAR_NATURAL;
  return {
    left: (x / W) * 100,
    top: (y / H) * 100,
    width: (w / W) * 100,
    height: (h / H) * 100
  };
}

/**
 * Card frames measured on the 1536×1024 master PNG (widescreen grid).
 * Inset a few px so outlines sit on the visible card border, not the gutter.
 */
const CARD_W = 200;
const CARD_H = 330;
/** Row 1 cards include a taller footer (name + trait lines). */
const ROW1_CARD_H = 345;
/** Extra hit area on the right edge of row 1 cards. */
const ROW1_RIGHT_PAD = 10;
/** Extra hit area on the right edge of row 2 (first three columns). */
const ROW2_RIGHT_PAD = 10;
const GRID_LEFT = 388;
const COL_STEP = 226;
const ROW1_TOP = 142;
const ROW2_TOP = 490;
const INSET = 4;

const COLUMN_IDS: readonly SchoolsAvatarId[] = [
  "alex",
  "zoe",
  "jayden",
  "skylar",
  "ethan"
] as const;

const ROW2_IDS: readonly SchoolsAvatarId[] = [
  "riley",
  "mason",
  "aria",
  "leo",
  "nova"
] as const;

function cardZone(
  id: SchoolsAvatarId,
  col: number,
  rowTop: number,
  rect?: Partial<PixelRect>
): AvatarImageZone {
  const base: PixelRect = {
    x: GRID_LEFT + col * COL_STEP + INSET,
    y: rowTop + INSET,
    w: CARD_W - INSET * 2,
    h: CARD_H - INSET * 2
  };
  return {
    id,
    ...toPercentRect({ ...base, ...rect })
  };
}

/** Fine-tuned on the 1536×1024 artwork (row 1). */
const ROW1_ZONE_OVERRIDES: Partial<Record<SchoolsAvatarId, Partial<PixelRect>>> = {
  alex: { x: 400, y: 146, w: 190 },
  zoe: { x: 628, y: 144, w: 192 },
  jayden: { x: 856, y: 145, w: 190 }
};

const ROW2_RIGHT_PAD_IDS = new Set<SchoolsAvatarId>(["riley", "mason", "aria"]);
/** Extra right padding beyond {@link ROW2_RIGHT_PAD} for specific row 2 cards. */
const ROW2_EXTRA_RIGHT_PAD: Partial<Record<SchoolsAvatarId, number>> = {
  riley: 6
};

export const AVATAR_IMAGE_ZONES: readonly AvatarImageZone[] = [
  ...COLUMN_IDS.map((id, col) => {
    const tuning = ROW1_ZONE_OVERRIDES[id];
    const baseW = tuning?.w ?? CARD_W - INSET * 2;
    return cardZone(id, col, ROW1_TOP, {
      h: ROW1_CARD_H,
      ...tuning,
      w: baseW + ROW1_RIGHT_PAD
    });
  }),
  ...ROW2_IDS.map((id, col) => {
    const baseW = CARD_W - INSET * 2;
    const rightPad = ROW2_RIGHT_PAD + (ROW2_EXTRA_RIGHT_PAD[id] ?? 0);
    return cardZone(
      id,
      col,
      ROW2_TOP,
      ROW2_RIGHT_PAD_IDS.has(id) ? { w: baseW + rightPad } : undefined
    );
  })
] as const;

/** Pixel crop of one avatar card on the master artwork. */
export function getAvatarCardCropPixels(id: SchoolsAvatarId): PixelRect {
  const zone = AVATAR_IMAGE_ZONES.find((z) => z.id === id);
  if (!zone) {
    return { x: 0, y: 0, w: CARD_W, h: CARD_H };
  }
  const { width: W, height: H } = SCHOOLS_CHOOSE_AVATAR_NATURAL;
  return {
    x: (zone.left / 100) * W,
    y: (zone.top / 100) * H,
    w: (zone.width / 100) * W,
    h: (zone.height / 100) * H
  };
}
