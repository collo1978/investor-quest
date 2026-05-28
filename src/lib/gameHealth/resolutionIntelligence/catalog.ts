import type { AuditCategoryId } from "./types";

export type AuditCategoryTemplate = {
  id: AuditCategoryId;
  label: string;
  defaultWhyItMatters: string;
  defaultRecommendations: Array<{
    action: string;
    rationale: string;
    priority: "high" | "medium" | "low";
  }>;
};

export const AUDIT_CATEGORY_CATALOG: Record<AuditCategoryId, AuditCategoryTemplate> = {
  communication_quality: {
    id: "communication_quality",
    label: "Communication Quality",
    defaultWhyItMatters:
      "Beginners lose trust when quest copy sounds robotic, jargon-heavy, or drifts from the question.",
    defaultRecommendations: [
      {
        action: "Regenerate or simplify wording on flagged cards",
        rationale: "Plain-language copy improves comprehension and completion rates.",
        priority: "high"
      },
      {
        action: "Run demo content refresh for placeholder cards",
        rationale: "Template fallbacks read as broken content to players.",
        priority: "medium"
      }
    ]
  },
  learning_quality: {
    id: "learning_quality",
    label: "Learning Quality",
    defaultWhyItMatters:
      "Answers that assume too much prior knowledge block the learning loop before the quiz.",
    defaultRecommendations: [
      {
        action: "Reduce complexity and shorten explanations",
        rationale: "Shorter, scaffolded answers improve retention for first-time investors.",
        priority: "high"
      },
      {
        action: "Align card copy to the investor question on each card",
        rationale: "Misaligned answers feel like reading a glossary, not building conviction.",
        priority: "medium"
      }
    ]
  },
  behavioral_design: {
    id: "behavioral_design",
    label: "Behavioral Design",
    defaultWhyItMatters:
      "Weak curiosity or mastery loops reduce return visits after players finish a pillar.",
    defaultRecommendations: [
      {
        action: "Improve anticipation and mastery progression between pillars",
        rationale: "Hook → reward → investment cycles keep research feeling purposeful.",
        priority: "high"
      },
      {
        action: "Balance extrinsic XP celebration with competence and identity cues",
        rationale: "Over-reliance on XP weakens intrinsic motivation over time.",
        priority: "medium"
      }
    ]
  },
  gamification_mechanics: {
    id: "gamification_mechanics",
    label: "Gamification Mechanics",
    defaultWhyItMatters:
      "XP-only reinforcement trains grind behavior instead of investor identity.",
    defaultRecommendations: [
      {
        action: "Increase competence and identity reinforcement on quest completion",
        rationale: "Players should feel like better researchers, not just higher levels.",
        priority: "high"
      },
      {
        action: "Audit reward mix across badges, streaks, and conviction",
        rationale: "Balanced mechanics sustain long-term engagement.",
        priority: "medium"
      }
    ]
  },
  ux_interaction: {
    id: "ux_interaction",
    label: "UX / Interaction",
    defaultWhyItMatters:
      "Hidden or low-contrast CTAs break the expedition flow, especially on mobile.",
    defaultRecommendations: [
      {
        action: "Increase button contrast and viewport positioning for primary CTAs",
        rationale: "Visible next steps reduce drop-off between cards and quiz.",
        priority: "high"
      },
      {
        action: "Confirm decorative layers use pointer-events: none",
        rationale: "Blocked taps feel like a broken game, not a loading state.",
        priority: "medium"
      }
    ]
  },
  cognitive_load: {
    id: "cognitive_load",
    label: "Cognitive Load",
    defaultWhyItMatters:
      "Dense paragraphs and undefined terms increase mental effort before learning begins.",
    defaultRecommendations: [
      {
        action: "Split long blocks into shorter paragraphs with one idea each",
        rationale: "Lower per-card load improves scanability on phone screens.",
        priority: "high"
      },
      {
        action: "Define jargon inline on first use",
        rationale: "Investor Quest targets beginners — undefined terms stall progress.",
        priority: "medium"
      }
    ]
  },
  investor_understanding: {
    id: "investor_understanding",
    label: "Investor Understanding",
    defaultWhyItMatters:
      "Copy that explains mechanics but not investment meaning fails the product promise.",
    defaultRecommendations: [
      {
        action: "Add a 'so what for investors' line to weak cards",
        rationale: "Players need to connect facts to conviction, not just recall trivia.",
        priority: "high"
      },
      {
        action: "Tie quiz explanations back to the card thesis",
        rationale: "Reinforcement across read → quiz cements understanding.",
        priority: "medium"
      }
    ]
  },
  mobile_experience: {
    id: "mobile_experience",
    label: "Mobile Experience",
    defaultWhyItMatters:
      "Mission Control and player quests are often reviewed on phones — layout issues block ops and demos.",
    defaultRecommendations: [
      {
        action: "Test tap targets and scroll on 390px viewport",
        rationale: "Mobile is the default demo surface for teachers and partners.",
        priority: "high"
      },
      {
        action: "Keep primary actions above the mobile nav safe area",
        rationale: "CTAs hidden behind nav feel unreachable.",
        priority: "medium"
      }
    ]
  },
  quiz_quality: {
    id: "quiz_quality",
    label: "Quiz Quality",
    defaultWhyItMatters:
      "Quizzes that unlock late or lack config break the read → prove loop.",
    defaultRecommendations: [
      {
        action: "Verify quiz config exists and unlocks after all cards read",
        rationale: "The quiz is the XP gate — blocked quizzes stall progression.",
        priority: "high"
      },
      {
        action: "Recheck quest flow after content deploy",
        rationale: "Route or card slug changes can silently break unlock rules.",
        priority: "medium"
      }
    ]
  },
  progression_systems: {
    id: "progression_systems",
    label: "Progression Systems",
    defaultWhyItMatters:
      "Broken XP, unlock, or persistence rules make the RPG layer feel untrustworthy.",
    defaultRecommendations: [
      {
        action: "Repair or reset quest progress on affected devices",
        rationale: "Stale localStorage can block quiz unlock after content fixes.",
        priority: "high"
      },
      {
        action: "Confirm XP rewards exist in quest catalog",
        rationale: "Missing rewards demotivate completion.",
        priority: "medium"
      }
    ]
  },
  motivation_systems: {
    id: "motivation_systems",
    label: "Motivation Systems",
    defaultWhyItMatters:
      "Streaks, badges, and conviction only work when players notice and trust them.",
    defaultRecommendations: [
      {
        action: "Surface next milestone on map and profile hubs",
        rationale: "Visible progress fuels return sessions.",
        priority: "medium"
      },
      {
        action: "Review behavioral audit for underused White Hat drives",
        rationale: "Autonomy and mastery beats pressure tactics for learning products.",
        priority: "medium"
      }
    ]
  },
  content_completeness: {
    id: "content_completeness",
    label: "Content Completeness",
    defaultWhyItMatters:
      "Missing answers or assets show blank screens during live demos.",
    defaultRecommendations: [
      {
        action: "Run SEC extract + regenerate for affected tickers",
        rationale: "Empty cards cannot teach or award XP.",
        priority: "high"
      },
      {
        action: "Use demo content refresh verify pass",
        rationale: "Bulk regen with verification closes completeness gaps faster.",
        priority: "medium"
      }
    ]
  },
  player_progression: {
    id: "player_progression",
    label: "Player Progression",
    defaultWhyItMatters:
      "Players who cannot advance lose the core game loop.",
    defaultRecommendations: [
      {
        action: "Recheck quest flow and repair progress",
        rationale: "Progression bugs are demo-stoppers.",
        priority: "high"
      }
    ]
  },
  world_map: {
    id: "world_map",
    label: "World Map",
    defaultWhyItMatters:
      "The map is the hub — broken hotspots block access to entire pillars.",
    defaultRecommendations: [
      {
        action: "Verify hotspot z-index and pointer-events on map scene",
        rationale: "Islands must stay clickable above decorative layers.",
        priority: "high"
      }
    ]
  },
  quest_session: {
    id: "quest_session",
    label: "Quest & Session Experience",
    defaultWhyItMatters:
      "Slow or unreachable quest routes break immersion during research sessions.",
    defaultRecommendations: [
      {
        action: "Enable fast mode for demo emergency",
        rationale: "Slow generation reads as a broken product in live demos.",
        priority: "medium"
      },
      {
        action: "Probe slow routes and fix upstream API timeouts",
        rationale: "Session latency compounds across four pillars.",
        priority: "high"
      }
    ]
  },
  platform_infrastructure: {
    id: "platform_infrastructure",
    label: "Platform Infrastructure",
    defaultWhyItMatters:
      "Database, API, or env misconfig blocks all audits and player saves.",
    defaultRecommendations: [
      {
        action: "Fix Supabase env vars and run game_health migration",
        rationale: "Mission Control cannot track fixes without persistence.",
        priority: "high"
      }
    ]
  },
  admin_operations: {
    id: "admin_operations",
    label: "Admin & Operations",
    defaultWhyItMatters:
      "Prompt and admin tooling gaps slow content iteration and demo prep.",
    defaultRecommendations: [
      {
        action: "Sync prompt templates from code and verify in Prompt Studio",
        rationale: "Drift between code and DB causes inconsistent generation.",
        priority: "medium"
      }
    ]
  }
};

/** Map health domain IDs to resolution audit categories. */
export const DOMAIN_TO_AUDIT_CATEGORY: Record<string, AuditCategoryId> = {
  communication_quality: "communication_quality",
  learning_quality: "learning_quality",
  player_progression: "progression_systems",
  world_map: "world_map",
  quest_session: "quest_session",
  content_completeness: "content_completeness",
  platform_release: "platform_infrastructure",
  data_integrations: "platform_infrastructure",
  admin_operations: "admin_operations"
};

/** Map communication sub-categories to audit categories. */
export const COMM_CATEGORY_TO_AUDIT: Record<string, AuditCategoryId> = {
  jargon_detection: "communication_quality",
  cognitive_load: "cognitive_load",
  investor_clarity: "investor_understanding",
  beginner_friendliness: "learning_quality",
  conversational_tone: "communication_quality",
  human_tone: "communication_quality",
  emotional_clarity: "communication_quality",
  question_alignment: "learning_quality"
};
