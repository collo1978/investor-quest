import type { HealthDomainDefinition } from "@/lib/gameHealth/registry/types";

export const PLATFORM_HEALTH_DOMAINS: HealthDomainDefinition[] = [
  {
    id: "platform_release",
    label: "Platform & Release",
    description: "Deploy, environment, routes, and core services.",
    weight: 14,
    demoCritical: true,
    subsections: [
      { id: "environment", label: "Environment & keys" },
      { id: "connectivity", label: "Service connectivity" },
      { id: "routes", label: "Critical routes" },
      { id: "release", label: "Release parity" }
    ]
  },
  {
    id: "data_integrations",
    label: "Data & Integrations",
    description: "Database, APIs, and catalog integrity.",
    weight: 8,
    demoCritical: true,
    subsections: [
      { id: "database", label: "Database access" },
      { id: "external_apis", label: "External APIs" },
      { id: "catalog_data", label: "Catalog & search" }
    ]
  },
  {
    id: "content_completeness",
    label: "Content Completeness",
    description: "Answers, assets, and missing player-facing content.",
    weight: 16,
    demoCritical: true,
    subsections: [
      { id: "demo_answers", label: "Demo quest answers" },
      { id: "assets", label: "Static assets" },
      { id: "coverage", label: "Content coverage" }
    ]
  },
  {
    id: "learning_quality",
    label: "Learning Quality",
    description: "Plain language and teaching clarity.",
    weight: 12,
    demoCritical: false,
    subsections: [
      { id: "plain_language", label: "Plain language" },
      { id: "pedagogy", label: "Pedagogy signals" }
    ]
  },
  {
    id: "communication_quality",
    label: "Communication Quality",
    description:
      "Human, relatable, beginner-friendly copy across cards, quizzes, and mastery screens.",
    weight: 14,
    demoCritical: false,
    subsections: [
      {
        id: "conversational_tone",
        label: "Conversational tone",
        description: "Natural voice — not robotic or textbook-like."
      },
      {
        id: "beginner_friendliness",
        label: "Beginner friendliness",
        description: "Instantly understandable without assumed knowledge."
      },
      {
        id: "question_alignment",
        label: "Question alignment",
        description: "Answers stay focused on the card question."
      },
      {
        id: "jargon_detection",
        label: "Jargon detection",
        description: "Finance, tech, corporate, and consultant wording."
      },
      {
        id: "human_tone",
        label: "Human tone",
        description: "Smart friend — not an AI rewriting a filing."
      },
      {
        id: "emotional_clarity",
        label: "Emotional clarity",
        description: "Intuitive and easy to visualize."
      },
      {
        id: "cognitive_load",
        label: "Cognitive load",
        description: "Not too dense, abstract, or long."
      },
      {
        id: "investor_clarity",
        label: "Investor clarity",
        description: "Why this matters and why investors care."
      }
    ]
  },
  {
    id: "player_progression",
    label: "Player Progression",
    description: "Quest flow, XP, saves, and unlock logic.",
    weight: 18,
    demoCritical: true,
    subsections: [
      { id: "quest_flow", label: "Quest flow & quiz unlock" },
      { id: "rewards", label: "XP & rewards" },
      { id: "persistence", label: "Progress persistence" }
    ]
  },
  {
    id: "world_map",
    label: "World Map",
    description: "Map load, nodes, and island interactions.",
    weight: 10,
    demoCritical: true,
    subsections: [
      { id: "map_performance", label: "Map performance" },
      { id: "map_structure", label: "Map structure" },
      { id: "map_interaction", label: "Map interaction" }
    ]
  },
  {
    id: "quest_session",
    label: "Quest & Session Experience",
    description: "Quest pages, interactions, and mobile UX.",
    weight: 14,
    demoCritical: true,
    subsections: [
      { id: "reachability", label: "Page reachability" },
      { id: "load_performance", label: "Quest load performance" },
      { id: "interaction", label: "Interaction & overlays" },
      { id: "mobile_ux", label: "Mobile UX" }
    ]
  },
  {
    id: "admin_operations",
    label: "Admin & Operations",
    description: "Mission Control, prompts, and admin saves.",
    weight: 8,
    demoCritical: false,
    subsections: [
      { id: "prompts", label: "Prompts & AI config" },
      { id: "admin_tools", label: "Admin tools" }
    ]
  }
];

export const DOMAIN_BY_ID = Object.fromEntries(
  PLATFORM_HEALTH_DOMAINS.map((d) => [d.id, d])
) as Record<
  (typeof PLATFORM_HEALTH_DOMAINS)[number]["id"],
  HealthDomainDefinition
>;
