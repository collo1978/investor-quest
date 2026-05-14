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
import {
  contentKey,
  getQuestContentOverride,
  type QuestContentOverride
} from "@/data/quests/content";

import { BUSINESS_QUEST_TEMPLATES } from "@/data/quests/templates/business";
import { FORCES_QUEST_TEMPLATES } from "@/data/quests/templates/forces";
import { FINANCIALS_QUEST_TEMPLATES } from "@/data/quests/templates/financials";
import { MANAGEMENT_QUEST_TEMPLATES } from "@/data/quests/templates/management";

const TEMPLATES_BY_PILLAR: Record<PillarId, readonly QuestTemplate[]> = {
  business: BUSINESS_QUEST_TEMPLATES,
  forces: FORCES_QUEST_TEMPLATES,
  financials: FINANCIALS_QUEST_TEMPLATES,
  management: MANAGEMENT_QUEST_TEMPLATES
};

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
    cards: template.cards
      ? template.cards.map((c) => ({
          id: c.id,
          investorQuestion: fillTokens(c.investorQuestion, company),
          plainEnglishAnswer: c.plainEnglishAnswer
            ? fillTokens(c.plainEnglishAnswer, company)
            : null,
          whyItMatters: fillTokens(c.whyItMatters, company)
        }))
      : undefined
  };

  const override = getQuestContentOverride(
    company.id,
    contentKey(template.pillarId, template.slug)
  );
  return override ? applyContentOverride(base, override) : base;
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

  if (override.cards && next.cards) {
    next = {
      ...next,
      cards: next.cards.map((c) => {
        const oc = override.cards?.[c.id];
        if (!oc) return c;
        return {
          ...c,
          plainEnglishAnswer: oc.plainEnglishAnswer ?? c.plainEnglishAnswer
        };
      })
    };
  }

  if (override.quizConfig && !next.quizConfig) {
    next = { ...next, quizConfig: override.quizConfig };
  }

  return next;
}

/** All quests for a company within a single pillar. */
export function getCompanyPillarQuests(
  companyId: CompanyId,
  pillarId: PillarId
): QuestDefinition[] {
  const company = companyById(companyId);
  const templates = TEMPLATES_BY_PILLAR[pillarId] ?? [];
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
  const template = TEMPLATES_BY_PILLAR[pillarId]?.find((t) => t.slug === slug);
  return template ? instantiate(template, company) : null;
}

/** Count of quest templates per pillar — useful for "n quests" labels. */
export function pillarQuestCount(pillarId: PillarId): number {
  return TEMPLATES_BY_PILLAR[pillarId]?.length ?? 0;
}

/** Raw template access (no company binding) — used by SEC layer scaffolding. */
export function getPillarTemplates(pillarId: PillarId): readonly QuestTemplate[] {
  return TEMPLATES_BY_PILLAR[pillarId] ?? [];
}
