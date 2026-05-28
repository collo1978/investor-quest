import { warningMessage } from "@/lib/communicationQuality/categoryLabels";
import {
  AI_PHRASE_PATTERNS,
  CORPORATE_PHRASE_PATTERNS,
  EM_DASH_PATTERN,
  extractMainStory,
  FINANCE_JARGON_PATTERNS,
  FORCED_ANALOGY_PATTERNS,
  GENERIC_CUSTOMER_AUDIENCE_PATTERNS,
  INVESTOR_DRIFT_PATTERNS,
  scanPatterns,
  SOFT_JARGON_PATTERNS,
  splitSentences,
  TECH_JARGON_PATTERNS,
  TEXTBOOK_PATTERNS
} from "@/lib/communicationQuality/patterns";
import type {
  CommunicationCategoryId,
  CommunicationContentAudit,
  CommunicationSeverity,
  CommunicationWarning
} from "@/lib/communicationQuality/types";
import { hasGenericCustomerAudiencePhrasing } from "@/lib/quests/customerAudienceCopy";
import {
  analyzeHumanFirstStructure,
  type QuestionIntentContext
} from "@/lib/quests/humanFirstExplanation";
import {
  answerDriftsFromQuestion,
  CUSTOMER_PROBLEM_FOCUS_RE,
  hasCustomerProblemMetaOpening,
  INVESTOR_DRIFT_IN_MAIN_RE
} from "@/lib/quests/questionFocusGate";
import {
  analyzeQuestJargonGate,
  findJargonHits
} from "@/lib/quests/questJargonGate";
import { detectQuestionIntent } from "@/lib/quests/questionIntent";

export type CommunicationAuditInput = {
  text: string;
  contentId: string;
  kind: CommunicationContentAudit["kind"];
  ticker?: string;
  companyName?: string;
  pillarId?: string;
  questSlug?: string;
  cardId?: string;
  source?: string;
  question?: string;
  placeholder?: boolean;
  intentContext?: QuestionIntentContext;
};

const SEVERITY_PENALTY: Record<CommunicationSeverity, number> = {
  critical: 35,
  warning: 18,
  info: 8
};

function addWarning(
  bucket: Map<CommunicationCategoryId, CommunicationWarning[]>,
  categoryId: CommunicationCategoryId,
  code: string,
  severity: CommunicationSeverity,
  snippet?: string
) {
  const list = bucket.get(categoryId) ?? [];
  if (list.some((w) => w.code === code)) return;
  list.push({
    code,
    categoryId,
    severity,
    message: warningMessage(code, snippet),
    snippet
  });
  bucket.set(categoryId, list);
}

function scoreFromWarnings(warnings: CommunicationWarning[]): number {
  if (warnings.length === 0) return 100;
  let penalty = 0;
  for (const w of warnings) {
    penalty += SEVERITY_PENALTY[w.severity];
  }
  return Math.max(0, Math.min(100, 100 - penalty));
}

function flattenWarnings(
  bucket: Map<CommunicationCategoryId, CommunicationWarning[]>
): CommunicationWarning[] {
  return [...bucket.values()].flat();
}

/** Audit one player-facing text block across all eight communication dimensions. */
export function auditCommunicationText(
  input: CommunicationAuditInput
): CommunicationContentAudit {
  const text = input.text?.trim() ?? "";
  const preview = text.length <= 140 ? text : `${text.slice(0, 140)}…`;
  const byCategory = new Map<CommunicationCategoryId, CommunicationWarning[]>();

  if (input.placeholder || !text) {
    const code = input.placeholder ? "template_fallback" : "empty";
    for (const cat of [
      "conversational_tone",
      "beginner_friendliness",
      "human_tone",
      "investor_clarity"
    ] as CommunicationCategoryId[]) {
      addWarning(byCategory, cat, code, "critical");
    }
    const warnings = flattenWarnings(byCategory);
    return {
      contentId: input.contentId,
      kind: input.kind,
      ticker: input.ticker,
      companyName: input.companyName,
      pillarId: input.pillarId,
      questSlug: input.questSlug,
      cardId: input.cardId,
      source: input.source ?? "unknown",
      question: input.question,
      preview,
      bodyText: text,
      score: 0,
      warnings,
      needsRegeneration: true,
      placeholder: true
    };
  }

  const mainStory = extractMainStory(text);
  const intentCtx: QuestionIntentContext = {
    pillarId: input.pillarId,
    questSlug: input.questSlug,
    cardId: input.cardId,
    cardQuestion: input.question,
    ...input.intentContext
  };
  const intent = detectQuestionIntent(intentCtx);
  const humanFirst = analyzeHumanFirstStructure(text, null, intentCtx);
  const jargonGate = analyzeQuestJargonGate(text, null, {
    pillarId: input.pillarId,
    questSlug: input.questSlug,
    cardId: input.cardId,
    cardQuestion: input.question
  });

  for (const hit of findJargonHits(text)) {
    const code = hit.label.toLowerCase().replace(/\s+/g, "_");
    addWarning(
      byCategory,
      "jargon_detection",
      hit.severity === "hard" ? "hard_jargon" : code,
      hit.severity === "hard" ? "critical" : "warning",
      hit.snippet
    );
    addWarning(byCategory, "beginner_friendliness", code, "warning", hit.snippet);
  }

  for (const group of [
    CORPORATE_PHRASE_PATTERNS,
    FINANCE_JARGON_PATTERNS,
    TECH_JARGON_PATTERNS,
    SOFT_JARGON_PATTERNS
  ]) {
    for (const hit of scanPatterns(text, group)) {
      addWarning(byCategory, "jargon_detection", hit.id, "warning", hit.snippet);
      addWarning(byCategory, "beginner_friendliness", hit.id, "warning", hit.snippet);
    }
  }

  if (EM_DASH_PATTERN.re.test(text)) {
    addWarning(byCategory, "conversational_tone", "em_dash", "warning");
    addWarning(byCategory, "cognitive_load", "em_dash", "info");
  }

  for (const hit of scanPatterns(text, AI_PHRASE_PATTERNS)) {
    addWarning(byCategory, "human_tone", hit.id, "critical", hit.snippet);
    addWarning(byCategory, "conversational_tone", hit.id, "warning", hit.snippet);
  }

  for (const hit of scanPatterns(text, FORCED_ANALOGY_PATTERNS)) {
    addWarning(byCategory, "human_tone", hit.id, "critical", hit.snippet);
    addWarning(byCategory, "conversational_tone", hit.id, "warning", hit.snippet);
  }

  if (humanFirst.hasCinematicFiller) {
    addWarning(byCategory, "human_tone", "cinematic_filler", "critical");
    addWarning(byCategory, "conversational_tone", "cinematic_filler", "warning");
  }

  if (humanFirst.hasEmDash || EM_DASH_PATTERN.re.test(text)) {
    addWarning(byCategory, "human_tone", "em_dash", "critical");
    addWarning(byCategory, "conversational_tone", "em_dash", "critical");
  }

  if (
    intent === "target_customer" ||
    (input.question &&
      /\bwho (?:are|is|buys|pays)\b/i.test(input.question) &&
      /\bcustomers?\b/i.test(input.question))
  ) {
    for (const hit of scanPatterns(mainStory, GENERIC_CUSTOMER_AUDIENCE_PATTERNS)) {
      addWarning(byCategory, "human_tone", hit.id, "critical", hit.snippet);
      addWarning(byCategory, "investor_clarity", hit.id, "critical", hit.snippet);
      addWarning(byCategory, "question_alignment", "generic_customer_audience", "critical");
    }
    if (hasGenericCustomerAudiencePhrasing(mainStory)) {
      addWarning(
        byCategory,
        "question_alignment",
        "generic_customer_audience",
        "critical"
      );
    }
    if (humanFirst.flags.includes("missing_target_customer_focus")) {
      addWarning(
        byCategory,
        "investor_clarity",
        "missing_target_customer_focus",
        "warning"
      );
    }
  }

  if (humanFirst.hasCorporateOpening) {
    addWarning(byCategory, "human_tone", "corporate_opening", "warning");
    addWarning(byCategory, "conversational_tone", "corporate_opening", "warning");
  }

  for (const hit of scanPatterns(text, TEXTBOOK_PATTERNS)) {
    addWarning(byCategory, "conversational_tone", hit.id, "critical", hit.snippet);
  }

  for (const hit of scanPatterns(text, CORPORATE_PHRASE_PATTERNS)) {
    addWarning(byCategory, "conversational_tone", hit.id, "warning", hit.snippet);
  }

  if (humanFirst.hasQuestionDrift || humanFirst.flags.includes("question_drift")) {
    addWarning(byCategory, "question_alignment", "question_drift", "critical");
  }

  if (
    intent === "customer_problem" &&
    input.question &&
    (!CUSTOMER_PROBLEM_FOCUS_RE.test(mainStory) || hasCustomerProblemMetaOpening(mainStory))
  ) {
    addWarning(
      byCategory,
      "question_alignment",
      "question_drift_problem",
      "critical"
    );
  }

  if (
    input.question &&
    answerDriftsFromQuestion({
      intent,
      cardQuestion: input.question,
      mainStory
    })
  ) {
    addWarning(byCategory, "question_alignment", "question_drift", "critical");
  }

  for (const hit of scanPatterns(mainStory, INVESTOR_DRIFT_PATTERNS)) {
    if (
      intent !== "financials" &&
      intent !== "target_customer" &&
      input.kind === "quest_card"
    ) {
      addWarning(byCategory, "investor_clarity", hit.id, "warning", hit.snippet);
      addWarning(byCategory, "question_alignment", "investor_drift", "warning", hit.snippet);
    }
  }

  if (
    INVESTOR_DRIFT_IN_MAIN_RE.test(mainStory) &&
    intent !== "financials" &&
    intent !== "target_customer"
  ) {
    addWarning(byCategory, "investor_clarity", "investor_drift", "warning");
  }

  if (
    input.kind === "quest_card" &&
    humanFirst.missingWhyInvestorsCare &&
    !/\bwhy investors care:/i.test(text)
  ) {
    addWarning(byCategory, "investor_clarity", "missing_why_investors_care", "warning");
  }

  if (!humanFirst.hasRealLifeOpening && input.kind === "quest_card") {
    addWarning(byCategory, "emotional_clarity", "missing_real_life", "warning");
  }

  if (humanFirst.flags.includes("missing_problem_focus")) {
    addWarning(byCategory, "emotional_clarity", "question_drift_problem", "warning");
  }

  const wordCount = mainStory.split(/\s+/).filter(Boolean).length;
  const sentences = splitSentences(mainStory);
  const avgWords =
    sentences.length > 0 ? wordCount / sentences.length : wordCount;

  if (wordCount > 95 || humanFirst.tooLong) {
    addWarning(byCategory, "cognitive_load", "too_long", "warning");
  }

  if (avgWords > 22 || sentences.some((s) => s.split(/\s+/).length > 28)) {
    addWarning(byCategory, "cognitive_load", "dense_sentences", "warning");
  }

  if (!jargonGate.pass && jargonGate.rewriteRequired) {
    addWarning(byCategory, "beginner_friendliness", "hard_jargon", "critical");
  }

  const warnings = flattenWarnings(byCategory);
  const score = scoreFromWarnings(warnings);
  const needsRegeneration =
    score < 70 ||
    warnings.some((w) => w.severity === "critical") ||
    (input.kind === "quest_card" &&
      warnings.some((w) =>
        ["question_drift", "generic_customer_audience", "em_dash", "cinematic_filler"].includes(
          w.code
        )
      ));

  return {
    contentId: input.contentId,
    kind: input.kind,
    ticker: input.ticker,
    companyName: input.companyName,
    pillarId: input.pillarId,
    questSlug: input.questSlug,
    cardId: input.cardId,
    source: input.source ?? "unknown",
    question: input.question,
    preview,
    bodyText: text,
    score,
    warnings,
    needsRegeneration,
    placeholder: false
  };
}
