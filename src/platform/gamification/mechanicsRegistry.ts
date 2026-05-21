import type { PartnerType } from "@/platform/types";

export type MechanicRolloutStatus = "active" | "missing" | "planned";

export type MechanicCategory =
  | "xp"
  | "progression"
  | "rewards"
  | "social"
  | "learning"
  | "retention";

export type MechanicPriority = "low" | "medium" | "high";

export type GamificationMechanicDefinition = {
  id: string;
  name: string;
  description: string;
  rolloutStatus: MechanicRolloutStatus;
  category: MechanicCategory;
  /** Partner org types where this mechanic is a strong fit */
  partnerFit: PartnerType[];
  priority: MechanicPriority;
  notes: string;
  /** Keys into XP economy config (server) — not numeric literals */
  xpEconomyKey?: string;
  /** Policy / engine unlock descriptor id */
  unlockConditionKey?: string;
};

export const GAMIFICATION_MECHANICS: GamificationMechanicDefinition[] = [
  {
    id: "xp_system",
    name: "XP system",
    description:
      "Experience points for engagement — quizzes, quests, streak milestones.",
    rolloutStatus: "active",
    category: "xp",
    partnerFit: ["school", "bank", "broker"],
    priority: "high",
    notes: "Backed by `@/engine` XP economy; values live in policy, not pages.",
    xpEconomyKey: "core_xp_table",
    unlockConditionKey: "always_on"
  },
  {
    id: "level_ladder",
    name: "Investor level ladder",
    description: "Discrete levels derived from cumulative XP bands.",
    rolloutStatus: "active",
    category: "progression",
    partnerFit: ["school", "bank", "broker"],
    priority: "high",
    notes: "Uses `computeLevel` / level bands in engine.",
    xpEconomyKey: "level_curve_v1",
    unlockConditionKey: "xp_thresholds"
  },
  {
    id: "badges",
    name: "Badges",
    description: "Achievement badges emitted by reducer + toast surfacing.",
    rolloutStatus: "active",
    category: "rewards",
    partnerFit: ["school", "bank", "broker"],
    priority: "medium",
    notes: "Badge registry in engine; partner package can hide categories.",
    unlockConditionKey: "badge_rules_v1"
  },
  {
    id: "quests",
    name: "Quests",
    description: "Pillar-linked research quests with SEC-aware cards.",
    rolloutStatus: "active",
    category: "learning",
    partnerFit: ["school", "bank", "broker"],
    priority: "high",
    notes: "Quest library under `@/data/quests`.",
    xpEconomyKey: "quest_completion_xp"
  },
  {
    id: "mini_quests",
    name: "Mini-quests",
    description: "Shorter scoped tasks inside a pillar journey.",
    rolloutStatus: "planned",
    category: "learning",
    partnerFit: ["school", "broker"],
    priority: "medium",
    notes: "Differentiate from full quests in content model — schema TBD.",
    xpEconomyKey: "mini_quest_xp_optional"
  },
  {
    id: "pillar_completion",
    name: "Pillar completion",
    description: "Island / pillar cleared when all pillar quizzes pass.",
    rolloutStatus: "active",
    category: "progression",
    partnerFit: ["school", "bank", "broker"],
    priority: "high",
    notes: "Drives map unlock visuals + `isPillarComplete`.",
    xpEconomyKey: "pillar_completion_bonus",
    unlockConditionKey: "all_quizzes_passed"
  },
  {
    id: "progress_bars",
    name: "Progress bars",
    description: "Reading %, XP level bar, conviction queue progress UI.",
    rolloutStatus: "active",
    category: "progression",
    partnerFit: ["school", "bank", "broker"],
    priority: "medium",
    notes: "Component-level; theming from partner brand tokens.",
    unlockConditionKey: "always_on"
  },
  {
    id: "streaks",
    name: "Streaks",
    description: "Quiz streak + research consistency streak tracking.",
    rolloutStatus: "active",
    category: "retention",
    partnerFit: ["school", "broker"],
    priority: "high",
    notes: "Implemented in engine streaks; show/hide via partner policy.",
    xpEconomyKey: "streak_milestone_xp",
    unlockConditionKey: "daily_activity"
  },
  {
    id: "quizzes",
    name: "Quizzes",
    description: "Section quizzes + Ten-K style assessments.",
    rolloutStatus: "active",
    category: "learning",
    partnerFit: ["school", "bank", "broker"],
    priority: "high",
    notes: "Scores stored per company progression; analytics events planned.",
    xpEconomyKey: "quiz_completion_xp",
    unlockConditionKey: "quest_section_unlocked"
  },
  {
    id: "rewards",
    name: "Reward events",
    description: "Reducer-emitted rewards (XP bursts, unlocks) as toasts/FX.",
    rolloutStatus: "active",
    category: "rewards",
    partnerFit: ["school", "bank", "broker"],
    priority: "medium",
    notes: "RewardEvent pipeline in GameProvider.",
    xpEconomyKey: "reward_event_table"
  },
  {
    id: "broker_rewards",
    name: "Broker rewards",
    description: "Broker-specific incentives (statement credits, merch, etc.).",
    rolloutStatus: "planned",
    category: "rewards",
    partnerFit: ["broker"],
    priority: "high",
    notes: "Policy flag `brokerRewardsAccess`; fulfillment out-of-band.",
    unlockConditionKey: "package_tier_pro_plus"
  },
  {
    id: "unlocks",
    name: "Feature / pillar unlocks",
    description: "Progression-gated islands, modules, conviction queue.",
    rolloutStatus: "active",
    category: "progression",
    partnerFit: ["school", "bank", "broker"],
    priority: "high",
    notes: "`applyPillarUnlock` + map reactor gating.",
    unlockConditionKey: "pillar_prereq_tree"
  },
  {
    id: "profile_stats",
    name: "User profile stats",
    description: "XP, badges, streaks, companies surfaced on profile routes.",
    rolloutStatus: "active",
    category: "progression",
    partnerFit: ["school", "bank", "broker"],
    priority: "medium",
    notes: "Profile pages read engine state via hooks.",
    unlockConditionKey: "always_on"
  },
  {
    id: "company_badges",
    name: "Company-specific badges",
    description: "Badges scoped to ticker / campaign milestones.",
    rolloutStatus: "planned",
    category: "rewards",
    partnerFit: ["broker", "bank"],
    priority: "medium",
    notes: "Extend badge detector with company dimension.",
    unlockConditionKey: "company_milestone_rules"
  },
  {
    id: "investor_titles",
    name: "Investor level titles",
    description: "Flavor titles per level band (cosmetic, partner-localizable).",
    rolloutStatus: "planned",
    category: "progression",
    partnerFit: ["broker", "school"],
    priority: "low",
    notes: "Copy deck + mapping table per partner.",
    unlockConditionKey: "level_band_mapping"
  },
  {
    id: "completion_pct",
    name: "Completion percentage",
    description: "Aggregate completion % across pillars / quests.",
    rolloutStatus: "active",
    category: "progression",
    partnerFit: ["school", "bank", "broker"],
    priority: "medium",
    notes: "Derived metrics; expose to analytics pipeline.",
    unlockConditionKey: "always_on"
  },
  {
    id: "conviction_tracker",
    name: "Conviction tracker",
    description: "Queue + scoring for conviction items per company.",
    rolloutStatus: "active",
    category: "learning",
    partnerFit: ["bank", "broker"],
    priority: "high",
    notes: "Module flag `conviction_tracker`; partner can disable.",
    unlockConditionKey: "module_enabled"
  },
  {
    id: "leaderboards",
    name: "Leaderboards",
    description: "Ranked lists — conviction leaderboard placeholder live.",
    rolloutStatus: "planned",
    category: "social",
    partnerFit: ["school", "broker"],
    priority: "medium",
    notes: "Route exists; multi-tenant scoping + privacy layer pending.",
    unlockConditionKey: "module_leaderboards"
  },
  {
    id: "certificates",
    name: "Certificates",
    description: "PDF / shareable certificates for programs or milestones.",
    rolloutStatus: "missing",
    category: "rewards",
    partnerFit: ["school", "bank"],
    priority: "medium",
    notes: "Placeholder cards only — issuance service not wired.",
    unlockConditionKey: "module_certificates"
  },
  {
    id: "class_team_dashboards",
    name: "Class / team dashboards",
    description: "Cohort views for instructors or branch managers.",
    rolloutStatus: "planned",
    category: "social",
    partnerFit: ["school", "bank"],
    priority: "high",
    notes: "Enterprise package flag `team_dashboards`.",
    unlockConditionKey: "package_enterprise"
  },
  {
    id: "referral_rewards",
    name: "Referral rewards",
    description: "Invite flows + reward ledger for growth loops.",
    rolloutStatus: "missing",
    category: "retention",
    partnerFit: ["broker"],
    priority: "medium",
    notes: "Module `referrals` gated off by default.",
    unlockConditionKey: "module_referrals"
  },
  {
    id: "unlockable_content",
    name: "Unlockable content",
    description: "Time-gated or mastery-gated research packs.",
    rolloutStatus: "planned",
    category: "learning",
    partnerFit: ["school", "broker"],
    priority: "medium",
    notes: "Content graph extension — policy-driven gates.",
    unlockConditionKey: "content_graph_v2"
  },
  {
    id: "confidence_tracker",
    name: "Confidence tracker",
    description: "Self-reported or inferred financial confidence trajectory.",
    rolloutStatus: "missing",
    category: "learning",
    partnerFit: ["bank", "school"],
    priority: "high",
    notes: "Distinct from conviction — needs new schema + prompts.",
    unlockConditionKey: "research_not_started"
  },
  {
    id: "retention_nudges",
    name: "Retention nudges",
    description: "Smart re-engagement prompts based on idle windows.",
    rolloutStatus: "planned",
    category: "retention",
    partnerFit: ["bank", "broker"],
    priority: "high",
    notes: "Depends on analytics event stream + policy caps.",
    unlockConditionKey: "analytics_advanced_plus"
  },
  {
    id: "retention_tracking",
    name: "Retention / engagement tracking",
    description: "Partner-level DAU/WAU/quest funnel + cohort signals.",
    rolloutStatus: "planned",
    category: "retention",
    partnerFit: ["school", "bank", "broker"],
    priority: "high",
    notes: "Event schema in `@/platform/analytics/eventCatalog`; ingest TBD.",
    unlockConditionKey: "analytics_pipeline_live"
  }
];

export function getMechanicById(
  id: string
): GamificationMechanicDefinition | undefined {
  return GAMIFICATION_MECHANICS.find((m) => m.id === id);
}
