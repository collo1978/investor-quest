import type { CSSProperties } from "react";

/**
 * LOCKED company emblem anchors — same pixel placement for every company.
 * Only CSS filters adapt per logo (light / dark / color); never position or size.
 *
 * Re-tune only when hub/map island PNG art changes.
 */

const EMBLEM_CENTER: Pick<CSSProperties, "transform"> = {
  transform: "translate(-50%, -50%)"
};

/** Quest map — Forces rocket on `public/screens/final-quest-map.png`. */
export const LOCKED_MAP_FORCES_ROCKET_EMBLEM: CSSProperties = {
  left: "79%",
  top: "8.5%",
  ...EMBLEM_CENTER,
  width: "clamp(1.35rem, 4.5vw, 2.85rem)",
  height: "clamp(1.35rem, 4.5vw, 2.85rem)",
  maxWidth: "46px",
  maxHeight: "46px"
};

/** `/forces` hub only — edit here if `forces-quest.png` art changes. */
export const FORCES_HUB_ROCKET_EMBLEM_TOP = "14%" as const;
export const FORCES_HUB_ROCKET_EMBLEM_LEFT = "52%" as const;

/**
 * `/forces` hub — upper rocket fuselage (`forces-quest.png`).
 * LOCKED — every company logo uses this anchor + size. Not the quest-map rocket.
 * @see LOCKED_MAP_FORCES_ROCKET_EMBLEM
 */
export const LOCKED_FORCES_HUB_ROCKET_EMBLEM: CSSProperties = {
  top: FORCES_HUB_ROCKET_EMBLEM_TOP,
  left: FORCES_HUB_ROCKET_EMBLEM_LEFT,
  ...EMBLEM_CENTER,
  height: "clamp(2.75rem, 7%, 4rem)",
  width: "clamp(3rem, 8%, 4.5rem)",
  maxHeight: "64px",
  maxWidth: "72px"
};

export const LOCKED_FORCES_HUB_ROCKET_EMBLEM_INNER =
  "h-[72%] w-[80%] max-h-[2.5rem] max-w-[3.1rem] sm:max-h-[2.65rem] sm:max-w-[3.25rem]" as const;

/**
 * `/financials` hub — safe right-side panel (`financial-quest.png`).
 * LOCKED May 2026 — every company logo uses this anchor + size.
 */
export const LOCKED_FINANCIALS_HUB_SAFE_EMBLEM: CSSProperties = {
  top: "38%",
  left: "56%",
  ...EMBLEM_CENTER,
  height: "clamp(3.25rem, 9%, 5rem)",
  width: "clamp(3.5rem, 10%, 5.5rem)",
  maxHeight: "80px",
  maxWidth: "88px"
};

/** Inner bounds for {@link LOCKED_FINANCIALS_HUB_SAFE_EMBLEM} — do not vary per company. */
export const LOCKED_FINANCIALS_HUB_SAFE_EMBLEM_INNER =
  "h-[72%] w-[82%] max-h-[3.25rem] max-w-[3.75rem] sm:max-h-[3.5rem] sm:max-w-[4rem]" as const;

/** Business hub — tower on `public/screens/biz-quest.png`. */
export const LOCKED_BUSINESS_HUB_TOWER_EMBLEM: CSSProperties = {
  top: "40%",
  left: "50%",
  ...EMBLEM_CENTER,
  height: "clamp(2.65rem, 7.2%, 3.85rem)",
  width: "clamp(2.45rem, 6.6%, 3.55rem)",
  maxHeight: "62px",
  maxWidth: "58px"
};
