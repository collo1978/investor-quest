import type { PillarId } from "@/data/pillars";
import type { FilingKind } from "./types";

/** MVP mapping: pillar island → disclosure weight category. */
export function filingForPillar(pillarId: PillarId): FilingKind {
  switch (pillarId) {
    case "forces":
      return "10-Q";
    case "business":
    case "financials":
    case "management":
      return "10-K";
    default:
      return "10-K";
  }
}
