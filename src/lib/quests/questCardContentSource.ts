/**
 * Resolves which copy source wins for a quest card on screen.
 *
 * Priority (highest first):
 * 1. curated_override — `src/data/quests/content/{company}.ts`
 * 2. database_generated — Supabase `company_quest_card_answers`
 * 3. template_fallback — null placeholder (awaiting content)
 * 4. generating — pipeline running, no text yet (UI state only)
 */
import type { CompanyId } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import { contentKey, getQuestContentOverride } from "@/data/quests/content";
import type { QuestSubCard } from "@/data/quests/types";
import {
  isControlledDemoCompany,
  isWeakDemoAnswer
} from "@/lib/demo/controlledDemoCopyGuard";
import { formatQuestCardFields } from "@/lib/quests/questAnswerFormatter";
import type { StoredQuestCardAnswer } from "@/lib/supabase/questCardAnswers/types";

function normCardFields(
  plain: string | null | undefined,
  insight?: string | null
): { plainEnglishAnswer: string | null; investorInsight: string | null | undefined } {
  return formatQuestCardFields({
    plainEnglishAnswer: plain,
    investorInsight: insight
  });
}

export type QuestCardContentSource =
  | "curated_override"
  | "database_generated"
  | "template_fallback"
  | "generating";

export type QuestCardContentSourceMeta = {
  source: QuestCardContentSource;
  /** Human-readable label for admin / debug */
  sourceLabel: string;
  /** Repo path or table name */
  sourceDetail: string;
  plainEnglishAnswer: string | null;
  investorInsight: string | null | undefined;
  /** First ~120 chars of curated copy (if any) */
  curatedPreview: string | null;
  /** First ~120 chars of DB copy (if any) */
  databasePreview: string | null;
  /** True when DB has text but curated wins on screen */
  databaseSuppressed: boolean;
};

function preview(text: string | null | undefined, max = 120): string | null {
  const t = text?.trim();
  if (!t) return null;
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

export function getCuratedCardContent(
  companyId: CompanyId,
  pillarId: PillarId,
  questSlug: string,
  cardId: string
): { plainEnglishAnswer: string; investorInsight?: string } | null {
  const override = getQuestContentOverride(
    companyId,
    contentKey(pillarId, questSlug)
  );
  const oc = override?.cards?.[cardId];
  const answer = oc?.plainEnglishAnswer?.trim() ?? override?.plainEnglishAnswer?.trim();
  if (!answer) return null;
  const formatted = formatQuestCardFields({
    plainEnglishAnswer: answer,
    investorInsight: oc?.investorInsight ?? override?.investorInsight
  });
  if (!formatted.plainEnglishAnswer) return null;
  return {
    plainEnglishAnswer: formatted.plainEnglishAnswer,
    investorInsight: formatted.investorInsight ?? undefined
  };
}

export function hasCuratedCardAnswer(
  companyId: CompanyId,
  pillarId: PillarId,
  questSlug: string,
  cardId: string
): boolean {
  return getCuratedCardContent(companyId, pillarId, questSlug, cardId) != null;
}

export function resolveQuestCardDisplayContent(params: {
  companyId: CompanyId;
  pillarId: PillarId;
  questSlug: string;
  cardId: string;
  instantiatedCard?: Pick<
    QuestSubCard,
    "plainEnglishAnswer" | "investorInsight" | "whyItMatters"
  > | null;
  generatedCard?: StoredQuestCardAnswer | null;
  pipelineGenerating?: boolean;
}): QuestCardContentSourceMeta {
  const curated = getCuratedCardContent(
    params.companyId,
    params.pillarId,
    params.questSlug,
    params.cardId
  );
  const demoMode = isControlledDemoCompany(params.companyId);
  const rawDbAnswer = params.generatedCard?.plainEnglishAnswer?.trim() || null;
  const dbAnswer =
    demoMode || isWeakDemoAnswer(rawDbAnswer) ? null : rawDbAnswer;
  const dbInsight = params.generatedCard?.investorInsight?.trim() || null;

  if (curated) {
    const formatted = normCardFields(
      curated.plainEnglishAnswer,
      curated.investorInsight ?? dbInsight ?? params.instantiatedCard?.investorInsight
    );
    return {
      source: "curated_override",
      sourceLabel: demoMode ? "NVIDIA demo copy" : "Curated code override",
      sourceDetail: `src/data/quests/content/${params.companyId}.ts → ${params.pillarId}:${params.questSlug} → ${params.cardId}`,
      plainEnglishAnswer: formatted.plainEnglishAnswer!,
      investorInsight: formatted.investorInsight,
      curatedPreview: preview(curated.plainEnglishAnswer),
      databasePreview: preview(dbAnswer),
      databaseSuppressed: Boolean(dbAnswer)
    };
  }

  if (dbAnswer && !demoMode) {
    const formatted = normCardFields(
      dbAnswer,
      dbInsight ?? params.instantiatedCard?.investorInsight
    );
    return {
      source: "database_generated",
      sourceLabel: "Database (AI generated)",
      sourceDetail: "Supabase table company_quest_card_answers",
      plainEnglishAnswer: formatted.plainEnglishAnswer!,
      investorInsight: formatted.investorInsight,
      curatedPreview: null,
      databasePreview: preview(dbAnswer),
      databaseSuppressed: false
    };
  }

  const instAnswer = params.instantiatedCard?.plainEnglishAnswer?.trim();
  if (instAnswer && !demoMode && !isWeakDemoAnswer(instAnswer)) {
    const formatted = normCardFields(
      instAnswer,
      params.instantiatedCard?.investorInsight
    );
    return {
      source: "curated_override",
      sourceLabel: "Template / instantiated copy",
      sourceDetail: "Quest library (non-AI template default)",
      plainEnglishAnswer: formatted.plainEnglishAnswer!,
      investorInsight: formatted.investorInsight,
      curatedPreview: preview(instAnswer),
      databasePreview: null,
      databaseSuppressed: false
    };
  }

  if (params.pipelineGenerating && !demoMode) {
    return {
      source: "generating",
      sourceLabel: "AI generating",
      sourceDetail: "SEC → OpenAI pipeline in progress",
      plainEnglishAnswer: null,
      investorInsight: undefined,
      curatedPreview: null,
      databasePreview: null,
      databaseSuppressed: false
    };
  }

  if (demoMode) {
    const retry = getCuratedCardContent(
      params.companyId,
      params.pillarId,
      params.questSlug,
      params.cardId
    );
    if (retry?.plainEnglishAnswer) {
      const formatted = normCardFields(
        retry.plainEnglishAnswer,
        retry.investorInsight
      );
      return {
        source: "curated_override",
        sourceLabel: "NVIDIA demo copy",
        sourceDetail: `Curated demo → ${params.pillarId}:${params.questSlug}`,
        plainEnglishAnswer: formatted.plainEnglishAnswer!,
        investorInsight: formatted.investorInsight,
        curatedPreview: preview(retry.plainEnglishAnswer),
        databasePreview: null,
        databaseSuppressed: false
      };
    }
  }

  return {
    source: "template_fallback",
    sourceLabel: demoMode ? "Demo copy pending" : "Template fallback",
    sourceDetail: demoMode
      ? "Curated NVIDIA demo card — refresh if this appears"
      : "No curated override and no DB row — placeholder until generated",
    plainEnglishAnswer: null,
    investorInsight: params.instantiatedCard?.investorInsight ?? undefined,
    curatedPreview: null,
    databasePreview: null,
    databaseSuppressed: false
  };
}
