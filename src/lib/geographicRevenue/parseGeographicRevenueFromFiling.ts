import { buildGeographicInvestorInsight } from "@/lib/geographicRevenue/buildGeographicInvestorInsight";
import {
  CANONICAL_REGION_LABELS,
  normalizeRegionKey
} from "@/lib/geographicRevenue/normalizeRegionKey";
import type { GeographicRevenueSegment } from "@/lib/geographicRevenue/types";

export type ParsedGeographicRevenue = {
  segments: GeographicRevenueSegment[];
  investorInsight: string | null;
  fiscalYear: number | null;
};

type RegionDef = {
  key: string;
  label: string;
  search: RegExp;
};

const REGION_DEFS: readonly RegionDef[] = [
  { key: "americas", label: "Americas", search: /\bAmericas\b/i },
  { key: "europe", label: "Europe", search: /\bEurope\b/i },
  {
    key: "greater_china",
    label: "Greater China",
    search: /\bGreater\s+China\b/i
  },
  { key: "japan", label: "Japan", search: /\bJapan\b/i },
  {
    key: "rest_of_asia_pacific",
    label: "Rest of Asia Pacific",
    search: /\bRest\s+of\s+Asia\s+Pacific\b/i
  }
];

const GEO_WINDOW_MARKERS =
  /net\s+sales\s+by\s+(?:reportable\s+)?segment|sales\s+by\s+geograph|geographic\s+areas?|revenue\s+by\s+geograph|operating\s+segments?/i;

function parseDollars(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "").trim();
  const m = cleaned.match(/(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function narrowToGeographicWindow(text: string): string {
  const marker = text.search(GEO_WINDOW_MARKERS);
  if (marker < 0) return text.slice(0, 120_000);
  const start = Math.max(0, marker - 800);
  const end = Math.min(text.length, marker + 24_000);
  return text.slice(start, end);
}

function detectRevenueUnitMultiplier(window: string): number {
  if (
    /\(\s*in\s+millions\s*\)/i.test(window) ||
    /\bin\s+millions\b/i.test(window) ||
    /\(dollars?\s+in\s+millions\)/i.test(window)
  ) {
    return 1_000_000;
  }
  if (/\bin\s+billions\b/i.test(window)) return 1_000_000_000;
  return 1;
}

function extractFiscalYear(text: string): number | null {
  const years = [...text.matchAll(/\b(20\d{2})\b/g)].map((m) => Number(m[1]));
  const recent = years.filter((y) => y >= 2015 && y <= 2035);
  if (!recent.length) return null;
  return Math.max(...recent);
}

function parsePercentLines(window: string): Map<string, { percent: number }> {
  const found = new Map<string, { percent: number }>();
  const lineRe =
    /(Americas|Europe|Greater\s+China|Japan|Rest\s+of\s+Asia\s+Pacific)[^\n]{0,80}?(\d{1,2}(?:\.\d+)?)\s*%/gi;

  let m: RegExpExecArray | null;
  while ((m = lineRe.exec(window)) !== null) {
    const label = m[1].trim();
    const key = normalizeRegionKey(label);
    const percent = Number(m[2]);
    if (!Number.isFinite(percent) || percent <= 0 || percent > 100) continue;
    found.set(key, { percent });
  }
  return found;
}

function parseRevenueLines(window: string): Map<string, { revenueUsd: number }> {
  const found = new Map<string, { revenueUsd: number }>();
  const unitMult = detectRevenueUnitMultiplier(window);

  for (const def of REGION_DEFS) {
    const amountRe = new RegExp(
      `${def.search.source}[^\\n$]{0,140}?\\$\\s*([\\d,]+(?:\\.\\d+)?)`,
      "i"
    );
    const m = window.match(amountRe);
    if (!m?.[1]) continue;
    const raw = parseDollars(m[1]);
    if (raw == null) continue;
    let revenueUsd = unitMult > 1 ? raw * unitMult : raw;
    if (unitMult === 1 && raw < 10_000) {
      revenueUsd = raw * 1_000_000;
    }
    found.set(def.key, { revenueUsd: Math.round(revenueUsd) });
  }

  return found;
}

function mergeSegments(
  percents: Map<string, { percent: number }>,
  revenues: Map<string, { revenueUsd: number }>
): GeographicRevenueSegment[] {
  const keys = new Set([...percents.keys(), ...revenues.keys()]);
  const raw: GeographicRevenueSegment[] = [];

  for (const key of keys) {
    const label = CANONICAL_REGION_LABELS[key] ?? key;
    const pct = percents.get(key)?.percent;
    const rev = revenues.get(key)?.revenueUsd;
    if (pct == null && rev == null) continue;
    const percent = pct ?? 0;
    raw.push({
      regionKey: key,
      label,
      percent,
      percentage: percent,
      revenueUsd: rev ?? null
    });
  }

  const withRevenue = raw.filter((s) => s.revenueUsd != null && s.revenueUsd > 0);
  if (withRevenue.length >= 2) {
    const total = withRevenue.reduce((sum, s) => sum + (s.revenueUsd ?? 0), 0);
    if (total > 0) {
      return withRevenue
        .map((s) => {
          const percent = Math.round(((s.revenueUsd ?? 0) / total) * 1000) / 10;
          return { ...s, percent, percentage: percent };
        })
        .sort((a, b) => b.percent - a.percent);
    }
  }

  const withPct = raw.filter((s) => s.percent > 0);
  if (withPct.length >= 2) {
    const totalPct = withPct.reduce((sum, s) => sum + s.percent, 0);
    if (totalPct > 80 && totalPct < 120) {
      return withPct
        .map((s) => {
          const percent = Math.round((s.percent / totalPct) * 1000) / 10;
          return { ...s, percent, percentage: percent };
        })
        .sort((a, b) => b.percent - a.percent);
    }
    return withPct.sort((a, b) => b.percent - a.percent);
  }

  return [];
}

/**
 * Parse region-level revenue from 10-K Item 8 / MD&A geographic tables.
 * Returns empty segments when the filing does not disclose geographic revenue.
 */
export function parseGeographicRevenueFromFiling(
  text: string,
  companyName?: string
): ParsedGeographicRevenue {
  const window = narrowToGeographicWindow(text);
  const percents = parsePercentLines(window);
  const revenues = parseRevenueLines(window);
  const segments = mergeSegments(percents, revenues);

  return {
    segments,
    fiscalYear: extractFiscalYear(window),
    investorInsight:
      segments.length >= 2
        ? buildGeographicInvestorInsight(segments, companyName)
        : null
  };
}
