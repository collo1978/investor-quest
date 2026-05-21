import type {
  DashboardSegment,
  ModuleId,
  PackageTierDefinition,
  PackageTierId
} from "@/platform/types";

export const PACKAGE_TIER_ORDER: PackageTierId[] = [
  "basic",
  "pro",
  "enterprise"
];

/** Single source of truth for tier entitlements — swap for API later */
export const PACKAGE_TIERS: Record<PackageTierId, PackageTierDefinition> = {
  basic: {
    id: "basic",
    displayName: "Basic",
    maxUsers: 50,
    enabledModuleIds: ["core_quests", "pillar_map"],
    enabledDashboards: ["school"],
    allowedGamificationMechanicIds: [
      "xp_system",
      "level_ladder",
      "quests",
      "progress_bars",
      "pillar_completion",
      "quizzes",
      "streaks"
    ],
    analyticsAccessLevel: "standard",
    dataExportAccess: "csv_basic",
    brokerRewardsAccess: false,
    customBrandingAccess: false,
    apiIntegrationAccess: "none"
  },
  pro: {
    id: "pro",
    displayName: "Pro",
    maxUsers: 500,
    enabledModuleIds: [
      "core_quests",
      "pillar_map",
      "sec_filings_lab",
      "conviction_tracker",
      "leaderboards",
      "broker_rewards"
    ],
    enabledDashboards: ["school", "bank", "broker"],
    allowedGamificationMechanicIds: [
      "xp_system",
      "level_ladder",
      "badges",
      "quests",
      "mini_quests",
      "pillar_completion",
      "progress_bars",
      "streaks",
      "quizzes",
      "rewards",
      "unlocks",
      "profile_stats",
      "company_badges",
      "investor_titles",
      "completion_pct",
      "conviction_tracker",
      "broker_rewards",
      "retention_tracking"
    ],
    analyticsAccessLevel: "advanced",
    dataExportAccess: "csv_full",
    brokerRewardsAccess: true,
    customBrandingAccess: true,
    apiIntegrationAccess: "read_webhooks"
  },
  enterprise: {
    id: "enterprise",
    displayName: "Enterprise",
    maxUsers: 50_000,
    enabledModuleIds: [
      "core_quests",
      "pillar_map",
      "sec_filings_lab",
      "conviction_tracker",
      "leaderboards",
      "certificates",
      "broker_rewards",
      "team_dashboards",
      "referrals",
      "api_integrations"
    ],
    enabledDashboards: ["school", "bank", "broker"],
    allowedGamificationMechanicIds: [
      "xp_system",
      "level_ladder",
      "badges",
      "quests",
      "mini_quests",
      "pillar_completion",
      "progress_bars",
      "streaks",
      "quizzes",
      "rewards",
      "unlocks",
      "profile_stats",
      "company_badges",
      "investor_titles",
      "completion_pct",
      "conviction_tracker",
      "broker_rewards",
      "leaderboards",
      "certificates",
      "class_team_dashboards",
      "referral_rewards",
      "unlockable_content",
      "confidence_tracker",
      "retention_nudges",
      "retention_tracking"
    ],
    analyticsAccessLevel: "full",
    dataExportAccess: "api_stream",
    brokerRewardsAccess: true,
    customBrandingAccess: true,
    apiIntegrationAccess: "full_api"
  }
};

export function getPackageTier(id: PackageTierId): PackageTierDefinition {
  return PACKAGE_TIERS[id];
}

export function moduleAllowedForTier(
  tierId: PackageTierId,
  moduleId: ModuleId
): boolean {
  return PACKAGE_TIERS[tierId].enabledModuleIds.includes(moduleId);
}

export function mechanicAllowedForTier(
  tierId: PackageTierId,
  mechanicId: string
): boolean {
  return PACKAGE_TIERS[tierId].allowedGamificationMechanicIds.includes(
    mechanicId
  );
}
