/** Row shapes returned from Supabase partner/licence tables. */

export type PackageTierRow = {
  id: string;
  display_name: string;
  max_users: number;
  enabled_module_ids: unknown;
  enabled_dashboards: unknown;
  allowed_gamification_mechanic_ids: unknown;
  analytics_access_level: string;
  data_export_access: string;
  broker_rewards_access: boolean;
  custom_branding_access: boolean;
  api_integration_access: string;
};

export type PartnerRow = {
  id: string;
  type: string;
};

export type PartnerBrandingRow = {
  partner_id: string;
  partner_name: string;
  logo_url: string;
  color_primary: string;
  color_secondary: string;
  color_accent: string;
  color_surface: string;
  color_text: string;
  tone_preset_id: string;
  wording_deck_id: string;
};

export type LicenceRow = {
  id: string;
  partner_id: string;
  licence_code: string;
  expires_at: string;
  max_seats: number;
  package_tier_id: string;
  dashboard_school: boolean;
  dashboard_bank: boolean;
  dashboard_broker: boolean;
};

export type PartnerPolicyRow = {
  partner_id: string;
  enabled_module_ids: unknown;
  enabled_dashboards: unknown;
  reward_model_id: string;
  allowed_role_ids: unknown;
  gamification_mechanic_ids: unknown;
  analytics_access_level: string;
  data_export_access: string;
  custom_branding_access: boolean;
  broker_rewards_access: boolean;
  api_integration_access: string;
};

/** Nested select from `partners` with related rows. */
export type PartnerWithRelationsRow = PartnerRow & {
  partner_branding: PartnerBrandingRow | PartnerBrandingRow[] | null;
  licences: LicenceRow | LicenceRow[] | null;
  partner_policies: PartnerPolicyRow | PartnerPolicyRow[] | null;
};

export type PartnerCatalogSource = "demo" | "supabase";

export type PartnerCatalogPayload = {
  partners: import("@/platform/types").PartnerConfig[];
  source: PartnerCatalogSource;
};
