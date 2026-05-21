import type { ModuleId, PartnerConfig } from "@/platform/types";
import { PACKAGE_TIERS } from "@/platform/packages/packageDefinitions";

const schoolModuleAllowlist: ModuleId[] = [
  "core_quests",
  "pillar_map",
  "sec_filings_lab",
  "leaderboards"
];

const schoolModules = PACKAGE_TIERS.pro.enabledModuleIds.filter((m) =>
  schoolModuleAllowlist.includes(m)
);

const school: PartnerConfig = {
  id: "demo-riverside-academy",
  type: "school",
  branding: {
    partnerName: "Riverside Academy",
    logoUrl: "/screens/quest-map.png",
    colors: {
      primary: "#6366F1",
      secondary: "#22D3EE",
      accent: "#FBBF24",
      surface: "#0B1020",
      text: "#E5E7EB"
    },
    tonePresetId: "classroom_supportive",
    wordingDeckId: "school_default_v1"
  },
  licence: {
    licenceId: "lic-school-demo-001",
    expiresAt: "2027-06-30",
    maxSeats: 400,
    packageTierId: "pro",
    dashboardAccess: { school: true, bank: false, broker: false }
  },
  policy: {
    enabledModuleIds: schoolModules,
    enabledDashboards: ["school"],
    rewardModelId: "school_merit",
    allowedRoleIds: ["learner", "instructor", "partner_admin"],
    gamificationMechanicIds: [
      "xp_system",
      "level_ladder",
      "badges",
      "quests",
      "pillar_completion",
      "progress_bars",
      "streaks",
      "quizzes",
      "profile_stats",
      "completion_pct",
      "leaderboards",
      "certificates"
    ],
    analyticsAccessLevel: "advanced",
    dataExportAccess: "csv_full",
    customBrandingAccess: true,
    brokerRewardsAccess: false,
    apiIntegrationAccess: "read_webhooks"
  }
};

const bank: PartnerConfig = {
  id: "demo-northstar-bank",
  type: "bank",
  branding: {
    partnerName: "Northstar Community Bank",
    logoUrl: "/screens/business-island-screen.png",
    colors: {
      primary: "#1D4ED8",
      secondary: "#38BDF8",
      accent: "#F59E0B",
      surface: "#071018",
      text: "#F1F5F9"
    },
    tonePresetId: "professional_neutral",
    wordingDeckId: "bank_finlit_v1"
  },
  licence: {
    licenceId: "lic-bank-demo-002",
    expiresAt: "2026-12-15",
    maxSeats: 5_000,
    packageTierId: "enterprise",
    dashboardAccess: { school: false, bank: true, broker: false }
  },
  policy: {
    enabledModuleIds: PACKAGE_TIERS.enterprise.enabledModuleIds,
    enabledDashboards: ["bank"],
    rewardModelId: "xp_plus_badges",
    allowedRoleIds: [
      "learner",
      "branch_admin",
      "partner_admin",
      "auditor_readonly"
    ],
    gamificationMechanicIds:
      PACKAGE_TIERS.enterprise.allowedGamificationMechanicIds,
    analyticsAccessLevel: "full",
    dataExportAccess: "api_stream",
    customBrandingAccess: true,
    brokerRewardsAccess: false,
    apiIntegrationAccess: "full_api"
  }
};

const broker: PartnerConfig = {
  id: "demo-apex-clearing",
  type: "broker",
  branding: {
    partnerName: "Apex Online Brokerage",
    logoUrl: "/screens/quest-map.png",
    colors: {
      primary: "#A855F7",
      secondary: "#22C55E",
      accent: "#FACC15",
      surface: "#070712",
      text: "#E4E4E7"
    },
    tonePresetId: "competitive_broker",
    wordingDeckId: "broker_retail_v1"
  },
  licence: {
    licenceId: "lic-broker-demo-003",
    expiresAt: "2028-01-01",
    maxSeats: 25_000,
    packageTierId: "pro",
    dashboardAccess: { school: false, bank: false, broker: true }
  },
  policy: {
    enabledModuleIds: PACKAGE_TIERS.pro.enabledModuleIds,
    enabledDashboards: ["broker"],
    rewardModelId: "broker_incentives",
    allowedRoleIds: ["learner", "partner_admin", "auditor_readonly"],
    gamificationMechanicIds:
      PACKAGE_TIERS.pro.allowedGamificationMechanicIds,
    analyticsAccessLevel: "advanced",
    dataExportAccess: "csv_full",
    customBrandingAccess: true,
    brokerRewardsAccess: true,
    apiIntegrationAccess: "read_webhooks"
  }
};

export const DEMO_PARTNERS: PartnerConfig[] = [school, bank, broker];
