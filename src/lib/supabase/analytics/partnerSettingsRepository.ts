import {
  TIER_PRESETS,
  type AnalyticsFeatureFlags,
  type AnalyticsTierId
} from "@/lib/analytics/tiers";
import type {
  PartnerAnalyticsSettingsDto,
  PartnerAnalyticsSettingsRow,
  PartnerAnalyticsSettingsUpdate
} from "@/lib/analytics/partnerSettingsTypes";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/serviceClient";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { listPartners } from "@/platform/partners/partnerRegistry";

function rowToDto(row: PartnerAnalyticsSettingsRow): PartnerAnalyticsSettingsDto {
  const flags: AnalyticsFeatureFlags = {
    enable_basic_metrics: row.enable_basic_metrics,
    enable_time_tracking: row.enable_time_tracking,
    enable_retention_tracking: row.enable_retention_tracking,
    enable_behavior_funnels: row.enable_behavior_funnels,
    enable_heatmaps: row.enable_heatmaps,
    enable_ai_insights: row.enable_ai_insights,
    enable_conviction_tracking: row.enable_conviction_tracking,
    enable_company_interest_tracking: row.enable_company_interest_tracking,
    enable_sector_tracking: row.enable_sector_tracking,
    enable_cohort_tracking: row.enable_cohort_tracking,
    enable_school_dashboard: row.enable_school_dashboard,
    enable_broker_dashboard: row.enable_broker_dashboard,
    enable_api_exports: row.enable_api_exports,
    enable_custom_reports: row.enable_custom_reports
  };
  return {
    id: row.id,
    partnerId: row.partner_id,
    partnerName: row.partner_name,
    analyticsTier: row.analytics_tier,
    flags,
    createdAt: row.created_at
  };
}

function defaultTierForPartner(partnerId: string): AnalyticsTierId {
  const p = listPartners().find((x) => x.id === partnerId);
  if (p?.type === "broker") return "enterprise";
  if (p?.type === "bank") return "pro";
  return "basic";
}

function demoRow(partnerId: string, tier?: AnalyticsTierId): PartnerAnalyticsSettingsDto {
  const partner = listPartners().find((p) => p.id === partnerId);
  const analyticsTier = tier ?? defaultTierForPartner(partnerId);
  return {
    id: `demo-${partnerId}`,
    partnerId,
    partnerName: partner?.branding.partnerName ?? partnerId,
    analyticsTier,
    flags: { ...TIER_PRESETS[analyticsTier] },
    createdAt: new Date().toISOString()
  };
}

export async function listPartnerAnalyticsSettings(): Promise<
  PartnerAnalyticsSettingsDto[]
> {
  if (!isSupabaseConfigured()) {
    return listPartners().map((p) => demoRow(p.id));
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("partner_analytics_settings")
    .select("*")
    .order("partner_name", { ascending: true });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as PartnerAnalyticsSettingsRow[];
  const byId = new Map(rows.map((r) => [r.partner_id, rowToDto(r)]));

  return listPartners().map((p) => byId.get(p.id) ?? demoRow(p.id));
}

export async function getPartnerAnalyticsSettings(
  partnerId: string
): Promise<PartnerAnalyticsSettingsDto> {
  if (!isSupabaseConfigured()) {
    return demoRow(partnerId);
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("partner_analytics_settings")
    .select("*")
    .eq("partner_id", partnerId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return demoRow(partnerId);

  return rowToDto(data as PartnerAnalyticsSettingsRow);
}

export async function upsertPartnerAnalyticsSettings(
  partnerId: string,
  update: PartnerAnalyticsSettingsUpdate
): Promise<PartnerAnalyticsSettingsDto> {
  const existing = await getPartnerAnalyticsSettings(partnerId);
  const tier = update.analyticsTier ?? existing.analyticsTier;
  const flags = {
    ...existing.flags,
    ...(update.analyticsTier && !update.flags ? TIER_PRESETS[tier] : {}),
    ...update.flags
  };

  const payload = {
    partner_id: partnerId,
    partner_name: update.partnerName ?? existing.partnerName,
    analytics_tier: tier,
    ...flags
  };

  if (!isSupabaseConfigured()) {
    return {
      ...existing,
      partnerName: payload.partner_name,
      analyticsTier: tier,
      flags
    };
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("partner_analytics_settings")
    .upsert(payload, { onConflict: "partner_id" })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToDto(data as PartnerAnalyticsSettingsRow);
}
