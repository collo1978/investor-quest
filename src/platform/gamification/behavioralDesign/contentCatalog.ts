import type {
  FoggFactorId,
  HookStageId,
  OctalysisDriveId,
  SdtNeedId
} from "@/platform/gamification/behavioralDesign/types";

export const OCTALYSIS_DRIVES: Array<{
  id: OctalysisDriveId;
  label: string;
  purpose: string;
  hat: "white" | "black" | "neutral";
  brain: "left" | "right" | "both";
  motivation: "intrinsic" | "extrinsic" | "mixed";
  presentInProduct: string[];
  missingOpportunities: string[];
}> = [
  {
    id: "epic_meaning",
    label: "Epic Meaning & Calling",
    purpose: "User feels part of something bigger.",
    hat: "white",
    brain: "right",
    motivation: "intrinsic",
    presentInProduct: [
      "Become a confident long-term investor narrative",
      "Rising above hype / FOMO framing in copy",
      "Quest map as an investor journey"
    ],
    missingOpportunities: [
      "Mission statement on profile",
      "Cohort / class shared purpose banners"
    ]
  },
  {
    id: "accomplishment",
    label: "Development & Accomplishment",
    purpose: "Progress, mastery, achievement.",
    hat: "white",
    brain: "left",
    motivation: "extrinsic",
    presentInProduct: [
      "XP and investor level ladder",
      "Badges (e.g. 10-K Rookie)",
      "Quest completion and pillar completion",
      "Progress bars on reading and conviction"
    ],
    missingOpportunities: [
      "Mastery paths per sector",
      "Visible skill trees beyond XP"
    ]
  },
  {
    id: "empowerment",
    label: "Empowerment of Creativity & Feedback",
    purpose: "Agency, choices, feedback loops.",
    hat: "white",
    brain: "right",
    motivation: "intrinsic",
    presentInProduct: [
      "Conviction choices",
      "Company selection and quest choice",
      "Quiz feedback and plain-English explanations"
    ],
    missingOpportunities: [
      "Compare-two-companies creative exercises",
      "Player notes on cards"
    ]
  },
  {
    id: "ownership",
    label: "Ownership & Possession",
    purpose: "Ownership over progress, identity, status.",
    hat: "neutral",
    brain: "left",
    motivation: "extrinsic",
    presentInProduct: [
      "Profile with badges and stats",
      "Saved progress (local + server answers)",
      "Sector strength and company mastery signals",
      "Investor armor (planned / partial)"
    ],
    missingOpportunities: [
      "Full investor armor customization",
      "Exportable progress portfolio"
    ]
  },
  {
    id: "social",
    label: "Social Influence & Relatedness",
    purpose: "Community, comparison, belonging.",
    hat: "neutral",
    brain: "right",
    motivation: "intrinsic",
    presentInProduct: [
      "Leaderboard route (placeholder)",
      "Partner org contexts (school / broker)"
    ],
    missingOpportunities: [
      "Live leaderboards",
      "Class challenges",
      "Peer comparison with privacy controls"
    ]
  },
  {
    id: "scarcity",
    label: "Scarcity & Impatience",
    purpose: "Locked, gated, or delayed content.",
    hat: "black",
    brain: "left",
    motivation: "extrinsic",
    presentInProduct: [
      "Locked islands and bridge unlocks",
      "Gated valuation / advanced quests",
      "Quest prerequisites"
    ],
    missingOpportunities: [
      "Time-limited research drops",
      "Seasonal exclusive badges"
    ]
  },
  {
    id: "unpredictability",
    label: "Unpredictability & Curiosity",
    purpose: "Surprise, discovery, mystery.",
    hat: "black",
    brain: "right",
    motivation: "intrinsic",
    presentInProduct: [
      "Onboarding game-show style board",
      "Mystery / reveal moments in quests",
      "Surprise insights in generated copy"
    ],
    missingOpportunities: [
      "Random daily insight cards",
      "Hidden opportunity / risk reveals on map"
    ]
  },
  {
    id: "loss_avoidance",
    label: "Loss & Avoidance",
    purpose: "Avoid losing progress, streaks, or status.",
    hat: "black",
    brain: "left",
    motivation: "mixed",
    presentInProduct: [
      "Streak tracking",
      "Incomplete-understanding warnings (quality gates)",
      "Hype-trap framing in learning copy"
    ],
    missingOpportunities: [
      "Streak protection / freeze",
      "Loss-aversion nudges for abandoned quests"
    ]
  }
];

export const HOOK_STAGES: Array<{
  id: HookStageId;
  label: string;
  presentInProduct: string[];
  missingOpportunities: string[];
}> = [
  {
    id: "trigger",
    label: "Trigger",
    presentInProduct: [
      "Onboarding prompt",
      "Map quest nodes as visual cues",
      "Unlock bridge / island notifications (light)"
    ],
    missingOpportunities: [
      "Quest reminder emails/push",
      "Streak reminder",
      "New report available alerts"
    ]
  },
  {
    id: "action",
    label: "Action",
    presentInProduct: [
      "Start quest from map",
      "Mark card as read",
      "Answer quiz",
      "Set conviction level",
      "View profile progress"
    ],
    missingOpportunities: [
      "One-tap resume last quest",
      "Shorter micro-actions on mobile home"
    ]
  },
  {
    id: "variable_reward",
    label: "Variable Reward",
    presentInProduct: [
      "XP gained on completion",
      "Badge unlock toasts",
      "Progress animations",
      "New island / quest reveal"
    ],
    missingOpportunities: [
      "More unpredictable insight reveals",
      "Variable bonus XP events"
    ]
  },
  {
    id: "investment",
    label: "Investment",
    presentInProduct: [
      "Saved progress",
      "Badges earned",
      "Company mastery",
      "Conviction history",
      "Profile identity"
    ],
    missingOpportunities: [
      "Investor armor build-out",
      "Cross-session study notes"
    ]
  }
];

export const SDT_NEEDS: Array<{
  id: SdtNeedId;
  label: string;
  presentInProduct: string[];
  missingOpportunities: string[];
}> = [
  {
    id: "autonomy",
    label: "Autonomy",
    presentInProduct: [
      "Choose companies",
      "Choose quests / pillars",
      "Conviction decisions",
      "Non-linear map exploration (within gates)"
    ],
    missingOpportunities: [
      "Custom learning path builder",
      "Skip-ahead for advanced students with guardrails"
    ]
  },
  {
    id: "competence",
    label: "Competence",
    presentInProduct: [
      "XP and levels",
      "Quiz feedback",
      "Badge progression",
      "Plain-English explanations",
      "Pillar completion signals"
    ],
    missingOpportunities: [
      "Competence rubric on profile",
      "Before/after understanding self-check"
    ]
  },
  {
    id: "relatedness",
    label: "Relatedness",
    presentInProduct: [
      "Partner / school context (org-level)",
      "Planned class dashboards"
    ],
    missingOpportunities: [
      "Class challenges",
      "Broker communities",
      "Peer comparison with consent"
    ]
  }
];

export const FOGG_FACTORS: Array<{
  id: FoggFactorId;
  label: string;
  presentInProduct: string[];
  missingOpportunities: string[];
}> = [
  {
    id: "motivation",
    label: "Motivation",
    presentInProduct: [
      "Investor identity via levels/badges",
      "Hype-trap / confidence narrative",
      "Visible progress toward mastery"
    ],
    missingOpportunities: [
      "Personal goal setting on profile",
      "Why-this-matters prompts on every card"
    ]
  },
  {
    id: "ability",
    label: "Ability / Simplicity",
    presentInProduct: [
      "Short cards",
      "Plain English answers",
      "Clear Next / Quiz CTAs",
      "Mobile-first touch targets (target)"
    ],
    missingOpportunities: [
      "Simplified onboarding fork",
      "Guided mode for first-time students"
    ]
  },
  {
    id: "prompt",
    label: "Prompt",
    presentInProduct: [
      "Glowing next quest on map (partial)",
      "CTA buttons on quest pager",
      "Unlock prompts on bridges"
    ],
    missingOpportunities: [
      "Mission messages when idle",
      "Contextual progress reminders"
    ]
  }
];
