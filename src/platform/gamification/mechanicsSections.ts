import type { GamificationMechanicDefinition } from "@/platform/gamification/mechanicsRegistry";

export type MechanicsSectionId =
  | "xp_economy"
  | "investor_levels"
  | "badges"
  | "streaks"
  | "rewards"
  | "conviction_system"
  | "investor_armor"
  | "behavioral_design_audits";

export type MechanicsSectionDefinition = {
  id: MechanicsSectionId;
  label: string;
  description: string;
  /** Registry mechanic ids in this section (ignored for behavioral_design_audits). */
  mechanicIds: string[];
  kind: "mechanics" | "behavioral_audits";
};

export const GAMIFICATION_MECHANICS_SECTIONS: MechanicsSectionDefinition[] = [
  {
    id: "xp_economy",
    label: "XP Economy",
    description: "Experience points, reward tables, and quest XP keys.",
    mechanicIds: ["xp_system", "quizzes", "quests", "mini_quests"],
    kind: "mechanics"
  },
  {
    id: "investor_levels",
    label: "Investor Levels",
    description: "Level ladder, titles, and completion metrics.",
    mechanicIds: [
      "level_ladder",
      "investor_titles",
      "completion_pct",
      "profile_stats",
      "progress_bars"
    ],
    kind: "mechanics"
  },
  {
    id: "badges",
    label: "Badges",
    description: "Achievement badges and company-scoped milestones.",
    mechanicIds: ["badges", "company_badges"],
    kind: "mechanics"
  },
  {
    id: "streaks",
    label: "Streaks",
    description: "Consistency streaks and retention hooks.",
    mechanicIds: ["streaks", "retention_nudges"],
    kind: "mechanics"
  },
  {
    id: "rewards",
    label: "Rewards",
    description: "Reward events, broker rewards, certificates.",
    mechanicIds: ["rewards", "broker_rewards", "certificates", "referral_rewards"],
    kind: "mechanics"
  },
  {
    id: "conviction_system",
    label: "Conviction System",
    description: "Conviction queue, tracker, and learning signals.",
    mechanicIds: ["conviction_tracker", "confidence_tracker"],
    kind: "mechanics"
  },
  {
    id: "investor_armor",
    label: "Investor Armor",
    description: "Identity, sector strength, and visual mastery layer.",
    mechanicIds: ["profile_stats", "pillar_completion", "unlocks", "unlockable_content"],
    kind: "mechanics"
  },
  {
    id: "behavioral_design_audits",
    label: "Behavioral Design Audits",
    description:
      "Octalysis, Hook, SDT, and Fogg audits for motivational balance and habit health.",
    mechanicIds: [],
    kind: "behavioral_audits"
  }
];

export function mechanicsForSection(
  section: MechanicsSectionDefinition,
  all: GamificationMechanicDefinition[]
): GamificationMechanicDefinition[] {
  if (section.kind === "behavioral_audits") return [];
  const idSet = new Set(section.mechanicIds);
  return all.filter((m) => idSet.has(m.id));
}
