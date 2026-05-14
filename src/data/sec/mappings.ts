/**
 * Data Layer — SEC quest mappings.
 *
 * Static catalog mapping quest types and pillars to the SEC filing sections
 * the future SEC -> AI -> quest pipeline will draw from.
 *
 * Kept as pure data: no fetching, no parsing here.
 */

import type {
  PillarSecMap,
  QuestTypeSecMap
} from "@/data/sec/types";

export const QUEST_TYPE_SEC_MAP: QuestTypeSecMap = {
  snapshot: [{ form: "10-K", section: "Item 1 — Business" }],
  revenue: [
    { form: "10-K", section: "Item 7 — MD&A (revenue)" },
    { form: "10-Q", section: "MD&A (revenue)" }
  ],
  operations: [
    { form: "10-K", section: "Item 1 — Business (operations)" }
  ],
  advantage: [
    { form: "10-K", section: "Item 1 — Business (competition / strategy)" }
  ],
  industry: [
    { form: "10-K", section: "Item 1 — Business (industry overview)" }
  ],
  risk: [{ form: "10-K", section: "Item 1A — Risk Factors" }],
  timeline: [
    { form: "10-K", section: "Historical (multi-year)" },
    { form: "DEF 14A", section: "Compensation Discussion & Analysis" }
  ],
  valuation: [
    { form: "10-Q", section: "Financial Statements" },
    { form: "10-K", section: "Item 7 — MD&A (liquidity)" }
  ],
  "earnings-call": [
    { form: "8-K", section: "Item 2.02 — Results of Operations" }
  ],
  quiz: [{ form: "10-K", section: "Aggregate (cross-section)" }]
};

export const PILLAR_SEC_MAP: PillarSecMap = {
  business: ["10-K"],
  forces: ["10-K"],
  financials: ["10-Q", "10-K", "8-K"],
  management: ["DEF 14A", "10-K"]
};
