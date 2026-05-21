import type { PillarId } from "@/data/pillars";
import { BUSINESS_QUEST_SYSTEM_PROMPT } from "@/lib/ai/businessQuestPrompt";
import { FINANCIAL_QUEST_SYSTEM_PROMPT } from "@/lib/ai/financialQuestPrompt";
import { FORCES_QUEST_SYSTEM_PROMPT } from "@/lib/ai/forcesQuestPrompt";
import { MANAGEMENT_QUEST_SYSTEM_PROMPT } from "@/lib/ai/managementQuestPrompt";
import type { PromptTemplateScope } from "@/lib/supabase/promptTemplates/types";

/** Placeholders documented in Prompt Studio. */
export const PROMPT_TEMPLATE_VARIABLES = [
  "companyName",
  "ticker",
  "questTitle",
  "questAiTask",
  "cardId",
  "cardQuestion",
  "cardPromptFocus",
  "priorCardsBlock",
  "excerptBlocks",
  "filingLabel",
  "forceTopicTitle",
  "valenceLabel",
  "scopeLabel",
  "keywordMatch",
  "filteredExcerpt"
] as const;

export const DEFAULT_USER_PROMPT_TEMPLATE = `Company: {{companyName}} ({{ticker}})
Quest: {{questTitle}}
Quest goal: {{questAiTask}}
This card: {{cardId}}
Card question: {{cardQuestion}}
Focus ONLY on: {{cardPromptFocus}}
{{priorCardsBlock}}{{filingLabel}}
{{excerptBlocks}}

Write the answer: max 4 short sentences (everyday moment → analogy → what they do for THIS card); then one-line Why investors care.`;

export const DEFAULT_FORCES_USER_PROMPT_TEMPLATE = `Company: {{companyName}} ({{ticker}})
Force topic: {{forceTopicTitle}}
Category: {{valenceLabel}} {{scopeLabel}} force
Quest: {{questTitle}}
Question: {{cardQuestion}}
Focus: {{cardPromptFocus}}
Keyword match in Item 1A: {{keywordMatch}}

Item 1A — Risk Factors (filtered excerpt):
{{filteredExcerpt}}

Write the answer: max 4 short sentences (everyday moment → analogy → this force in plain English); then one-line Why investors care.`;

const SYSTEM_BY_PILLAR: Record<PillarId, string> = {
  business: BUSINESS_QUEST_SYSTEM_PROMPT,
  financials: FINANCIAL_QUEST_SYSTEM_PROMPT,
  management: MANAGEMENT_QUEST_SYSTEM_PROMPT,
  forces: FORCES_QUEST_SYSTEM_PROMPT
};

const USER_BY_PILLAR: Record<PillarId, string> = {
  business: DEFAULT_USER_PROMPT_TEMPLATE.replace(
    "{{filingLabel}}",
    "SEC filing excerpts (10-K — Business / related sections):\n"
  ),
  financials: DEFAULT_USER_PROMPT_TEMPLATE.replace(
    "{{filingLabel}}",
    "SEC filing excerpts (10-K):\n"
  ),
  management: DEFAULT_USER_PROMPT_TEMPLATE.replace(
    "{{filingLabel}}",
    "SEC filing excerpts:\n"
  ),
  forces: DEFAULT_FORCES_USER_PROMPT_TEMPLATE
};

const FILING_LABELS: Record<PillarId, string> = {
  business: "SEC filing excerpts (10-K — Business / related sections):\n",
  financials: "SEC filing excerpts (10-K):\n",
  management: "SEC filing excerpts:\n",
  forces: ""
};

export function formatPromptTemplateKey(
  scope: PromptTemplateScope,
  pillarId: PillarId,
  questSlug?: string | null
): string {
  const base = `${scope}:${pillarId}`;
  return questSlug?.trim() ? `${base}:${questSlug.trim()}` : base;
}

export function parsePromptTemplateKey(key: string): {
  scope: PromptTemplateScope;
  pillarId: PillarId;
  questSlug: string | null;
} | null {
  const parts = key.split(":");
  if (parts.length < 2) return null;
  const scope = parts[0];
  const pillarId = parts[1];
  if (scope !== "system" && scope !== "user") return null;
  if (
    pillarId !== "business" &&
    pillarId !== "forces" &&
    pillarId !== "financials" &&
    pillarId !== "management"
  ) {
    return null;
  }
  const questSlug = parts.length > 2 ? parts.slice(2).join(":") : null;
  return { scope, pillarId, questSlug };
}

export function getCodeDefaultSystemPrompt(pillarId: PillarId): string {
  return SYSTEM_BY_PILLAR[pillarId];
}

export function getCodeDefaultUserTemplate(pillarId: PillarId): string {
  return USER_BY_PILLAR[pillarId];
}

export function getDefaultFilingLabel(pillarId: PillarId): string {
  return FILING_LABELS[pillarId];
}

export type CodeDefaultTemplate = {
  templateKey: string;
  scope: PromptTemplateScope;
  pillarId: PillarId;
  questSlug: string | null;
  label: string;
  description: string;
  body: string;
};

/** Change note stamped on Prompt Studio sync / reset from code defaults. */
export const SYNC_FROM_CODE_CHANGE_NOTE =
  "Synced from code defaults — teenager picture test, zero tech jargon, auto-rewrite gate";

export function getCodeDefaultForTemplateKey(
  templateKey: string
): CodeDefaultTemplate | null {
  return listCodeDefaultTemplates().find((d) => d.templateKey === templateKey) ?? null;
}

export function listCodeDefaultTemplates(): CodeDefaultTemplate[] {
  const pillars: PillarId[] = ["business", "financials", "management", "forces"];
  const out: CodeDefaultTemplate[] = [];

  for (const pillarId of pillars) {
    const pillarLabel =
      pillarId.charAt(0).toUpperCase() + pillarId.slice(1);

    out.push({
      templateKey: formatPromptTemplateKey("system", pillarId),
      scope: "system",
      pillarId,
      questSlug: null,
      label: `${pillarLabel} — System prompt`,
      description:
        "GPT role, voice, format rules, and card-focus guardrails for this island.",
      body: getCodeDefaultSystemPrompt(pillarId)
    });

    out.push({
      templateKey: formatPromptTemplateKey("user", pillarId),
      scope: "user",
      pillarId,
      questSlug: null,
      label: `${pillarLabel} — User prompt template`,
      description:
        "Per-card user message wrapper. Use {{excerptBlocks}}, {{priorCardsBlock}}, and other variables — SEC excerpts are injected automatically.",
      body: getCodeDefaultUserTemplate(pillarId)
    });
  }

  return out;
}
