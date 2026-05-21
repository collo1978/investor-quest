import type { QuestTemplate } from "@/data/quests/types";
import { mergeQuizConfig } from "@/data/quests/types";

/** Supabase slug → demo template slug (Management pillar naming drift). */
const DEMO_SLUG_ALIASES: Partial<Record<string, string>> = {
  "board-leadership": "mgmt-1",
  "executive-compensation": "mgmt-quiz",
  "capital-allocation": "mgmt-2",
  "governance-control": "mgmt-governance"
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
    const demoTpl = demoTemplateForSlug(demoBySlug, row.slug);
    merged.set(row.slug, mergeQuestTemplateWithDemo(demoTpl, row));
  }

  return [...merged.values()];
}
