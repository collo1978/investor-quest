/**
 * Partner / licence / package types — backend-ready contracts.
 * UI reads through getters + registry; do not inline limits in pages.
 */

export type PartnerType = "school" | "bank" | "broker";

export type DashboardSegment = "school" | "bank" | "broker";

export type PackageTierId = "basic" | "pro" | "enterprise";

export type AnalyticsAccessLevel = "none" | "standard" | "advanced" | "full";

export type DataExportAccess = "none" | "csv_basic" | "csv_full" | "api_stream";

export type ApiIntegrationAccess = "none" | "read_webhooks" | "full_api";

export type TonePresetId =
  | "mentor_friendly"
  | "professional_neutral"
  | "competitive_broker"
  | "classroom_supportive";

export type RewardModelId =
  | "xp_only"
  | "xp_plus_badges"
  | "broker_incentives"
  | "school_merit";

export type UserRoleId =
  | "learner"
  | "instructor"
  | "branch_admin"
  | "partner_admin"
  | "auditor_readonly";

export type ModuleId =
  | "core_quests"
  | "pillar_map"
  | "sec_filings_lab"
  | "conviction_tracker"
  | "leaderboards"
  | "certificates"
  | "broker_rewards"
  | "team_dashboards"
  | "referrals"
  | "api_integrations";

export type BrandColors = {
  /** CSS hex or rgba strings — applied as CSS variables on partner surfaces */
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  text: string;
};

export type PartnerBranding = {
  partnerName: string;
  /** Public path under /public or absolute CDN URL */
  logoUrl: string;
  colors: BrandColors;
  tonePresetId: TonePresetId;
  /** CMS / policy copy deck id — resolved server-side later */
  wordingDeckId: string;
};

export type PartnerLicence = {
  licenceId: string;
  /** ISO date — partner access ends */
  expiresAt: string;
  maxSeats: number;
  packageTierId: PackageTierId;
  /** Feature: restrict org dashboard entry points */
  dashboardAccess: {
    school: boolean;
    bank: boolean;
    broker: boolean;
  };
};

export type PartnerPolicy = {
  enabledModuleIds: ModuleId[];
  enabledDashboards: DashboardSegment[];
  rewardModelId: RewardModelId;
  allowedRoleIds: UserRoleId[];
  /** Per-mechanic enablement for this org (merged with package + mechanic status) */
  gamificationMechanicIds: string[];
  analyticsAccessLevel: AnalyticsAccessLevel;
  dataExportAccess: DataExportAccess;
  customBrandingAccess: boolean;
  brokerRewardsAccess: boolean;
  apiIntegrationAccess: ApiIntegrationAccess;
};

export type PartnerConfig = {
  id: string;
  type: PartnerType;
  branding: PartnerBranding;
  licence: PartnerLicence;
  policy: PartnerPolicy;
};

/** Package tier matrix — drives entitlements before partner overrides */
export type PackageTierDefinition = {
  id: PackageTierId;
  displayName: string;
  maxUsers: number;
  enabledModuleIds: ModuleId[];
  enabledDashboards: DashboardSegment[];
  /** Mechanic ids allowed at this tier (subset of registry) */
  allowedGamificationMechanicIds: string[];
  analyticsAccessLevel: AnalyticsAccessLevel;
  dataExportAccess: DataExportAccess;
  brokerRewardsAccess: boolean;
  customBrandingAccess: boolean;
  apiIntegrationAccess: ApiIntegrationAccess;
};

export type AnalyticsFilterState = {
  partnerId: string | "all";
  userType: UserRoleId | "all";
  dateRange: "7d" | "30d" | "90d" | "ytd";
  companyId: string | "all";
  sector: string | "all";
  moduleId: ModuleId | "all";
  packageTier: PackageTierId | "all";
};

export type AnalyticsEventName =
  | "login"
  | "session_active_daily"
  | "session_active_monthly"
  | "quest_started"
  | "quest_completed"
  | "xp_earned"
  | "level_up"
  | "badge_unlocked"
  | "quiz_started"
  | "quiz_completed"
  | "quiz_score"
  | "company_researched"
  | "sector_viewed"
  | "module_used"
  | "reward_unlocked"
  | "streak_tick"
  | "retention_signal"
  | "partner_engagement_pulse";

export type AnalyticsAggregateRow = {
  event: AnalyticsEventName;
  count: number;
  /** Optional dimensional slice for demo dashboards */
  dimension?: string;
};
