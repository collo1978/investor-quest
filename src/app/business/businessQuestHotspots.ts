import type { NormRect } from "@/ui";

export type BusinessQuestSlug =
  | "snapshot"
  | "revenue"
  | "operations"
  | "advantage"
  | "industry";

export type BusinessQuestHotspot = {
  slug: BusinessQuestSlug;
  box: NormRect;
};

/** Top-right inside each quest panel (percent of that panel's hit box). */
export const LOCK_INSET_IN_BOX = { right: "6%", top: "10%" } as const;

/**
 * Gold ribbon bounds on `public/screens/business-quest.png` (1672×941).
 * Sized to the painted panels only — excludes dotted connector lines.
 */
export const BUSINESS_QUEST_HOTSPOTS: ReadonlyArray<BusinessQuestHotspot> = [
  { slug: "snapshot", box: { l: 0.365, t: 0.075, w: 0.27, h: 0.17 } },
  { slug: "revenue", box: { l: 0.045, t: 0.325, w: 0.25, h: 0.2 } },
  { slug: "operations", box: { l: 0.705, t: 0.325, w: 0.25, h: 0.2 } },
  { slug: "advantage", box: { l: 0.045, t: 0.655, w: 0.25, h: 0.2 } },
  { slug: "industry", box: { l: 0.705, t: 0.655, w: 0.25, h: 0.2 } }
];
