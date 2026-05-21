import { NextResponse } from "next/server";
import { ADMIN_FULL_ACCESS_FLAGS, TIER_PRESETS } from "@/lib/analytics/tiers";
import type { AnalyticsDashboardFilters } from "@/lib/analytics/types";
import { fetchAnalyticsDashboard } from "@/lib/supabase/analytics/analyticsRepository";
import { getPartnerAnalyticsSettings } from "@/lib/supabase/analytics/partnerSettingsRepository";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const partnerId = searchParams.get("partnerId") ?? "all";
    const viewMode = searchParams.get("viewMode") ?? "client";

    const filters: AnalyticsDashboardFilters = {
      partnerId,
      companyTicker: searchParams.get("companyTicker") ?? "all",
      pillar: searchParams.get("pillar") ?? "all",
      eventType: searchParams.get("eventType") ?? "all",
      dateRange:
        (searchParams.get("dateRange") as AnalyticsDashboardFilters["dateRange"]) ??
        "30d"
    };

    const payload = await fetchAnalyticsDashboard(filters);

    if (partnerId === "all") {
      const features =
        viewMode === "admin"
          ? ADMIN_FULL_ACCESS_FLAGS
          : TIER_PRESETS.basic;
      return NextResponse.json({
        ...payload,
        features,
        partnerTier: viewMode === "admin" ? "enterprise" : "basic",
        partnerName: null
      });
    }

    const settings = await getPartnerAnalyticsSettings(partnerId);
    return NextResponse.json({
      ...payload,
      features: settings.flags,
      partnerTier: settings.analyticsTier,
      partnerName: settings.partnerName
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Analytics load failed."
      },
      { status: 500 }
    );
  }
}
