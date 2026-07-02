/** 10-K badge center on `new-map.png` (viewBox %). */
export const SCHOOLS_MAP_PORTAL_CENTER = { x: 50, y: 49.1 } as const;

/** NVIDIA skyscraper center on Business island (viewBox %). */
export const SCHOOLS_MAP_BUSINESS_BUILDING = { x: 24.1, y: 20 } as const;

/** Bridge pulse + unlock FX land on the building mass (alias). */
export const SCHOOLS_MAP_BUSINESS_TARGET = SCHOOLS_MAP_BUSINESS_BUILDING;

/** Straight energy beam — 10K portal through the bridge corridor into the tower. */
export const SCHOOLS_MAP_BUSINESS_UNLOCK_PATH = [
  `M ${SCHOOLS_MAP_PORTAL_CENTER.x} ${SCHOOLS_MAP_PORTAL_CENTER.y}`,
  `L ${SCHOOLS_MAP_BUSINESS_BUILDING.x} ${SCHOOLS_MAP_BUSINESS_BUILDING.y}`
].join(" ");

/** Bridge energy palette — matches painted orange conduit. */
export const SCHOOLS_BRIDGE_ENERGY = {
  core: "#fde68a",
  mid: "#f59e0b",
  edge: "#d97706"
} as const;

/** Continuous bridge pulse — faster travel, subtler particles. */
export const SCHOOLS_BRIDGE_FLOW_DURATION_S = 1.75;

export const SCHOOLS_BUSINESS_UNLOCK_LABEL = "YOUR JOURNEY STARTS HERE";

/** Mission brief fade before unlock FX. */
export const SCHOOLS_MISSION_BRIEF_FADE_MS = 380;

/** Center burst before pulse departs. */
export const SCHOOLS_UNLOCK_BURST_MS = 160;

/** Pulse travel along the bridge. */
export const SCHOOLS_UNLOCK_TRAVEL_MS = 1100;

/** Landing impact at Business Island. */
export const SCHOOLS_UNLOCK_LAND_MS = 320;

/** Floating label above Business Island. */
export const SCHOOLS_UNLOCK_LABEL_MS = 2600;

export const SCHOOLS_UNLOCK_TOTAL_MS =
  SCHOOLS_UNLOCK_BURST_MS + SCHOOLS_UNLOCK_TRAVEL_MS + SCHOOLS_UNLOCK_LAND_MS;
