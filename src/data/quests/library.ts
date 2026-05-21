/**
 * Data Layer — quest library.
 *
 * Instantiates company-agnostic templates against a specific company and
 * exposes lookup helpers. This is the single source of truth for quest
 * content; nothing else should hardcode company-specific prompts.
 */

import { companyById, type Company, type CompanyId } from "@/data/companies";
import {
  PILLAR_ORDER,
  type PillarId
} from "@/data/pillars";
import type { QuestDefinition, QuestTemplate } from "@/data/quests/types";
import { mergeQuizConfig } from "@/data/quests/types";
import {
  contentKey,
  getQuestContentOverride,
  type QuestContentOverride
} from "@/data/quests/content";

import { BUSINESS_AI_QUEST_SLUGS } from "@/app/business/businessQuestSlugs";
import { MANAGEMENT_AI_QUEST_SLUGS } from "@/app/management/managementQuestSlugs";
import { isForcesHubSlug } from "@/lib/sec/forcesTopicSectionMap";
import { getPillarQuestTemplates } from "@/platform/quests/questContentRegistry";

function usesAiPipelineContent(pillarId: PillarId, slug: string): boolean {
  if (pillarId === "financials") return true;
  if (pillarId === "business") {
    return (BUSINESS_AI_QUEST_SLUGS as readonly string[]).includes(slug);
  }
  if (pillarId === "management") {
    return (MANAGEMENT_AI_QUEST_SLUGS as readonly string[]).includes(slug);
  }
  if (pillarId === "forces") return !isForcesHubSlug(slug);
  return false;
}

/** Build the globally unique quest id used by the engine. */
export function buildQuestId(
  companyId: CompanyId,
  pillarId: PillarId,
  slug: string
): string {
  return `${companyId}.${pillarId}.${slug}`;
}

/** Replace `{Company.name}` / `{Company.ticker}` / `{Company.sector}` tokens. */
function fillTokens(input: string, company: Company): string {
  return input
    .replace(/\{Company\.name\}/g, company.name)
    .replace(/\{Company\.ticker\}/g, company.ticker)
    .replace(/\{Company\.sector\}/g, company.sector);
}

function instantiate(
  template: QuestTemplate,
  company: Company
): QuestDefinition {
  const base: QuestDefinition = {
    ...template,
    id: buildQuestId(company.id, template.pillarId, template.slug),
    companyId: company.id,
    title: fillTokens(template.title, company),
    objective: fillTokens(template.objective, company),
    description: fillTokens(template.description, company),
    aiTask: fillTokens(template.aiTask, company),
    investorQuestion: fillTokens(template.investorQuestion, company),
    plainEnglishAnswer: template.plainEnglishAnswer
      ? fillTokens(template.plainEnglishAnswer, company)
      : null,
    whyItMatters: fillTokens(template.whyItMatters, company),
    investorInsight: template.investorInsight
      ? fillTokens(template.investorInsight, company)
      : undefined,
    cards: template.cards
      ? template.cards.map((c) => ({
          id: c.id,
          investorQuestion: fillTokens(c.investorQuestion, company),
          plainEnglishAnswer: c.plainEnglishAnswer
            ? fillTokens(c.plainEnglishAnswer, company)
            : null,
          whyItMatters: fillTokens(c.whyItMatters, company),
          investorInsight: c.investorInsight
            ? fillTokens(c.investorInsight, company)
            : undefined
        }))
      : undefined
  };

  let quest = base;
  if (usesAiPipelineContent(template.pillarId, template.slug)) {
    quest = {
      ...quest,
      plainEnglishAnswer: null,
      cards: quest.cards?.map((c) => ({
        ...c,
        plainEnglishAnswer: null
      }))
    };
  }

  const override = getQuestContentOverride(
    company.id,
    contentKey(template.pillarId, template.slug)
  );
  return override ? applyContentOverride(quest, override) : quest;
}

/**
 * Merge a company-specific content override on top of an instantiated
 * quest. Pure / additive — fields not present in the override are left
 * untouched.
 */
function applyContentOverride(
  quest: QuestDefinition,
  override: QuestContentOverride
): QuestDefinition {
  let next = quest;

  if (override.plainEnglishAnswer && !next.plainEnglishAnswer) {
    next = { ...next, plainEnglishAnswer: override.plainEnglishAnswer };
  }

  if (override.investorInsight && !next.investorInsight) {
    next = { ...next, investorInsight: override.investorInsight };
  }

  if (override.cards && next.cards) {
    next = {
      ...next,
      cards: next.cards.map((c) => {
        const oc = override.cards?.[c.id];
        if (!oc) return c;
        return {
          ...c,
          plainEnglishAnswer: oc.plainEnglishAnswer ?? c.plainEnglishAnswer,
          investorInsight: oc.investorInsight ?? c.investorInsight
        };
      })
    };
  }

  const mergedQuiz = mergeQuizConfig(override.quizConfig, next.quizConfig);
  if (mergedQuiz) {
    next = { ...next, quizConfig: mergedQuiz };
  }

  return next;
}

/** All quests for a company within a single pillar. */
export function getCompanyPillarQuests(
  companyId: CompanyId,
  pillarId: PillarId
): QuestDefinition[] {
  const company = companyById(companyId);
  const templates = getPillarQuestTemplates(pillarId);
  return templates.map((t) => instantiate(t, company));
}

/** All quests for a company across every pillar. */
export function getCompanyQuests(companyId: CompanyId): QuestDefinition[] {
  return PILLAR_ORDER.flatMap((pid) => getCompanyPillarQuests(companyId, pid));
}

/** Look up a single quest by company + pillar + slug. */
export function findQuestDefinition(
  companyId: CompanyId,
  pillarId: PillarId,
  slug: string
): QuestDefinition | null {
  const company = companyById(companyId);
  const template = getPillarQuestTemplates(pillarId).find((t) => t.slug === slug);
  return template ? instantiate(template, company) : null;
}

/** Count of quest templates per pillar — useful for "n quests" labels. */
export function pillarQuestCount(pillarId: PillarId): number {
  return getPillarQuestTemplates(pillarId).length;
}

/** Raw template access (no company binding) — Supabase cache with demo fallback. */
export function getPillarTemplates(pillarId: PillarId): readonly QuestTemplate[] {
  return getPillarQuestTemplates(pillarId);
}
