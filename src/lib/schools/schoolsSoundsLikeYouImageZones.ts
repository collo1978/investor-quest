import type { Screen5OptionId } from "@/lib/bank/screen5OnboardingState";

/** Full-screen Schools experience picker (`public/logos/schools-sounds-like-you.png`). */
export const SCHOOLS_SOUNDS_LIKE_YOU_IMAGE_SRC =
  "/logos/schools-sounds-like-you.png";

export const SCHOOLS_SOUNDS_LIKE_YOU_IMAGE_NATURAL = {
  width: 1536,
  height: 1024
} as const;

export type SoundsLikeYouColumn = "orange" | "purple";

export type SoundsLikeYouHitZone = {
  id: Screen5OptionId;
  column: SoundsLikeYouColumn;
  label: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

export type SoundsLikeYouCenterHitZone = {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
};

type PixelRect = { x: number; y: number; w: number; h: number };

function toPercentRect({ x, y, w, h }: PixelRect): Omit<SoundsLikeYouHitZone, "id" | "column" | "label"> {
  const { width: W, height: H } = SCHOOLS_SOUNDS_LIKE_YOU_IMAGE_NATURAL;
  return {
    left: (x / W) * 100,
    top: (y / H) * 100,
    width: (w / W) * 100,
    height: (h / H) * 100
  };
}

function toCenterPercentRect({
  cx,
  cy,
  w,
  h
}: {
  cx: number;
  cy: number;
  w: number;
  h: number;
}): SoundsLikeYouCenterHitZone {
  const { width: W, height: H } = SCHOOLS_SOUNDS_LIKE_YOU_IMAGE_NATURAL;
  return {
    centerX: (cx / W) * 100,
    centerY: (cy / H) * 100,
    width: (w / W) * 100,
    height: (h / H) * 100
  };
}

/** Option rows on the 1536×1024 master art (tuned to baked card rows). */
const OPTION_PIXELS: ReadonlyArray<{
  id: Screen5OptionId;
  column: SoundsLikeYouColumn;
  label: string;
  rect: PixelRect;
}> = [
  {
    id: "exp-someone-told",
    column: "orange",
    label: "My parents invest in stocks",
    rect: { x: 118, y: 412, w: 598, h: 56 }
  },
  {
    id: "beg-watch",
    column: "orange",
    label: "I watch investing content online",
    rect: { x: 118, y: 488, w: 598, h: 56 }
  },
  {
    id: "exp-social",
    column: "orange",
    label: "I've heard people talk about stocks",
    rect: { x: 118, y: 564, w: 598, h: 56 }
  },
  {
    id: "exp-education",
    column: "orange",
    label: "I've read books or articles about money",
    rect: { x: 118, y: 640, w: 598, h: 56 }
  },
  {
    id: "beg-start",
    column: "purple",
    label: "I don't know where to start",
    rect: { x: 820, y: 412, w: 598, h: 56 }
  },
  {
    id: "beg-understand",
    column: "purple",
    label: "Financial information feels confusing",
    rect: { x: 820, y: 488, w: 598, h: 56 }
  },
  {
    id: "beg-education",
    column: "purple",
    label: "I've never learned this at school",
    rect: { x: 820, y: 564, w: 598, h: 56 }
  },
  {
    id: "exp-research",
    column: "purple",
    label: "I want to understand businesses better",
    rect: { x: 820, y: 640, w: 598, h: 56 }
  }
];

export const SOUNDS_LIKE_YOU_OPTION_ZONES: readonly SoundsLikeYouHitZone[] =
  OPTION_PIXELS.map(({ id, column, label, rect }) => ({
    id,
    column,
    label,
    ...toPercentRect(rect)
  }));

/** Baked CONTINUE pill — center of button ≈ (768, 962) on master art. */
export const SOUNDS_LIKE_YOU_CONTINUE_HIT_ZONE = toCenterPercentRect({
  cx: 768,
  cy: 962,
  w: 448,
  h: 72
});

/** Top-left back control (not baked — matches pick-interests placement). */
export const SOUNDS_LIKE_YOU_BACK_HIT_ZONE = toPercentRect({
  x: 24,
  y: 20,
  w: 80,
  h: 80
});
