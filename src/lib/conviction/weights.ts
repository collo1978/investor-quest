import type { FilingKind } from "./types";

export const FILING_WEIGHTS: Record<FilingKind, number> = {
  "10-K": 3,
  "10-Q": 2,
  "Earnings call": 1
};
