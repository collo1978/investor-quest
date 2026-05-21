import type { GeographicRevenueSegment } from "@/lib/geographicRevenue/types";

/** Rule-based insight from parsed geographic segments (no LLM). */
export function buildGeographicInvestorInsight(
  segments: readonly GeographicRevenueSegment[],
  companyName?: string
): string | null {
  if (segments.length < 2) return null;

  const name = companyName?.trim() || "This company";
  const sorted = [...segments].sort((a, b) => b.percent - a.percent);
  const top = sorted[0];
  const china = sorted.find((s) => s.regionKey === "greater_china");
  const international = sorted
    .filter((s) => s.regionKey !== "americas")
    .reduce((sum, s) => sum + s.percent, 0);

  const parts: string[] = [];

  if (top.percent >= 38) {
    parts.push(
      `${name} earns the largest share of revenue from ${top.label} (${Math.round(top.percent)}%).`
    );
  } else if (international >= 55) {
    parts.push(`${name} has broad global exposure across multiple regions.`);
  }

  if (china && china.percent >= 12) {
    parts.push(
      `${china.label} remains an important region to watch for demand and headline risk.`
    );
  } else if (parts.length === 0) {
    parts.push(
      `${name} spreads revenue across ${sorted.length} major regions — no single market dominates the mix.`
    );
  }

  return parts.join(" ");
}
