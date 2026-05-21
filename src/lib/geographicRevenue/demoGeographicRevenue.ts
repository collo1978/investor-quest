import type { GeographicRevenueReport } from "@/lib/geographicRevenue/types";

/** Demo geographic revenue for Apple (10-K–style region buckets). */
export const APPLE_DEMO_GEOGRAPHIC_REVENUE: GeographicRevenueReport = {
  ticker: "AAPL",
  fiscalYear: 2024,
  segments: [
    {
      regionKey: "americas",
      label: "Americas",
      percent: 42,
      percentage: 42,
      revenueUsd: null
    },
    {
      regionKey: "europe",
      label: "Europe",
      percent: 25,
      percentage: 25,
      revenueUsd: null
    },
    {
      regionKey: "greater_china",
      label: "Greater China",
      percent: 18,
      percentage: 18,
      revenueUsd: null
    },
    {
      regionKey: "japan",
      label: "Japan",
      percent: 7,
      percentage: 7,
      revenueUsd: null
    },
    {
      regionKey: "rest_of_asia_pacific",
      label: "Rest of Asia Pacific",
      percent: 8,
      percentage: 8,
      revenueUsd: null
    }
  ],
  investorInsight:
    "Apple has broad global exposure, but Greater China remains an important region to watch.",
  sourceForm: "10-K",
  sourceSectionLabel: "Segment Information — Geographic Areas",
  sourceAccession: null
};

export function getDemoGeographicRevenueReport(
  ticker: string
): GeographicRevenueReport | null {
  const symbol = ticker.trim().toUpperCase();
  if (symbol === "AAPL") return APPLE_DEMO_GEOGRAPHIC_REVENUE;
  return null;
}
