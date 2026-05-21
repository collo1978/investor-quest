import type { ModuleId } from "@/platform/types";

export const MODULE_CATALOG: Record<
  ModuleId,
  { label: string; description: string }
> = {
  core_quests: {
    label: "Core quests",
    description: "Company-linked research journeys"
  },
  pillar_map: {
    label: "Pillar map",
    description: "Cinematic map + pillar navigation"
  },
  sec_filings_lab: {
    label: "SEC filings lab",
    description: "Filing-driven learning modules"
  },
  conviction_tracker: {
    label: "Conviction tracker",
    description: "Scoring queue + conviction UX"
  },
  leaderboards: {
    label: "Leaderboards",
    description: "Ranked engagement surfaces"
  },
  certificates: {
    label: "Certificates",
    description: "Issuance + verification (planned)"
  },
  broker_rewards: {
    label: "Broker rewards",
    description: "Incentive ledger + fulfillment hooks"
  },
  team_dashboards: {
    label: "Team / class dashboards",
    description: "Cohort analytics for instructors / managers"
  },
  referrals: {
    label: "Referrals",
    description: "Growth + reward attribution"
  },
  api_integrations: {
    label: "API & integrations",
    description: "Outbound webhooks + REST"
  }
};
