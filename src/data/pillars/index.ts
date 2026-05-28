/**
 * Data Layer — pillar metadata only.
 *
 * Pillars are progression "islands" on the WorldMap. They are global
 * (not company-scoped). Quest content per pillar is scoped to the
 * active company and lives in `data/quests/templates/*` instantiated
 * by `data/quests/library.ts`.
 */

export type PillarId = "business" | "forces" | "financials" | "management";

export type PillarMeta = {
  id: PillarId;
  order: number;
  title: string;
  subtitle: string;
  /** Long-form blurb shown on island intro / locked screen. */
  description: string;
  /** Theming hint for UI primitives (route color / glow / icon glyph). */
  accent: string;
  glyph: string;
  /** App route for the island's quest screen. */
  route: `/${PillarId}`;
  /**
   * Path under /public for this island's full-bleed background artwork.
   * Filenames are intentionally exact (matching what's on disk in
   * /public/screens) so uploads do not have to be renamed.
   */
  screenImage: string;
};

export const PILLAR_META: readonly PillarMeta[] = [
  {
    id: "business",
    order: 0,
    title: "Business",
    subtitle: "What the company does, who it serves, and why it wins.",
    description:
      "Map the model: product portfolio, customers, revenue mix, operations, and durable advantage.",
    accent: "rgba(139,92,246,0.85)",
    glyph: "◇",
    route: "/business",
    screenImage: "/logos/business-island-screen.webp"
  },
  {
    id: "forces",
    order: 1,
    title: "Forces",
    subtitle: "Competitive dynamics, industry structure, and disruption risk.",
    description:
      "Decode the field: rivals, suppliers, customers, substitutes, and the threat of new entrants.",
    accent: "rgba(168,85,247,0.85)",
    glyph: "✦",
    route: "/forces",
    screenImage: "/screens/Forces-island.png.png"
  },
  {
    id: "financials",
    order: 2,
    title: "Financials",
    subtitle: "Durability of cash flows, margins, and capital allocation.",
    description:
      "Trace the cash: revenue drivers, margin structure, balance sheet, and how capital is redeployed.",
    accent: "rgba(59,130,246,0.85)",
    glyph: "▦",
    route: "/financials",
    screenImage: "/screens/financial-island.png"
  },
  {
    id: "management",
    order: 3,
    title: "Management",
    subtitle: "Incentives, execution cadence, and decision-making quality.",
    description:
      "Judge the operators: track record, incentives, communication, and capital stewardship.",
    accent: "rgba(216,180,254,0.85)",
    glyph: "⌬",
    route: "/management",
    screenImage: "/screens/management-island.png"
  }
] as const;

export const PILLAR_ORDER: readonly PillarId[] = PILLAR_META.map((p) => p.id);

export function pillarById(id: PillarId): PillarMeta {
  const found = PILLAR_META.find((p) => p.id === id);
  if (!found) throw new Error(`Unknown pillar id: ${id}`);
  return found;
}

export function nextPillarId(id: PillarId): PillarId | null {
  const idx = PILLAR_ORDER.indexOf(id);
  if (idx < 0) return null;
  return PILLAR_ORDER[idx + 1] ?? null;
}
