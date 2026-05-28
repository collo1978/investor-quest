/**
 * Global quest answer validator — run before render, save, or admin audit.
 */

import {
  analyzeHumanFirstStructure,
  type QuestionIntentContext
} from "@/lib/quests/humanFirstExplanation";
import {
  countWords,
  hasBannedCopySection,
  QUEST_COPY_LIMITS,
  scanBannedPhrases,
  type BannedPhraseHit
} from "@/lib/quests/questCopyRules";
import {
  formatQuestCardCopy,
  formatPlayerCopy
} from "@/lib/quests/questAnswerFormatter";
import { extractMainStory } from "@/lib/communicationQuality/patterns";
import { detectQuestionIntent } from "@/lib/quests/questionIntent";

export type QuestCopyIssueSeverity = "error" | "warn" | "info";

export type QuestCopyIssue = {
  code: string;
  severity: QuestCopyIssueSeverity;
  message: string;
  snippet?: string;
};

export type QuestCopyValidationResult = {
  pass: boolean;
  score: number;
  issues: QuestCopyIssue[];
  bannedHits: BannedPhraseHit[];
  humanFirstFlags: string[];
  intent: string;
};

export type QuestCopyValidationContext = QuestionIntentContext & {
  kind?: "quest_card" | "quiz_explain" | "ui_copy";
  placeholder?: boolean;
};

function scoreFromIssues(issues: QuestCopyIssue[]): number {
  let score = 100;
  for (const i of issues) {
    if (i.severity === "error") score -= 22;
    else if (i.severity === "warn") score -= 12;
    else score -= 5;
  }
  return Math.max(0, Math.min(100, score));
}

export function validateQuestCopy(
  text: string,
  ctx: QuestCopyValidationContext = {}
): QuestCopyValidationResult {
  const issues: QuestCopyIssue[] = [];
  const trimmed = text?.trim() ?? "";

  if (ctx.placeholder || !trimmed) {
    return {
      pass: false,
      score: 0,
      issues: [{ code: "empty", severity: "error", message: "No answer text" }],
      bannedHits: [],
      humanFirstFlags: [],
      intent: detectQuestionIntent(ctx)
    };
  }

  const bannedHits = scanBannedPhrases(trimmed);
  for (const hit of bannedHits) {
    issues.push({
      code: hit.id,
      severity: hit.category === "dash" ? "error" : "warn",
      message: hit.label,
      snippet: hit.match
    });
  }

  if (hasBannedCopySection(trimmed)) {
    issues.push({
      code: "banned_section",
      severity: "error",
      message: "Contains banned section (Investor Insight, How to read this, etc.)"
    });
  }

  const mainStory = extractMainStory(trimmed);
  const wordCount = countWords(mainStory);
  const kind = ctx.kind ?? "quest_card";

  if (kind === "quest_card") {
    if (wordCount > QUEST_COPY_LIMITS.maxMainStoryWords) {
      issues.push({
        code: "too_long",
        severity: "warn",
        message: `Main story is ${wordCount} words (max ${QUEST_COPY_LIMITS.maxMainStoryWords})`
      });
    }

    const whyCount =
      (trimmed.match(/\n\s*Why investors care:/gi) ?? []).length +
      (trimmed.match(/\n\s*Why it matters:/gi) ?? []).length;
    const hasSeparateInsight = /\n\s*Investor insight:/i.test(trimmed);
    if (whyCount > 1 || (whyCount > 0 && hasSeparateInsight)) {
      issues.push({
        code: "duplicate_why",
        severity: "warn",
        message: "Repeated why / investor explanation"
      });
    }
  }

  if (kind === "quiz_explain" && wordCount > QUEST_COPY_LIMITS.maxQuizExplainWords) {
    issues.push({
      code: "quiz_explain_long",
      severity: "warn",
      message: "Quiz explanation is too long"
    });
  }

  const humanFirst = analyzeHumanFirstStructure(trimmed, null, ctx);
  if (!humanFirst.pass) {
    for (const flag of humanFirst.flags) {
      issues.push({
        code: flag,
        severity: "error",
        message: `Voice gate: ${flag.replace(/_/g, " ")}`
      });
    }
  }

  const score = scoreFromIssues(issues);
  const hasErrors = issues.some((i) => i.severity === "error");

  return {
    pass: !hasErrors && humanFirst.pass && score >= 70,
    score,
    issues,
    bannedHits,
    humanFirstFlags: humanFirst.flags,
    intent: humanFirst.intent
  };
}

/**
 * Auto-clean using formatter; returns best-effort player-ready copy.
 */
export function suggestCleanedQuestCopy(
  text: string,
  ctx: QuestCopyValidationContext = {}
): string {
  const trimmed = text?.trim();
  if (!trimmed) return "";

  const kind = ctx.kind ?? "quest_card";

  if (kind === "quest_card") {
    const formatted = formatQuestCardCopy({
      plainEnglishAnswer: trimmed,
      displayMode: "storage"
    });
    if (formatted?.plainEnglishAnswer) return formatted.plainEnglishAnswer;
  }

  return formatPlayerCopy(trimmed);
}

export function validateAndCleanQuestCopy(
  text: string,
  ctx: QuestCopyValidationContext = {}
): {
  validation: QuestCopyValidationResult;
  cleaned: string;
  changed: boolean;
} {
  const cleaned = suggestCleanedQuestCopy(text, ctx);
  const validation = validateQuestCopy(cleaned, ctx);
  return {
    validation,
    cleaned,
    changed: cleaned.trim() !== text.trim()
  };
}
