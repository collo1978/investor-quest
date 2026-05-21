import { NextResponse } from "next/server";
import type { AnalyticsDashboardFilters } from "@/lib/analytics/types";
import { fetchGrowthAnalytics } from "@/lib/supabase/analytics/growthRepository";

/**
 * Platform growth metrics — SaaS health + investor reporting.
 * TODO: Stripe MRR correlation · seat utilization · churn prediction
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filters: AnalyticsDashboardFilters = {
      partnerId: searchParams.get("partnerId") ?? "all",
      companyTicker: searchParams.get("companyTicker") ?? "all",
      pillar: searchParams.get("pillar") ?? "all",
      eventType: searchParams.get("eventType") ?? "all",
      dateRange:
        (searchParams.get("dateRange") as AnalyticsDashboardFilters["dateRange"]) ??
        "30d"
    };

    const payload = await fetchGrowthAnalytics(filters);
    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Growth analytics load failed."
      },
      { status: 500 }
    );
  }
}
