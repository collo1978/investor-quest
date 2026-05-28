import type { FrameworkMetricBinding } from "@/platform/gamification/behavioralDesign/analytics/types";

/** Links framework dimensions → metric catalog ids + future analytics questions */
export const FRAMEWORK_METRIC_BINDINGS: FrameworkMetricBinding[] = [
  // Octalysis drives
  {
    frameworkId: "octalysis",
    dimensionId: "epic_meaning",
    metricIds: ["onboarding_completion_rate", "pillar_completion_rate"],
    analyticsQuestions: [
      "Do users who complete onboarding show higher long-term retention?",
      "Is epic-meaning copy correlated with quest completion depth?"
    ]
  },
  {
    frameworkId: "octalysis",
    dimensionId: "accomplishment",
    metricIds: ["xp_per_active_user", "level_up_velocity", "badge_unlock_velocity", "quest_completion_rate"],
    analyticsQuestions: [
      "Are users driven too heavily by XP vs learning outcomes?",
      "Does accomplishment correlate with quiz pass rate?"
    ]
  },
  {
    frameworkId: "octalysis",
    dimensionId: "empowerment",
    metricIds: ["quiz_pass_rate", "card_read_completion"],
    analyticsQuestions: [
      "Do conviction choices increase return frequency?",
      "Does agency (multi-company exploration) predict retention?"
    ]
  },
  {
    frameworkId: "octalysis",
    dimensionId: "ownership",
    metricIds: ["badge_unlock_velocity", "companies_explored_per_user", "d7_retention"],
    analyticsQuestions: [
      "Does ownership (badges, mastery) increase retention?",
      "Do profile-rich users return more often?"
    ]
  },
  {
    frameworkId: "octalysis",
    dimensionId: "social",
    metricIds: ["dau", "return_frequency_7d"],
    analyticsQuestions: [
      "Will leaderboards / class challenges lift relatedness metrics?",
      "Is social proof missing in first-week cohorts?"
    ]
  },
  {
    frameworkId: "octalysis",
    dimensionId: "scarcity",
    metricIds: ["quest_completion_rate", "map_node_click_rate"],
    analyticsQuestions: [
      "Do gated islands increase or decrease completion?",
      "Is impatience driving drop-off before quiz?"
    ]
  },
  {
    frameworkId: "octalysis",
    dimensionId: "unpredictability",
    metricIds: ["companies_explored_per_user", "map_node_click_rate"],
    analyticsQuestions: [
      "Does curiosity increase exploration breadth?",
      "Do surprise insights correlate with session depth?"
    ]
  },
  {
    frameworkId: "octalysis",
    dimensionId: "loss_avoidance",
    metricIds: ["streak_adoption_rate", "streak_break_rate", "churn_risk_score"],
    analyticsQuestions: [
      "Are black-hat mechanics (streak loss) too dominant?",
      "Does loss framing improve or harm D7 retention?"
    ]
  },

  // Hook stages
  {
    frameworkId: "hook",
    dimensionId: "trigger",
    metricIds: ["return_frequency_7d", "d1_retention", "streak_adoption_rate"],
    analyticsQuestions: [
      "Which triggers bring users back (streak, new quest, email)?",
      "Where do users fail to re-enter after day 1?"
    ]
  },
  {
    frameworkId: "hook",
    dimensionId: "action",
    metricIds: ["quest_completion_rate", "card_read_completion", "cta_ignore_rate"],
    analyticsQuestions: [
      "Is the core action too hard on mobile?",
      "Where do users drop off before quiz?"
    ]
  },
  {
    frameworkId: "hook",
    dimensionId: "variable_reward",
    metricIds: ["badge_unlock_velocity", "xp_per_active_user", "quiz_pass_rate"],
    analyticsQuestions: [
      "Which rewards improve retention?",
      "Are rewards too predictable (flat XP only)?"
    ]
  },
  {
    frameworkId: "hook",
    dimensionId: "investment",
    metricIds: ["d7_retention", "companies_explored_per_user", "pillar_completion_rate"],
    analyticsQuestions: [
      "Are users investing enough in identity/progress?",
      "Does investment depth predict week-2 return?"
    ]
  },

  // SDT needs
  {
    frameworkId: "sdt",
    dimensionId: "autonomy",
    metricIds: ["companies_explored_per_user", "map_node_click_rate"],
    analyticsQuestions: [
      "Are users voluntarily exploring more over time?",
      "Does forced path reduce autonomy signals?"
    ]
  },
  {
    frameworkId: "sdt",
    dimensionId: "competence",
    metricIds: ["quiz_pass_rate", "level_up_velocity", "quest_completion_rate"],
    analyticsQuestions: [
      "Are users becoming more competent (quiz scores improving)?",
      "Is progress clearly explained in analytics cohorts?"
    ]
  },
  {
    frameworkId: "sdt",
    dimensionId: "relatedness",
    metricIds: ["dau", "return_frequency_7d"],
    analyticsQuestions: [
      "Will social systems improve engagement when shipped?",
      "Do cohort programs show higher relatedness proxies?"
    ]
  },

  // Fogg factors
  {
    frameworkId: "fogg",
    dimensionId: "motivation",
    metricIds: ["onboarding_completion_rate", "d1_retention"],
    analyticsQuestions: [
      "Does motivation drop after first pillar?",
      "Which segments show highest intent to return?"
    ]
  },
  {
    frameworkId: "fogg",
    dimensionId: "ability",
    metricIds: ["financials_quest_friction_index", "quiz_dropoff_rate", "avg_session_depth_minutes"],
    analyticsQuestions: [
      "Where is friction highest (financials vs business)?",
      "Which quests are too difficult for beginners?"
    ]
  },
  {
    frameworkId: "fogg",
    dimensionId: "prompt",
    metricIds: ["cta_ignore_rate", "map_node_click_rate", "quest_completion_rate"],
    analyticsQuestions: [
      "Which prompts are ignored?",
      "Are users confused about next actions after card read?"
    ]
  }
];

export const BINDINGS_BY_FRAMEWORK = FRAMEWORK_METRIC_BINDINGS.reduce(
  (acc, b) => {
    const list = acc[b.frameworkId] ?? [];
    list.push(b);
    acc[b.frameworkId] = list;
    return acc;
  },
  {} as Record<"octalysis" | "hook" | "sdt" | "fogg", FrameworkMetricBinding[]>
);
