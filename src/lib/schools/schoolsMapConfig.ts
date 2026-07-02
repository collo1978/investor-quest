import type { PillarId } from "@/data/pillars";

/** Schools quest map artwork (`public/logos/new-map.png`). */
export const SCHOOLS_MAP_IMAGE_SRC = "/logos/new-map.png";

/** First-visit mission brief on canonical `/schools/map`. */
export const SCHOOLS_MISSION_BRIEF_IMG_SRC = "/logos/schools-mission-brief.png";

export const SCHOOLS_MAP_NATURAL = {
  width: 1672,
  height: 941
} as const;

export type SchoolsMapDescriptionBox = {
  id: PillarId;
  title: string;
  description: string;
  accent: string;
  unlocked: boolean;
  left: number;
  top: number;
  width: number;
  height: number;
};

type PixelRect = { x: number; y: number; w: number; h: number };

function toPercentRect({ x, y, w, h }: PixelRect): Omit<SchoolsMapDescriptionBox, "id" | "title" | "description" | "accent" | "unlocked"> {
  const { width: W, height: H } = SCHOOLS_MAP_NATURAL;
  return {
    left: (x / W) * 100,
    top: (y / H) * 100,
    width: (w / W) * 100,
    height: (h / H) * 100
  };
}

/** Interactive pillar cards on `new-map.png` (1672×941). */
const BOX_PIXELS: Record<
  PillarId,
  PixelRect & { title: string; description: string; accent: string; unlocked: boolean }
> = {
  business: {
    x: 16,
    y: 72,
    w: 300,
    h: 108,
    title: "Business",
    description: "How do they make money?",
    accent: "#f59e0b",
    unlocked: true
  },
  forces: {
    x: 1356,
    y: 72,
    w: 300,
    h: 108,
    title: "Risks",
    description: "What are the threats?",
    accent: "#ef4444",
    unlocked: true
  },
  financials: {
    x: 16,
    y: 760,
    w: 300,
    h: 108,
    title: "Financial",
    description: "Are they financially strong?",
    accent: "#22c55e",
    unlocked: true
  },
  management: {
    x: 1356,
    y: 760,
    w: 300,
    h: 108,
    title: "Management",
    description: "Would you trust them?",
    accent: "#3b82f6",
    unlocked: true
  }
};

export const SCHOOLS_MAP_DESCRIPTION_BOXES: readonly SchoolsMapDescriptionBox[] = (
  Object.entries(BOX_PIXELS) as [
    PillarId,
    PixelRect & { title: string; description: string; accent: string; unlocked: boolean }
  ][]
).map(([id, rect]) => {
  const { title, description, accent, unlocked, ...pixels } = rect;
  return {
    id,
    title,
    description,
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

/** Elliptical hit areas over each island on `new-map.png`. */
export const SCHOOLS_MAP_ISLAND_HOTSPOTS: readonly SchoolsMapIslandHotspot[] = [
  { id: "business", cx: 25, cy: 24, w: 15, h: 22 },
  { id: "forces", cx: 75, cy: 24, w: 15, h: 22 },
  { id: "financials", cx: 25, cy: 74, w: 15, h: 22 },
  { id: "management", cx: 75, cy: 74, w: 15, h: 22 }
];

const SCHOOLS_MAP_UNLOCKED_BY_ID = Object.fromEntries(
  SCHOOLS_MAP_DESCRIPTION_BOXES.map((box) => [box.id, box.unlocked])
) as Record<PillarId, boolean>;

export function isSchoolsMapPillarUnlocked(id: PillarId): boolean {
  return SCHOOLS_MAP_UNLOCKED_BY_ID[id] ?? false;
}
