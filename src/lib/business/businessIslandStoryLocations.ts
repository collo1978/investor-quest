/**
 * Business Island districts — a small NVIDIA campus of memorable landmarks.
 * Each district teaches a cluster of Investor Checklist mastery questions.
 *
 * Positions match the hub-and-spoke campus plate (clockwise from top).
 */

import type { InvestorNotebookQuestionId } from "@/lib/business/businessIslandInvestorNotebook";

export type BusinessIslandStoryLocationId =
  | "district-hq"
  | "district-showroom"
  | "district-commerce"
  | "district-evolution"
  | "district-ops"
  | "district-fortress";

export type BusinessIslandPlaceTheme =
  | "headquarters"
  | "products-hall"
  | "division-hub"
  | "history-trail"
  | "manufacturing"
  | "competitive-arena";

export type BusinessIslandStoryLocationDef = {
  id: BusinessIslandStoryLocationId;
  order: number;
  placeName: string;
  chapterTitle: string;
  /** One-line mission for hover / dock preview. */
  missionLine: string;
  /** Evidence chip shown in the Investor Notebook. */
  evidenceLabel: string;
  emoji: string;
  placeTheme: BusinessIslandPlaceTheme;
  notebookQuestionIds: readonly InvestorNotebookQuestionId[];
  left: string;
  top: string;
  mobileLeft: string;
  mobileTop: string;
};

/**
 * Six campus districts — radial layout matching the NVIDIA campus plate.
 * Unlock order follows investing journey (not purely clockwise).
 */
export const BUSINESS_ISLAND_STORY_LOCATIONS: readonly BusinessIslandStoryLocationDef[] =
  [
    {
      id: "district-hq",
      order: 1,
      placeName: "Headquarters",
      chapterTitle: "Headquarters",
      missionLine: "Learn who NVIDIA is and the value it brings to customers.",
      evidenceLabel: "Company identity",
      emoji: "🏢",
      placeTheme: "headquarters",
      notebookQuestionIds: ["explain-what-does", "explain-value-prop"],
      left: "50%",
      top: "22%",
      mobileLeft: "50%",
      mobileTop: "22%"
    },
    {
      id: "district-showroom",
      order: 2,
      placeName: "Products Center",
      chapterTitle: "Products Center",
      missionLine: "Explore what NVIDIA sells and how its products work together.",
      evidenceLabel: "Products & platforms",
      emoji: "📦",
      placeTheme: "products-hall",
      notebookQuestionIds: ["explain-products"],
      left: "74%",
      top: "34%",
      mobileLeft: "74%",
      mobileTop: "34%"
    },
    {
      id: "district-commerce",
      order: 3,
      placeName: "Business Model Center",
      chapterTitle: "Business Model Center",
      missionLine: "Discover how NVIDIA makes money and who its customers are.",
      evidenceLabel: "Business model & markets",
      emoji: "💰",
      placeTheme: "division-hub",
      notebookQuestionIds: [
        "explain-makes-money",
        "explain-customers",
        "explain-where-operates"
      ],
      left: "22%",
      top: "48%",
      mobileLeft: "22%",
      mobileTop: "48%"
    },
    {
      id: "district-evolution",
      order: 4,
      placeName: "Global & History Center",
      chapterTitle: "Global & History Center",
      missionLine: "Explore NVIDIA's global reach and how the business has evolved.",
      evidenceLabel: "Evolution & growth",
      emoji: "🌍",
      placeTheme: "history-trail",
      notebookQuestionIds: ["explain-evolution", "explain-future-growth"],
      left: "78%",
      top: "52%",
      mobileLeft: "78%",
      mobileTop: "52%"
    },
    {
      id: "district-ops",
      order: 5,
      placeName: "Operations Center",
      chapterTitle: "Operations Center",
      missionLine: "Learn how NVIDIA designs, builds and delivers its business.",
      evidenceLabel: "Operations",
      emoji: "⚙️",
      placeTheme: "manufacturing",
      notebookQuestionIds: ["explain-how-operates"],
      left: "50%",
      top: "78%",
      mobileLeft: "50%",
      mobileTop: "78%"
    },
    {
      id: "district-fortress",
      order: 6,
      placeName: "Competitive Advantage Center",
      chapterTitle: "Competitive Advantage Center",
      missionLine: "Discover what gives NVIDIA its competitive edge and future growth potential.",
      evidenceLabel: "Competitive advantage",
      emoji: "🏆",
      placeTheme: "competitive-arena",
      notebookQuestionIds: ["explain-competitive-advantage"],
      left: "27%",
      top: "72%",
      mobileLeft: "27%",
      mobileTop: "72%"
    }
  ] as const;

/** Campus hub centre for radial path spokes (viewBox 0–100). */
export const BUSINESS_ISLAND_CAMPUS_HUB = { x: 50, y: 48 } as const;

export function resolveBusinessIslandStoryLocation(
  id: BusinessIslandStoryLocationId
): BusinessIslandStoryLocationDef | undefined {
  return BUSINESS_ISLAND_STORY_LOCATIONS.find((loc) => loc.id === id);
}

export function businessIslandStoryLocationPosition(
  location: BusinessIslandStoryLocationDef,
  mobile: boolean
): { left: string; top: string } {
  return mobile
    ? { left: location.mobileLeft, top: location.mobileTop }
    : { left: location.left, top: location.top };
}

export function locationsForNotebookQuestion(
  questionId: InvestorNotebookQuestionId
): readonly BusinessIslandStoryLocationDef[] {
  return BUSINESS_ISLAND_STORY_LOCATIONS.filter((loc) =>
    loc.notebookQuestionIds.includes(questionId)
  );
}

/** First district that teaches this mastery question (trail order). */
export function primaryLocationForNotebookQuestion(
  questionId: InvestorNotebookQuestionId
): BusinessIslandStoryLocationDef | undefined {
  return locationsForNotebookQuestion(questionId)[0];
}

/** Hub-and-spoke paths — one clean spoke per district (no weaving ring). */
export function buildBusinessIslandSpokePathD(
  hub: { x: number; y: number },
  point: { x: number; y: number }
): string {
  return `M ${hub.x} ${hub.y} L ${point.x} ${point.y}`;
}

/** @deprecated Prefer spokes — kept for any residual call sites. */
export function buildBusinessIslandStoryPathD(
  points: readonly { x: number; y: number }[]
): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0]!.x} ${points[0]!.y}`;

  let d = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}
