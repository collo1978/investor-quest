import type {
  AnalyticsAccessLevel,
  ApiIntegrationAccess,
  DashboardSegment,
  DataExportAccess,
  ModuleId,
  PackageTierDefinition,
  PackageTierId,
  PartnerBranding,
  PartnerConfig,
  PartnerLicence,
  PartnerPolicy,
  PartnerType,
  RewardModelId,
  TonePresetId,
  UserRoleId
} from "@/platform/types";
import type {
  LicenceRow,
  PackageTierRow,
  PartnerBrandingRow,
  PartnerPolicyRow,
  PartnerRow,
  PartnerWithRelationsRow
} from "./types";
import { asStringArray } from "./json";

function first<T>(value: T | T[] | null | undefined): T | undefined {
  if (value == null) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export function mapBranding(row: PartnerBrandingRow): PartnerBranding {
  return {
    partnerName: row.partner_name,
    logoUrl: row.logo_url,
    colors: {
      primary: row.color_primary,
      secondary: row.color_secondary,
      accent: row.color_accent,
      surface: row.color_surface,
      text: row.color_text
    },
    tonePresetId: row.tone_preset_id as TonePresetId,
    wordingDeckId: row.wording_deck_id
  };
}

function mapLicence(row: LicenceRow): PartnerLicence {
  return {
    licenceId: row.licence_code,
    expiresAt: row.expires_at,
    maxSeats: row.max_seats,
    packageTierId: row.package_tier_id as PackageTierId,
    dashboardAccess: {
      school: row.dashboard_school,
      bank: row.dashboard_bank,
      broker: row.dashboard_broker
    }
  };
}

function mapPolicy(row: PartnerPolicyRow): PartnerPolicy {
  return {
    enabledModuleIds: asStringArray(row.enabled_module_ids) as ModuleId[],
    enabledDashboards: asStringArray(row.enabled_dashboards) as DashboardSegment[],
    rewardModelId: row.reward_model_id as RewardModelId,
    allowedRoleIds: asStringArray(row.allowed_role_ids) as UserRoleId[],
    gamificationMechanicIds: asStringArray(row.gamification_mechanic_ids),
    analyticsAccessLevel: row.analytics_access_level as AnalyticsAccessLevel,
    dataExportAccess: row.data_export_access as DataExportAccess,
    customBrandingAccess: row.custom_branding_access,
    brokerRewardsAccess: row.broker_rewards_access,
    apiIntegrationAccess: row.api_integration_access as ApiIntegrationAccess
  };
}

export function mapPartnerWithRelations(row: PartnerWithRelationsRow): PartnerConfig | null {
  const brandingRow = first(row.partner_branding);
  const licenceRow = first(row.licences);
  const policyRow = first(row.partner_policies);

  if (!brandingRow || !licenceRow || !policyRow) return null;

  return {
    id: row.id,
    type: row.type as PartnerType,
    branding: mapBranding(brandingRow),
    licence: mapLicence(licenceRow),
    policy: mapPolicy(policyRow)
  };
}

export function mapPackageTierRow(row: PackageTierRow): PackageTierDefinition {
  return {
    id: row.id as PackageTierId,
    displayName: row.display_name,
    maxUsers: row.max_users,
    enabledModuleIds: asStringArray(row.enabled_module_ids) as ModuleId[],
    enabledDashboards: asStringArray(row.enabled_dashboards) as DashboardSegment[],
    allowedGamificationMechanicIds: asStringArray(
      row.allowed_gamification_mechanic_ids
    ),
    analyticsAccessLevel: row.analytics_access_level as AnalyticsAccessLevel,
    dataExportAccess: row.data_export_access as DataExportAccess,
    brokerRewardsAccess: row.broker_rewards_access,
    customBrandingAccess: row.custom_branding_access,
    apiIntegrationAccess: row.api_integration_access as ApiIntegrationAccess
  };
}

export function mapPartnerRows(
  partner: PartnerRow,
  branding: PartnerBrandingRow,
  licence: LicenceRow,
  policy: PartnerPolicyRow
): PartnerConfig {
  return {
    id: partner.id,
    type: partner.type as PartnerType,
    branding: mapBranding(branding),
    licence: mapLicence(licence),
    policy: mapPolicy(policy)
  };
}
