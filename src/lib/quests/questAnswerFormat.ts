import { sanitizeQuestAnswerText } from "@/lib/quests/sanitizeQuestAnswer";
import { formatQuestCardCopy } from "@/lib/quests/questAnswerFormatter";

export {
  QUEST_BEGINNER_VOICE,
  QUEST_ANSWER_FORMAT,
  HUMAN_FIRST_WRITE_INSTRUCTION,
  HUMAN_FIRST_MISSION,
  HUMAN_FIRST_SIX_STEPS,
  buildHumanFirstUserPromptFooter
} from "@/lib/quests/humanFirstExplanation";

export type RelatableAnswerSections = {
  paragraphs: string[];
  whyInvestorsCare: string | null;
};

const ANALYST_HEADING =
  /^(?:What we know|What changed|What the filing says|Bottom line|Main [Ee]xplanation|What they actually do|Real-world analogy|Investor insight|Simple version|Why it matters)\s*:?\s*\n?/gim;

function stripAnalystHeadings(text: string): string {
  return text
    .replace(ANALYST_HEADING, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitParagraphs(body: string): string[] {
  const chunks = stripAnalystHeadings(body)
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n+/g, " ").trim())
    .filter((p) => p.length > 0);

  if (chunks.length > 0) return chunks;

  const single = body.replace(/\n+/g, " ").trim();
  return single ? [single] : [];
}

/** Parse stored answer into flowing paragraphs + why (footer). */
export function parseRelatableQuestAnswer(
  plainEnglishAnswer: string | null | undefined,
  investorInsight?: string | null
): RelatableAnswerSections | null {
  const raw = plainEnglishAnswer?.trim();
  if (!raw) return null;

  const formatted = formatQuestCardCopy({
    plainEnglishAnswer: raw,
    investorInsight,
    displayMode: "display"
  });
  const sanitized = sanitizeQuestAnswerText(
    formatted?.plainEnglishAnswer ?? raw
  );
  let body = sanitized
    .replace(/\n\s*Simple [Vv]ersion:\s*[\s\S]*$/i, "")
    .trim();

  let why = formatted?.whyInvestorsCare ?? investorInsight?.trim() ?? null;

  const embeddedWhy = body.match(/\n\s*Why investors care:\s*\n?([\s\S]+)$/i);
  if (embeddedWhy?.index != null) {
    body = body.slice(0, embeddedWhy.index).trim();
    why = why || embeddedWhy[1].trim() || null;
  } else {
    const legacyWhy = body.match(/\n\s*Why it matters:\s*\n?([\s\S]+)$/i);
    if (legacyWhy?.index != null) {
      body = body.slice(0, legacyWhy.index).trim();
      why = why || legacyWhy[1].trim() || null;
    } else {
      const legacyInsight = body.match(/\n\s*Investor insight:\s*(.+)\s*$/i);
      if (legacyInsight?.index != null) {
        body = body.slice(0, legacyInsight.index).trim();
        why = why || legacyInsight[1].trim() || null;
      }
    }
  }

  body = stripAnalystHeadings(body);

  const paragraphs = splitParagraphs(body);
  if (paragraphs.length === 0 && !why) return null;

  return {
    paragraphs,
    whyInvestorsCare: why
  };
}

export function questAnswerPreviewText(
  plainEnglishAnswer: string,
  investorInsight?: string | null,
  maxLen = 220
): string {
  const parsed = parseRelatableQuestAnswer(plainEnglishAnswer, investorInsight);
  const combined = parsed
    ? parsed.paragraphs.join(" ")
    : plainEnglishAnswer;
  const t = combined.replace(/\s+/g, " ").trim();
  return t.length > maxLen ? `${t.slice(0, maxLen - 1).trim()}…` : t;
}

export function splitQuestAnswer(
  raw: string,
  sanitize: (text: string) => string = sanitizeQuestAnswerText
): {
  plainEnglishAnswer: string;
  investorInsight: string | null;
} {
  let cleaned = sanitize(raw)
    .replace(/\n\s*Simple [Vv]ersion:\s*[\s\S]*$/i, "")
    .trim();

  let why: string | null = null;
  const whyMatch = cleaned.match(/\n\s*Why investors care:\s*\n?([\s\S]+)$/i);
  if (whyMatch?.index != null) {
    cleaned = cleaned.slice(0, whyMatch.index).trim();
    why = whyMatch[1].trim() || null;
  } else {
    const legacyWhy = cleaned.match(/\n\s*Why it matters:\s*\n?([\s\S]+)$/i);
    if (legacyWhy?.index != null) {
      cleaned = cleaned.slice(0, legacyWhy.index).trim();
      why = legacyWhy[1].trim() || null;
    } else {
      const legacyInsight = cleaned.match(/\n\s*Investor insight:\s*(.+)\s*$/i);
      if (legacyInsight?.index != null) {
        cleaned = cleaned.slice(0, legacyInsight.index).trim();
        why = legacyInsight[1].trim() || null;
      }
    }
  }

  const paragraphs = splitParagraphs(cleaned);
  const plainEnglishAnswer = paragraphs.join("\n\n").trim();

  return {
    plainEnglishAnswer,
    investorInsight: why
  };
}
