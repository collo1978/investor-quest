import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  APPLE_DEMO_GEOGRAPHIC_REVENUE,
  getDemoGeographicRevenueReport
} from "@/lib/geographicRevenue/demoGeographicRevenue";
import type {
  GeographicRevenueReport,
  GeographicRevenueSegment
} from "@/lib/geographicRevenue/types";
type ReportRow = {
  ticker: string;
  fiscal_year: number;
  segments: unknown;
  investor_insight: string | null;
  source_form: string;
  source_section_label: string | null;
  source_accession: string | null;
};

function parseSegments(raw: unknown): GeographicRevenueSegment[] {
  if (!Array.isArray(raw)) return [];
  const segments: GeographicRevenueSegment[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const label =
      typeof o.label === "string"
        ? o.label.trim()
        : typeof o.region === "string"
          ? o.region.trim()
          : "";
    const regionKey =
      typeof o.regionKey === "string"
        ? o.regionKey.trim()
        : label.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const percent = Number(o.percent ?? o.percentage);
    const revenueUsd =
      o.revenueUsd != null
        ? Number(o.revenueUsd)
        : o.revenue != null
          ? Number(o.revenue)
          : null;
    if (!label || !Number.isFinite(percent) || percent < 0) continue;
    segments.push({
      regionKey,
      label,
      percent,
      percentage: percent,
      revenueUsd:
        revenueUsd != null && Number.isFinite(revenueUsd) && revenueUsd > 0
          ? revenueUsd
          : null
    });
  }
  return segments.sort((a, b) => b.percent - a.percent);
}

function mapRow(row: ReportRow): GeographicRevenueReport {
  return {
    ticker: row.ticker,
    fiscalYear: row.fiscal_year,
    segments: parseSegments(row.segments),
    investorInsight: row.investor_insight?.trim() || null,
    sourceForm: row.source_form,
    sourceSectionLabel: row.source_section_label?.trim() || null,
    sourceAccession: row.source_accession?.trim() || null
  };
}

async function fetchReportRow(
  ticker: string
): Promise<GeographicRevenueReport | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("company_geographic_revenue_reports")
    .select(
      "ticker, fiscal_year, segments, investor_insight, source_form, source_section_label"
    )
    .eq("ticker", ticker)
    .order("fiscal_year", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  const report = mapRow(data as ReportRow);
  return report.segments.length > 0 ? report : null;
}

export async function upsertGeographicRevenueReport(params: {
  ticker: string;
  fiscalYear: number;
  segments: GeographicRevenueSegment[];
  investorInsight?: string | null;
  sourceForm?: string;
  sourceSectionLabel?: string | null;
  accessionNumber?: string | null;
}): Promise<void> {
  if (!isSupabaseConfigured() || params.segments.length < 2) return;

  const supabase = await createSupabaseServerClient();
  const segmentsJson = params.segments.map((s) => ({
    regionKey: s.regionKey,
    label: s.label,
    region: s.label,
    percent: s.percent,
    percentage: s.percent,
    revenueUsd: s.revenueUsd ?? null,
    revenue: s.revenueUsd ?? null
  }));

  await supabase.from("company_geographic_revenue_reports").upsert(
    {
      ticker: params.ticker.trim().toUpperCase(),
      fiscal_year: params.fiscalYear,
      segments: segmentsJson,
      investor_insight: params.investorInsight?.trim() || null,
      source_form: params.sourceForm ?? "10-K",
      source_section_label: params.sourceSectionLabel ?? null,
      source_accession: params.accessionNumber ?? null,
      updated_at: new Date().toISOString()
    },
    { onConflict: "ticker,fiscal_year" }
  );
}

/** Persist Apple demo geographic revenue when the table exists but has no row. */
export async function seedAppleDemoGeographicRevenue(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await upsertGeographicRevenueReport({
    ticker: APPLE_DEMO_GEOGRAPHIC_REVENUE.ticker,
    fiscalYear: APPLE_DEMO_GEOGRAPHIC_REVENUE.fiscalYear,
    segments: APPLE_DEMO_GEOGRAPHIC_REVENUE.segments,
    investorInsight: APPLE_DEMO_GEOGRAPHIC_REVENUE.investorInsight,
    sourceForm: APPLE_DEMO_GEOGRAPHIC_REVENUE.sourceForm,
    sourceSectionLabel: APPLE_DEMO_GEOGRAPHIC_REVENUE.sourceSectionLabel
  });
}

/**
 * Latest geographic revenue for a ticker.
 * Read path: Supabase row → bundled demo. Filing parse runs only in the SEC extraction pipeline.
 */
export async function fetchGeographicRevenueReport(
  ticker: string
): Promise<GeographicRevenueReport | null> {
  const normalized = ticker.trim().toUpperCase();
  if (!normalized) return null;

  if (isSupabaseConfigured()) {
    const report = await fetchReportRow(normalized);
    if (report) return report;
  }

  return getDemoGeographicRevenueReport(normalized);
}
