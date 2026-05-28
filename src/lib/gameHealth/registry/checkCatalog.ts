import type { HealthCheckCatalogEntry } from "@/lib/gameHealth/registry/types";

const FIX = {
  env: "Set missing environment variables on Vercel (Production), then redeploy.",
  db: "Confirm Supabase URL/key match the project where migrations ran.",
  regen: "Open Mission Control fix panel → Retry answer or Refresh demo content.",
  fast: "Turn on fast mode for demos, then investigate slow routes.",
  jargon: "Pause strict language checks for demo, regenerate affected cards.",
  questFlow: "Deploy latest build, then run Recheck quest flow in Mission Control.",
  progress: "Use Repair quest progress on a test device, then recheck.",
  browser: "Run the browser lab (Phase 3) from Mission Control when available.",
  manual: "Complete the manual review checklist in Mission Control.",
  prompts: "Sync Prompt Studio templates to the database.",
  pending: "Scheduled for a future audit phase — not counted in domain score yet."
} as const;

/** Master catalog: automated checks + Phase 2/3 placeholders. */
export const HEALTH_CHECK_CATALOG: HealthCheckCatalogEntry[] = [
  // —— Platform & Release ——
  {
    id: "supabase_config",
    name: "Database connection",
    domainId: "platform_release",
    subsectionId: "environment",
    checkType: "automated",
    weight: 12,
    blocksDemo: true,
    defaultSuggestedFix: FIX.env,
    implementationPhase: 1
  },
  {
    id: "openai_config",
    name: "AI answer generation",
    domainId: "platform_release",
    subsectionId: "environment",
    checkType: "automated",
    weight: 10,
    blocksDemo: true,
    defaultSuggestedFix: FIX.env,
    implementationPhase: 1
  },
  {
    id: "sec_config",
    name: "SEC filing pull",
    domainId: "platform_release",
    subsectionId: "environment",
    checkType: "automated",
    weight: 6,
    blocksDemo: false,
    defaultSuggestedFix: FIX.env,
    implementationPhase: 1
  },
  {
    id: "supabase_live",
    name: "Database responds",
    domainId: "platform_release",
    subsectionId: "connectivity",
    checkType: "automated",
    weight: 12,
    blocksDemo: true,
    defaultSuggestedFix: FIX.db,
    implementationPhase: 1
  },
  {
    id: "openai_live",
    name: "AI service responds",
    domainId: "platform_release",
    subsectionId: "connectivity",
    checkType: "automated",
    weight: 8,
    blocksDemo: true,
    defaultSuggestedFix: FIX.env,
    implementationPhase: 1
  },
  {
    id: "quest_catalog",
    name: "Quest content catalog API",
    domainId: "platform_release",
    subsectionId: "routes",
    checkType: "automated",
    weight: 6,
    blocksDemo: true,
    defaultSuggestedFix: FIX.db,
    implementationPhase: 1
  },
  {
    id: "quest_page_load",
    name: "Quest reading page loads",
    domainId: "platform_release",
    subsectionId: "routes",
    checkType: "automated",
    weight: 6,
    blocksDemo: true,
    defaultSuggestedFix: "Check server logs and redeploy if the quest route returns errors.",
    implementationPhase: 1
  },
  {
    id: "deploy_parity",
    name: "Production matches latest release",
    domainId: "platform_release",
    subsectionId: "release",
    checkType: "automated",
    weight: 8,
    blocksDemo: false,
    defaultSuggestedFix: "Push to main and confirm Vercel production deploy completed.",
    implementationPhase: 2
  },
  {
    id: "health_cron_fresh",
    name: "Scheduled health checks running",
    domainId: "platform_release",
    subsectionId: "release",
    checkType: "automated",
    weight: 4,
    blocksDemo: false,
    defaultSuggestedFix: "Verify game-health cron is enabled on production.",
    implementationPhase: 2
  },

  // —— Data & Integrations ——
  {
    id: "supabase_read",
    name: "Quest answers readable",
    domainId: "data_integrations",
    subsectionId: "database",
    checkType: "automated",
    weight: 10,
    blocksDemo: true,
    defaultSuggestedFix: FIX.db,
    implementationPhase: 1
  },
  {
    id: "supabase_write",
    name: "Database saves work",
    domainId: "data_integrations",
    subsectionId: "database",
    checkType: "automated",
    weight: 8,
    blocksDemo: true,
    defaultSuggestedFix: FIX.db,
    implementationPhase: 1
  },
  {
    id: "sec_extract_data",
    name: "SEC filing data stored",
    domainId: "data_integrations",
    subsectionId: "external_apis",
    checkType: "automated",
    weight: 6,
    blocksDemo: false,
    defaultSuggestedFix: "Run SEC extract for demo tickers before generating answers.",
    implementationPhase: 1
  },
  {
    id: "company_directory",
    name: "Company directory loaded",
    domainId: "data_integrations",
    subsectionId: "catalog_data",
    checkType: "automated",
    weight: 3,
    blocksDemo: false,
    defaultSuggestedFix: "Verify companies catalog in source data.",
    implementationPhase: 1
  },
  {
    id: "company_search",
    name: "Company search works",
    domainId: "data_integrations",
    subsectionId: "catalog_data",
    checkType: "automated",
    weight: 5,
    blocksDemo: true,
    defaultSuggestedFix: "Fix company search index / directory entries.",
    implementationPhase: 1
  },

  // —— Content Completeness ——
  {
    id: "quest_answer_nvda",
    name: "NVIDIA snapshot has an answer",
    domainId: "content_completeness",
    subsectionId: "demo_answers",
    checkType: "automated",
    weight: 14,
    blocksDemo: true,
    defaultSuggestedFix: FIX.regen,
    implementationPhase: 1
  },
  {
    id: "empty_answer_cards",
    name: "No empty answer cards (demo)",
    domainId: "content_completeness",
    subsectionId: "demo_answers",
    checkType: "automated",
    weight: 10,
    blocksDemo: true,
    defaultSuggestedFix: FIX.regen,
    implementationPhase: 1
  },
  {
    id: "company_logos",
    name: "Company logos load",
    domainId: "content_completeness",
    subsectionId: "assets",
    checkType: "automated",
    weight: 4,
    blocksDemo: false,
    defaultSuggestedFix: "Add or fix logo assets under public/logos.",
    implementationPhase: 1
  },
  {
    id: "orphan_catalog_cards",
    name: "No orphan quest cards in catalog",
    domainId: "content_completeness",
    subsectionId: "coverage",
    checkType: "automated",
    weight: 6,
    blocksDemo: false,
    defaultSuggestedFix: "Align quest_content_cards with quest definitions.",
    implementationPhase: 2
  },

  // —— Learning Quality ——
  {
    id: "jargon_gate",
    name: "Answers use plain language",
    domainId: "learning_quality",
    subsectionId: "plain_language",
    checkType: "automated",
    weight: 6,
    blocksDemo: false,
    defaultSuggestedFix: FIX.jargon,
    implementationPhase: 1
  },
  {
    id: "human_first_demo",
    name: "Demo copy passes human-first checks",
    domainId: "learning_quality",
    subsectionId: "pedagogy",
    checkType: "automated",
    weight: 8,
    blocksDemo: false,
    defaultSuggestedFix: "Run Refresh demo content in Mission Control.",
    implementationPhase: 2
  },

  // —— Communication Quality ——
  {
    id: "communication_conversational_tone",
    name: "Conversational tone",
    domainId: "communication_quality",
    subsectionId: "conversational_tone",
    checkType: "automated",
    weight: 5,
    blocksDemo: false,
    defaultSuggestedFix: "Regenerate cards that sound robotic or textbook-like.",
    implementationPhase: 1
  },
  {
    id: "communication_beginner_friendliness",
    name: "Beginner friendliness",
    domainId: "communication_quality",
    subsectionId: "beginner_friendliness",
    checkType: "automated",
    weight: 5,
    blocksDemo: false,
    defaultSuggestedFix: "Replace jargon with everyday language beginners already know.",
    implementationPhase: 1
  },
  {
    id: "communication_question_alignment",
    name: "Question alignment",
    domainId: "communication_quality",
    subsectionId: "question_alignment",
    checkType: "automated",
    weight: 6,
    blocksDemo: false,
    defaultSuggestedFix: "Rewrite answers that drift from the card question.",
    implementationPhase: 1
  },
  {
    id: "communication_jargon_detection",
    name: "Jargon detection",
    domainId: "communication_quality",
    subsectionId: "jargon_detection",
    checkType: "automated",
    weight: 6,
    blocksDemo: false,
    defaultSuggestedFix: FIX.jargon,
    implementationPhase: 1
  },
  {
    id: "communication_human_tone",
    name: "Human tone",
    domainId: "communication_quality",
    subsectionId: "human_tone",
    checkType: "automated",
    weight: 6,
    blocksDemo: false,
    defaultSuggestedFix: "Rewrite AI-sounding or corporate copy in smart-friend voice.",
    implementationPhase: 1
  },
  {
    id: "communication_emotional_clarity",
    name: "Emotional clarity",
    domainId: "communication_quality",
    subsectionId: "emotional_clarity",
    checkType: "automated",
    weight: 5,
    blocksDemo: false,
    defaultSuggestedFix: "Add real-life hooks so players can picture the idea.",
    implementationPhase: 1
  },
  {
    id: "communication_cognitive_load",
    name: "Cognitive load",
    domainId: "communication_quality",
    subsectionId: "cognitive_load",
    checkType: "automated",
    weight: 5,
    blocksDemo: false,
    defaultSuggestedFix: "Shorten dense answers — max 4 short sentences before investor takeaway.",
    implementationPhase: 1
  },
  {
    id: "communication_investor_clarity",
    name: "Investor clarity",
    domainId: "communication_quality",
    subsectionId: "investor_clarity",
    checkType: "automated",
    weight: 5,
    blocksDemo: false,
    defaultSuggestedFix: "Clarify why investors care without skipping the card question.",
    implementationPhase: 1
  },
  {
    id: "communication_health_overall",
    name: "Communication health (overall)",
    domainId: "communication_quality",
    subsectionId: "conversational_tone",
    checkType: "automated",
    weight: 10,
    blocksDemo: false,
    defaultSuggestedFix: "Review Communication Quality Audit in Mission Control and regenerate weak cards.",
    implementationPhase: 1
  },

  // —— Player Progression ——
  {
    id: "quest_flow_demo",
    name: "Quest quiz unlock (demo companies)",
    domainId: "player_progression",
    subsectionId: "quest_flow",
    checkType: "automated",
    weight: 18,
    blocksDemo: true,
    defaultSuggestedFix: FIX.questFlow,
    implementationPhase: 1
  },
  {
    id: "xp_progress_config",
    name: "Quest XP rewards configured",
    domainId: "player_progression",
    subsectionId: "rewards",
    checkType: "automated",
    weight: 4,
    blocksDemo: false,
    defaultSuggestedFix: "Activate quest cards with XP in the content catalog.",
    implementationPhase: 1
  },
  {
    id: "progress_local_save",
    name: "Progress saves after quest actions",
    domainId: "player_progression",
    subsectionId: "persistence",
    checkType: "browser",
    weight: 10,
    blocksDemo: true,
    defaultSuggestedFix: FIX.progress,
    implementationPhase: 3
  },
  {
    id: "badge_unlock_rules",
    name: "Badge unlock rules valid",
    domainId: "player_progression",
    subsectionId: "rewards",
    checkType: "automated",
    weight: 4,
    blocksDemo: false,
    defaultSuggestedFix: "Review badge thresholds in progression config.",
    implementationPhase: 2
  },

  // —— World Map ——
  {
    id: "slow_map",
    name: "Quest map loads quickly",
    domainId: "world_map",
    subsectionId: "map_performance",
    checkType: "automated",
    weight: 8,
    blocksDemo: true,
    defaultSuggestedFix: FIX.fast,
    implementationPhase: 1
  },
  {
    id: "map_nodes_catalog",
    name: "Map nodes match quest catalog",
    domainId: "world_map",
    subsectionId: "map_structure",
    checkType: "automated",
    weight: 6,
    blocksDemo: false,
    defaultSuggestedFix: "Sync map node IDs with published quests.",
    implementationPhase: 2
  },
  {
    id: "map_click_zones",
    name: "Map nodes are tappable (not blocked by FX)",
    domainId: "world_map",
    subsectionId: "map_interaction",
    checkType: "browser",
    weight: 12,
    blocksDemo: true,
    defaultSuggestedFix: FIX.browser,
    implementationPhase: 3
  },
  {
    id: "map_pointer_events",
    name: "Decorative map layers ignore pointer events",
    domainId: "world_map",
    subsectionId: "map_interaction",
    checkType: "browser",
    weight: 8,
    blocksDemo: true,
    defaultSuggestedFix: "Set pointer-events:none on route/glow overlays.",
    implementationPhase: 3
  },

  // —— Quest & Session ——
  {
    id: "slow_snapshot",
    name: "Quest card API responds quickly",
    domainId: "quest_session",
    subsectionId: "load_performance",
    checkType: "automated",
    weight: 10,
    blocksDemo: false,
    defaultSuggestedFix: FIX.fast,
    implementationPhase: 1
  },
  {
    id: "buttons_clickable",
    name: "Primary buttons are clickable",
    domainId: "quest_session",
    subsectionId: "interaction",
    checkType: "browser",
    weight: 12,
    blocksDemo: true,
    defaultSuggestedFix: FIX.browser,
    implementationPhase: 3
  },
  {
    id: "cards_hover_states",
    name: "Quest cards show hover / active states",
    domainId: "quest_session",
    subsectionId: "interaction",
    checkType: "browser",
    weight: 6,
    blocksDemo: false,
    defaultSuggestedFix: FIX.browser,
    implementationPhase: 3
  },
  {
    id: "quiz_button_unlock",
    name: "Quiz button unlocks after all cards read",
    domainId: "quest_session",
    subsectionId: "interaction",
    checkType: "browser",
    weight: 14,
    blocksDemo: true,
    defaultSuggestedFix: FIX.questFlow,
    implementationPhase: 3
  },
  {
    id: "overlay_blocks_clicks",
    name: "No invisible overlay blocking clicks",
    domainId: "quest_session",
    subsectionId: "interaction",
    checkType: "browser",
    weight: 10,
    blocksDemo: true,
    defaultSuggestedFix: FIX.browser,
    implementationPhase: 3
  },
  {
    id: "console_hydration",
    name: "No console or hydration errors on quest pages",
    domainId: "quest_session",
    subsectionId: "interaction",
    checkType: "browser",
    weight: 10,
    blocksDemo: true,
    defaultSuggestedFix: "Fix SSR/hydration mismatches; run dev:fresh if cache is corrupt.",
    implementationPhase: 3
  },
  {
    id: "mobile_tap_targets",
    name: "Mobile tap targets meet minimum size",
    domainId: "quest_session",
    subsectionId: "mobile_ux",
    checkType: "browser",
    weight: 8,
    blocksDemo: true,
    defaultSuggestedFix: FIX.browser,
    implementationPhase: 3
  },
  {
    id: "text_not_clipped",
    name: "Quest UI text is not cut off",
    domainId: "quest_session",
    subsectionId: "mobile_ux",
    checkType: "browser",
    weight: 6,
    blocksDemo: false,
    defaultSuggestedFix: FIX.browser,
    implementationPhase: 3
  },
  {
    id: "scroll_not_trapped",
    name: "Scroll works inside quest reading",
    domainId: "quest_session",
    subsectionId: "mobile_ux",
    checkType: "browser",
    weight: 6,
    blocksDemo: false,
    defaultSuggestedFix: FIX.browser,
    implementationPhase: 3
  },

  // —— Admin & Operations ——
  {
    id: "prompts_synced",
    name: "Admin prompts available",
    domainId: "admin_operations",
    subsectionId: "prompts",
    checkType: "automated",
    weight: 6,
    blocksDemo: false,
    defaultSuggestedFix: FIX.prompts,
    implementationPhase: 1
  },
  {
    id: "admin_quest_save",
    name: "Admin quest edits save correctly",
    domainId: "admin_operations",
    subsectionId: "admin_tools",
    checkType: "browser",
    weight: 8,
    blocksDemo: false,
    defaultSuggestedFix: FIX.browser,
    implementationPhase: 3
  },
  {
    id: "mission_control_loads",
    name: "Mission Control dashboard loads",
    domainId: "admin_operations",
    subsectionId: "admin_tools",
    checkType: "automated",
    weight: 6,
    blocksDemo: false,
    defaultSuggestedFix: FIX.db,
    implementationPhase: 2
  }
];

export const CATALOG_BY_CHECK_ID = Object.fromEntries(
  HEALTH_CHECK_CATALOG.map((c) => [c.id, c])
) as Record<string, HealthCheckCatalogEntry>;

export const AUTOMATED_PHASE1_CHECK_IDS = HEALTH_CHECK_CATALOG.filter(
  (c) => c.implementationPhase === 1 && c.checkType === "automated"
).map((c) => c.id);
