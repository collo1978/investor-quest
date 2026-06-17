import type { PillarId } from "@/data/pillars";

/** Schools quest map artwork (`public/logos/latest-map-schools.png`). */
export const SCHOOLS_MAP_IMAGE_SRC = "/logos/latest-map-schools.png";

/** First-visit mission brief on canonical `/schools/map`. */
export const SCHOOLS_MISSION_BRIEF_IMG_SRC = "/logos/schools-mission-brief.png";

export const SCHOOLS_MAP_NATURAL = {
  width: 1672,
  height: 941
} as const;

export type SchoolsMapDescriptionBox = {
  id: PillarId;
  title: string;
  accent: string;
  unlocked: boolean;
  left: number;
  top: number;
  width: number;
  height: number;
};

type PixelRect = { x: number; y: number; w: number; h: number };

function toPercentRect({ x, y, w, h }: PixelRect): Omit<SchoolsMapDescriptionBox, "id" | "title" | "accent" | "unlocked"> {
  const { width: W, height: H } = SCHOOLS_MAP_NATURAL;
  return {
    left: (x / W) * 100,
    top: (y / H) * 100,
    width: (w / W) * 100,
    height: (h / H) * 100
  };
}

/** Corner description panels on the 1672×941 schools map art. */
const BOX_PIXELS: Record<
  PillarId,
  PixelRect & { title: string; accent: string; unlocked: boolean }
> = {
  business: {
    x: 42,
    y: 36,
    w: 368,
    h: 118,
    title: "Business Kingdom",
    accent: "#f59e0b",
    unlocked: true
  },
  forces: {
    x: 1262,
    y: 36,
    w: 368,
    h: 118,
    title: "Force Frontier",
    accent: "#ef4444",
    unlocked: false
  },
  financials: {
    x: 42,
    y: 787,
    w: 368,
    h: 118,
    title: "Financial Fortress",
    accent: "#22c55e",
    unlocked: false
  },
  management: {
    x: 1262,
    y: 787,
    w: 368,
    h: 118,
    title: "Leadership Council",
    accent: "#3b82f6",
    unlocked: false
  }
};

export const SCHOOLS_MAP_DESCRIPTION_BOXES: readonly SchoolsMapDescriptionBox[] = (
  Object.entries(BOX_PIXELS) as [
    PillarId,
    PixelRect & { title: string; accent: string; unlocked: boolean }
  ][]
).map(([id, rect]) => {
  const { title, accent, unlocked, ...pixels } = rect;
  return {
    id,
    title,
    accent,
    unlocked,
    ...toPercentRect(pixels)
  };
});

export type SchoolsMapIslandHotspot = {
  id: PillarId;
  cx: number;
  cy: number;
  w: number;
  h: number;
};

/**
 * Elliptical hit areas over each island mass on `latest-map-schools.png`.
 * Business only is playable in Schools — the other three stay locked.
 */
export const SCHOOLS_MAP_ISLAND_HOTSPOTS: readonly SchoolsMapIslandHotspot[] = [
  { id: "business", cx: 25.5, cy: 28, w: 24, h: 26 },
  { id: "forces", cx: 74.5, cy: 28, w: 24, h: 26 },
  { id: "financials", cx: 25.5, cy: 72, w: 26, h: 28 },
  { id: "management", cx: 74.5, cy: 72, w: 26, h: 28 }
];

const SCHOOLS_MAP_UNLOCKED_BY_ID = Object.fromEntries(
  SCHOOLS_MAP_DESCRIPTION_BOXES.map((box) => [box.id, box.unlocked])
) as Record<PillarId, boolean>;

export function isSchoolsMapPillarUnlocked(id: PillarId): boolean {
  return SCHOOLS_MAP_UNLOCKED_BY_ID[id] ?? false;
}
