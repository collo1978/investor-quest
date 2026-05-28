import type { QuestTemplate } from "@/data/quests/types";
import { mergeQuizConfig } from "@/data/quests/types";

import {
  FORCES_LEGACY_TOPIC_SLUGS,
  FORCES_RETIRED_TOPIC_SLUG_ALIASES
} from "@/lib/forces/forcesQuestRoutes";

/** Supabase slug → demo template slug (Management pillar naming drift). */
const DEMO_SLUG_ALIASES: Partial<Record<string, string>> = {
  "board-leadership": "mgmt-1",
  "executive-compensation": "mgmt-quiz",
  "capital-allocation": "mgmt-2",
  "governance-control": "mgmt-governance",
  ...FORCES_RETIRED_TOPIC_SLUG_ALIASES
};

function demoTemplateForSlug(
  demoBySlug: Map<string, QuestTemplate>,
  supabaseSlug: string
): QuestTemplate | undefined {
  return (
    demoBySlug.get(supabaseSlug) ??
    demoBySlug.get(DEMO_SLUG_ALIASES[supabaseSlug] ?? "")
  );
}

/**
 * CMS row wins for copy/routes; demo keeps sub-cards, quiz, and hub defaults
 * so hydration does not wipe "3 cards" badges back to 0.
 */
export function mergeQuestTemplateWithDemo(
  demo: QuestTemplate | undefined,
  fromSupabase: QuestTemplate
): QuestTemplate {
  if (!demo) return fromSupabase;

  return {
    ...demo,
    ...fromSupabase,
    cards: demo.cards,
    quizConfig: mergeQuizConfig(fromSupabase.quizConfig, demo?.quizConfig),
    hubCardCount:
      fromSupabase.hubCardCount ??
      demo.hubCardCount ??
      demo.cards?.length ??
      undefined,
    hubSubtitle: fromSupabase.hubSubtitle ?? demo.hubSubtitle,
    hubRoute: fromSupabase.hubRoute ?? demo.hubRoute,
    hubIcon: fromSupabase.hubIcon ?? demo.hubIcon,
    hubLocked:
      fromSupabase.hubLocked !== null && fromSupabase.hubLocked !== undefined
        ? fromSupabase.hubLocked
        : demo.hubLocked,
    unlockRequirements: demo.unlockRequirements,
    completionState: demo.completionState ?? fromSupabase.completionState,
    plainEnglishAnswer:
      fromSupabase.plainEnglishAnswer ?? demo.plainEnglishAnswer,
    investorInsight: fromSupabase.investorInsight ?? demo.investorInsight
  };
}

export function mergePillarTemplatesWithDemo(
  demo: readonly QuestTemplate[],
  fromSupabase: readonly QuestTemplate[]
): QuestTemplate[] {
  if (!fromSupabase.length) return [...demo];

  const demoBySlug = new Map(demo.map((t) => [t.slug, t]));
  const merged = new Map<string, QuestTemplate>();

  for (const d of demo) merged.set(d.slug, { ...d });

  for (const row of fromSupabase) {
    if (row.pillarId === "forces" && FORCES_LEGACY_TOPIC_SLUGS.has(row.slug)) {
      continue;
    }
    const canonicalSlug = DEMO_SLUG_ALIASES[row.slug] ?? row.slug;
    const demoTpl = demoTemplateForSlug(demoBySlug, row.slug);
    merged.set(
      canonicalSlug,
      mergeQuestTemplateWithDemo(demoTpl, { ...row, slug: canonicalSlug })
    );
  }

  return [...merged.values()];
}
