export type GeographicRevenueRegionKey =
  | "americas"
  | "europe"
  | "greater_china"
  | "japan"
  | "rest_of_asia_pacific"
  | (string & {});

export type GeographicRevenueSegment = {
  regionKey: GeographicRevenueRegionKey;
  /** Display label (e.g. "Americas"). */
  label: string;
  percentage: number;
  /** Alias for templates — same as `percentage`. */
  percent: number;
  /** Net sales / revenue in USD when disclosed in the filing table. */
  revenueUsd?: number | null;
};

export type GeographicRevenueReport = {
  ticker: string;
  fiscalYear: number;
  /** Optional one-line headline above the map. */
  headline?: string | null;
  segments: GeographicRevenueSegment[];
  /** Legacy pipeline field — not shown in the player UI. */
  investorInsight?: string | null;
  sourceForm: string;
  sourceSectionLabel: string | null;
  sourceAccession?: string | null;
};
