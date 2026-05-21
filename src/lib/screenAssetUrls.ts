/** Public URLs under `public/` — client-safe. */

export const BUSINESS_ISLAND_PUBLIC_REL =
  "screens/business-island-screen.png" as const;

export const BUSINESS_ISLAND_SCREEN_PATH =
  "/screens/business-island-screen.png" as const;

/** Filename under `public/screens/` — scenery only (no baked UI). */
export const BIZ_ISLAND_QUEST_FILENAME = "biz-quest.webp" as const;

/**
 * Business hub hero — file on disk: `public/screens/biz-quest.webp`.
 * Bump {@link BUSINESS_HUB_PAINT_REVISION} when you replace assets so browsers refetch.
 */
export const BIZ_ISLAND_QUEST_IMAGE_PATH =
  `/screens/${BIZ_ISLAND_QUEST_FILENAME}` as const;

/** Increment every time hub/map scenery is replaced. */
export const BUSINESS_HUB_PAINT_REVISION = "2" as const;

/** @deprecated Prefer {@link BUSINESS_HUB_IMG_SRC} (static + cache-friendly). */
export const BUSINESS_HUB_API_PATH = "/api/business-hub-art" as const;

/** Hub scene art for `/business` — static file + paint revision cache bust. */
export const BUSINESS_HUB_IMG_SRC =
  `${BIZ_ISLAND_QUEST_IMAGE_PATH}?paintRev=${BUSINESS_HUB_PAINT_REVISION}` as const;

/** Filename under `public/screens/` — Financials hub scenery only. */
export const FINANCIAL_QUEST_FILENAME = "financial-quest.webp" as const;

export const FINANCIAL_QUEST_IMAGE_PATH =
  `/screens/${FINANCIAL_QUEST_FILENAME}` as const;

export const FINANCIAL_HUB_PAINT_REVISION = "2" as const;

/** @deprecated Prefer {@link FINANCIAL_HUB_IMG_SRC} (static + cache-friendly). */
export const FINANCIAL_HUB_API_PATH = "/api/financials-hub-art" as const;

export const FINANCIAL_HUB_IMG_SRC =
  `${FINANCIAL_QUEST_IMAGE_PATH}?paintRev=${FINANCIAL_HUB_PAINT_REVISION}` as const;

/** Filename under `public/screens/` — Management hub scenery only. */
export const MANAGEMENT_QUEST_FILENAME = "management-quest.webp" as const;

export const MANAGEMENT_QUEST_IMAGE_PATH =
  `/screens/${MANAGEMENT_QUEST_FILENAME}` as const;

export const MANAGEMENT_HUB_PAINT_REVISION = "2" as const;

/** @deprecated Prefer {@link MANAGEMENT_HUB_IMG_SRC} (static + cache-friendly). */
export const MANAGEMENT_HUB_API_PATH = "/api/management-hub-art" as const;

export const MANAGEMENT_HUB_IMG_SRC =
  `${MANAGEMENT_QUEST_IMAGE_PATH}?paintRev=${MANAGEMENT_HUB_PAINT_REVISION}` as const;

/** Filename under `public/screens/` — Forces hub scenery only. */
export const FORCES_QUEST_FILENAME = "forces-quest.webp" as const;

export const FORCES_QUEST_IMAGE_PATH = `/screens/${FORCES_QUEST_FILENAME}` as const;

export const FORCES_HUB_PAINT_REVISION = "2" as const;

/** @deprecated Prefer {@link FORCES_HUB_IMG_SRC} (static + cache-friendly). */
export const FORCES_HUB_API_PATH = "/api/forces-hub-art" as const;

export const FORCES_HUB_IMG_SRC =
  `${FORCES_QUEST_IMAGE_PATH}?paintRev=${FORCES_HUB_PAINT_REVISION}` as const;

/** Legacy map — kept for reference / fallback captions. */
export const QUEST_MAP_LEGACY_PATH = "/screens/quest-map.png" as const;

export const QUEST_MAP_PUBLIC_REL = "screens/final-quest-map.webp" as const;
export const QUEST_MAP_PATH = "/screens/final-quest-map.webp" as const;
export const QUEST_MAP_AVIF_PATH = "/screens/final-quest-map.avif" as const;

export const MISSION_BRIEF_IMAGE_PUBLIC_REL =
  "screens/mission-brief-image.webp" as const;
export const MISSION_BRIEF_IMAGE_PATH =
  "/screens/mission-brief-image.webp" as const;
