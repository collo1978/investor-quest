/**
 * True/False quiz eligibility — objective, single-fact, standalone statements.
 *
 * T/F must test recall of one company fact from lesson or 10-K content.
 */
import type { MultipleChoiceQuestion, TrueFalseQuestion } from "@/data/quests/types";

/** Learner self-assessment or meta prompts — never valid T/F statements. */
const SELF_ASSESSMENT_PATTERNS = [
  /^you (understand|know|should|can|need to|must|ought|start|are getting|have learned|'ve learned)/i,
  /^if you (can|know|understand|name)/i,
  /^knowing .+ helps you/i,
  /^understanding .+ helps you/i,
  /^a good (test|sign|one-line test|check)/i,
  /^can you explain/i,
  /^after this section/i,
  /^what should you/i,
  /^why should (you|an investor)/i,
  /^before you (worry|judge|buy)/i,
  /^investors? should (feel|believe|know they)/i,
  /^learners? /i,
  /\bhelps you (understand|judge|learn|know|feel|see)\b/i,
  /\bbetter than memorizing\b/i,
  /\byou actually understand\b/i,
  /\bin plain words\b/i,
  /^yes — /i,
  /^no — only jargon/i
] as const;

/** Lesson narration — sounds like teaching, not a factual claim. */
const LESSON_NARRATION_PATTERNS = [
  /^they\b/i,
  /^how they\b/i,
  /^when (one|bosses)\b/i,
  /^people (still|often)\b/i,
  /^here\b/i,
  /^remember\b/i,
  /^this (company|slice|line|section)\b/i,
  /\bhints at\b/i,
  /\bcan be a sign\b/i,
  /\bstill (watch|help|hurt)\b/i,
  /\bbet big on\b/i,
  /\bfeel it when\b/i,
  /\bcan still help the stock\b/i,
  /\bthat's (how|why|the)\b/i,
  /\bthe goal is\b/i,
  /\bbuilds a base\b/i,
  /\bwhat the company does\b/i,
  /\boverview (only|facts tell you)\b/i,
  /\bday traders\b/i,
  /\bnever matter again\b/i,
  /\bfair stock price\b/i
] as const;

/** Compound claims — more than one testable fact in one statement. */
const COMPOUND_FACT_PATTERNS = [
  /\beven when\b/i,
  /\beven if\b/i,
  /\bwhile still\b/i,
  /\bnot only\b.+\bbut\b/i,
  /,[^,]{4,},[^,]{4,},\s*and\s+[^,]{4,}\s+(are|is|were|was|can|have|has)\b/i,
  /\b(one|a single) .+ (and|or) (one|another|a)\b/i
] as const;

const FINITE_VERB_RE =
  /\b(is|are|was|were|has|have|had|help(s|ed)?|depends?|depended|sells?|sold|makes?|made|earns?|earned|builds?|built|designs?|designed|employs?|employed|spans?|spanned|focuses?|focused|uses?|used|reports?|reported|can|cannot|could|does|do|did|will|would|primarily|mainly|operates?|operated|includes?|included|provides?|provided|develops?|developed|relies?|relied|faces?|faced|shows?|showed|owns?|owned|runs?|ran|licenses?|licensed|trains?|trained|powers?|powered|serves?|served|targets?|targeted|invests?|invested|commits?|committed|returns?|returned|votes?|voted|receives?|received|spends?|spent|lists?|listed|reviews?|reviewed|files?|filed|rises?|rose|falls?|fell|grows?|grew|manufactures?|manufactured|produces?|produced|holds?|held|offers?|offered|generates?|generated|publishes?|published|discloses?|disclosed|announces?|announced|distributes?|distributed|maintains?|maintained|creates?|created|purchases?|purchased|acquires?|acquired|launches?|launched)\b/i;

const COMPANY_TOKEN_SUBJECT_RE = /^\{Company\.(name|ticker)\}\b/;

const COMPANY_SUBJECT_RE =
  /\{Company\.(name|ticker)\}|\bNVIDIA\b|\bApple\b|\bAMD\b|\bIntel\b|\bthe company\b/i;

const VERB_FIRST_FRAGMENT_RE =
  /^(designs|builds|sells|earns|employs|operates|makes|has|is|are|can|cannot|does|do|primarily|mainly|helps|includes|provides|develops|relies|depends|faces|focuses|uses|spans|runs|owns|licenses|powers|serves|targets)\b/i;

export type TrueFalsePromptIssue =
  | "empty"
  | "too_short"
  | "self_assessment"
  | "lesson_narration"
  | "compound_fact"
  | "not_standalone";

export function getTrueFalsePromptIssue(prompt: string): TrueFalsePromptIssue | null {
  const trimmed = prompt.trim();
  if (!trimmed) return "empty";
  if (trimmed.length < 12) return "too_short";
  if (isSelfAssessmentQuizPrompt(trimmed)) return "self_assessment";
  if (isLessonNarrationPrompt(trimmed)) return "lesson_narration";
  if (hasCompoundTrueFalseFact(trimmed)) return "compound_fact";
  if (!isStandaloneFactualClaim(trimmed)) return "not_standalone";
  return null;
}

export function isSelfAssessmentQuizPrompt(prompt: string): boolean {
  const trimmed = prompt.trim();
  if (!trimmed) return true;
  return SELF_ASSESSMENT_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function isLessonNarrationPrompt(prompt: string): boolean {
  const trimmed = prompt.trim();
  if (!trimmed) return false;
  return LESSON_NARRATION_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function hasCompoundTrueFalseFact(prompt: string): boolean {
  const trimmed = prompt.trim();
  return COMPOUND_FACT_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/** A reader can judge true/false without seeing the lesson cards. */
export function isStandaloneFactualClaim(prompt: string): boolean {
  const trimmed = prompt.trim();
  if (!trimmed) return false;

  // {Company.name} is an explicit runtime subject — only require a predicate.
  if (COMPANY_TOKEN_SUBJECT_RE.test(trimmed)) {
    return trimmed.length >= 24 && hasPredicateClaim(trimmed);
  }

  if (isLessonNarrationPrompt(trimmed)) return false;
  if (VERB_FIRST_FRAGMENT_RE.test(trimmed)) return false;
  if (!FINITE_VERB_RE.test(trimmed)) return false;
  if (COMPANY_SUBJECT_RE.test(trimmed)) return true;

  // Noun-phrase subject + predicate (e.g. "GPUs help…", "Gamers are…", "Customers prefer…")
  if (/^[A-Z][A-Za-z0-9''-]/.test(trimmed)) {
    return !/^(They|It|This|These|Those|Here|When|How|People)\b/.test(trimmed);
  }

  return false;
}

function hasPredicateClaim(text: string): boolean {
  return FINITE_VERB_RE.test(text);
}

export function isObjectiveTrueFalsePrompt(prompt: string): boolean {
  return getTrueFalsePromptIssue(prompt) == null;
}

export function canChoiceSupportTrueFalse(choice: string): boolean {
  return isObjectiveTrueFalsePrompt(normalizeTrueFalseStatement(choice));
}

/**
 * Turn an MC answer into a complete T/F statement.
 * Prefixes {Company.name} when the choice is a verb phrase or bare list.
 */
export function normalizeTrueFalseStatement(choice: string): string {
  let trimmed = choice.trim();
  if (!trimmed) return trimmed;

  if (/^it\b/i.test(trimmed)) {
    trimmed = trimmed.replace(/^it\b/i, "{Company.name}");
  }

  if (COMPANY_SUBJECT_RE.test(trimmed) && FINITE_VERB_RE.test(trimmed)) {
    return trimmed.endsWith(".") ? trimmed : `${trimmed}.`;
  }

  if (!FINITE_VERB_RE.test(trimmed)) {
    const list = trimmed.replace(/\.$/, "");
    return `{Company.name} sells products to ${lcFirst(list)}.`;
  }

  if (VERB_FIRST_FRAGMENT_RE.test(trimmed)) {
    return `{Company.name} ${lcFirst(trimmed.replace(/\.$/, ""))}.`;
  }

  return trimmed.endsWith(".") ? trimmed : `${trimmed}.`;
}

function lcFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/**
 * True when a multiple-choice source can become an objective T/F question.
 */
export function canMcSupportTrueFalse(mc: MultipleChoiceQuestion): boolean {
  if (mc.supportsTrueFalse === false) return false;
  if (mc.trueFalseStatement?.trim()) {
    return isObjectiveTrueFalsePrompt(mc.trueFalseStatement);
  }

  const correct = mc.choices[mc.correctIndex];
  if (correct && canChoiceSupportTrueFalse(correct)) return true;

  return mc.choices.some(
    (choice, index) =>
      index !== mc.correctIndex && canChoiceSupportTrueFalse(choice)
  );
}

export function assertObjectiveTrueFalsePrompt(
  prompt: string,
  context?: string
): void {
  const issue = getTrueFalsePromptIssue(prompt);
  if (!issue) return;
  const prefix = context ? `${context}: ` : "";
  const messages: Record<TrueFalsePromptIssue, string> = {
    empty: "True/False prompt is empty",
    too_short: "True/False must be a complete factual statement",
    self_assessment:
      "True/False must not ask about the learner's understanding or confidence",
    lesson_narration:
      "True/False must be a factual claim, not lesson narration",
    compound_fact:
      "True/False must test one specific company fact — not multiple combined concepts",
    not_standalone:
      "True/False must stand alone with a clear subject and verb — readable without the lesson"
  };
  throw new Error(
    `${prefix}${messages[issue]} ("${prompt.slice(0, 72)}…")`
  );
}

export function validateTrueFalseQuestion(question: TrueFalseQuestion): boolean {
  return isObjectiveTrueFalsePrompt(question.prompt);
}

/** Stand-alone rule for every quiz question kind (AI + authored). */
export function getStandaloneQuizPromptIssue(prompt: string): string | null {
  const trimmed = prompt.trim();
  if (!trimmed) return "empty";
  // Direct questions (MC, scenario, etc.) are stand-alone by definition.
  if (trimmed.endsWith("?")) return null;
  if (/^(complete the sentence|put these in order|which answer does not fit|pair each)/i.test(trimmed)) {
    return null;
  }
  if (trimmed.includes("\n")) return null;
  if (isLessonNarrationPrompt(trimmed)) {
    return "sounds like lesson narration — use a direct factual question";
  }
  return null;
}

export function assertStandaloneQuizPrompt(prompt: string, context?: string): void {
  const issue = getStandaloneQuizPromptIssue(prompt);
  if (!issue) return;
  const prefix = context ? `${context}: ` : "";
  throw new Error(`${prefix}Quiz prompt must stand on its own ("${prompt.slice(0, 72)}…")`);
}

export const QUIZ_STANDALONE_RULE_TEXT = `
Every quiz question must stand on its own.
- A player should understand what is being asked without seeing the lesson cards.
- Use direct factual claims or clear questions — not lesson narration ("They bet big on…", "How they spend cash hints at…").
- True/False: one objective statement with a clear subject and verb (e.g. "NVIDIA sells products to cloud providers and gamers.").
- Reject and regenerate if the statement sounds like teaching voice instead of a testable fact.
`.trim();

export const TRUE_FALSE_RULE_TEXT = `
True/False (required)
- One objective statement — true or false from company facts in the lesson or 10-K.
- Test one specific fact; do not combine unrelated concepts in one statement.
- Never learner self-assessment: no "You understand…", "You know…", "You've learned…".
- Good: "NVIDIA primarily makes money by selling smartphones." (false)
- Good: "Gamers are one of NVIDIA's customer groups." (true)
- Bad: "You should understand what NVIDIA sells before worrying about the stock price."
- Bad: "Earnings per share can rise even when net income is flat if the share count shrinks." (two concepts)
`.trim();
