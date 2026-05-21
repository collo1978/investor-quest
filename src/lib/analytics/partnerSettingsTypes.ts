import type { AnalyticsFeatureFlags, AnalyticsTierId } from "@/lib/analytics/tiers";

export type PartnerAnalyticsSettingsRow = {
  id: string;
  partner_id: string;
  partner_name: string;
  analytics_tier: AnalyticsTierId;
  created_at: string;
} & AnalyticsFeatureFlags;

export type PartnerAnalyticsSettingsDto = {
  id: string;
  partnerId: string;
  partnerName: string;
  analyticsTier: AnalyticsTierId;
  flags: AnalyticsFeatureFlags;
  createdAt: string;
};

export type PartnerAnalyticsSettingsUpdate = {
  partnerName?: string;
  analyticsTier?: AnalyticsTierId;
  flags?: Partial<AnalyticsFeatureFlags>;
};
