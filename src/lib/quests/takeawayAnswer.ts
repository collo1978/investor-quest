import { splitIntoSentences } from "@/lib/quests/scannableAnswer";
import {
  hasStructuredSupportBody,
  parseScannableSupportBody,
  type ScannableSupportChunk
} from "@/lib/quests/scannableTakeawayBody";
import {
  inferLessonLayout,
  parseLessonSupportingBody,
  hasLessonSupportingFormat,
  type LessonLayoutParts
} from "@/lib/quests/lessonAnswer";

export type TakeawayAnswerParts = {
  takeaway: string;
  supporting: string | null;
  supportChunks?: ScannableSupportChunk[];
  lesson?: LessonLayoutParts;
};

/** Hard cap for yellow hero takeaway — headline, not paragraph. */
export const TAKEAWAY_MAX_WORDS = 12;
export const TAKEAWAY_TARGET_MIN_WORDS = 8;

/** Relatable examples belong in supporting text, not the takeaway. */
export const TAKEAWAY_EXAMPLE_LANGUAGE_RE =
  /\b(when you|if you(?:'ve| have)?|for example|such as|like when|often working behind|behind the scenes|imagine|picture this|think of|e\.g\.|including things like|you use every day|apps you use)\b/i;

/** Paragraph-style filler that belongs in supporting text. */
export const TAKEAWAY_PARAGRAPH_LANGUAGE_RE =
  /\b(a lot of|that help(?:s)? power|help power|special chips that|giant computer|computer rooms|today's|modern video games, and the|behind apps|many of today's|wide range of|variety of)\b/i;

/** "because" / "when" in takeaway usually means explanation crept into the headline. */
export const TAKEAWAY_CAUSE_OR_TIME_RE = /\b(because|when)\b/i;

export const TAKEAWAY_CONTENT_RULES = `YELLOW TAKEAWAY (MAIN TAKEAWAY — large yellow text)
- ${TAKEAWAY_TARGET_MIN_WORDS}–${TAKEAWAY_MAX_WORDS} words (hard max ${TAKEAWAY_MAX_WORDS})
- One idea only — reads like a headline
- No examples, no lists, no multiple concepts, no explanation
- Understandable in under 2 seconds

Headline check: if the yellow text contains "because" or "when", multiple "and"s, or stacked examples, it is too long. Rewrite shorter.

BAD (paragraph — never):
"NVIDIA makes the special chips that help power a lot of today's AI tools, modern video games, and the giant computer rooms behind apps you use every day."

GOOD (headline):
"NVIDIA makes the brains behind AI and games."
"NVIDIA leads the market for AI chips."

WHITE EXPLANATION (SUPPORTING EXPLANATION — white text below)
- 1–2 short sentences a teenager can visualize
- Use apps, games, money metaphors — not SEC or product-catalog language
- Never mention the 10-K, filings, CUDA, or GPUs unless truly necessary
- Goal: "Now I get it." — not "Now I know the terminology."

BAD (corporate / jargon):
"The 10-K describes GPUs, data center systems, and CUDA software as its core products."

GOOD (visual / relatable):
"When you use ChatGPT or play a modern video game, there's a good chance NVIDIA technology is helping behind the scenes."

Example (What does NVIDIA actually sell?):
MAIN TAKEAWAY:
NVIDIA makes the brains behind AI and games.

SUPPORTING EXPLANATION:
When you use ChatGPT or play a modern video game, there's a good chance NVIDIA technology is helping behind the scenes. You rarely buy from them directly — you feel them through fast apps and smooth graphics.`;

const LABELED_MAIN_RE = /MAIN TAKEAWAY:\s*/i;

function collapseLines(text: string): string {
  return text.replace(/\n+/g, " ").trim();
}

function firstSentence(text: string): string {
  const sentences = splitIntoSentences(collapseLines(text));
  return sentences[0]?.trim() ?? collapseLines(text);
}

function supportingSentences(text: string, max = 3): string {
  const sentences = splitIntoSentences(collapseLines(text));
  if (!sentences.length) return "";
  return sentences.slice(0, max).join(" ").trim();
}

export function hasLabeledTakeawayFormat(body: string): boolean {
  return LABELED_MAIN_RE.test(body);
}

/** Parse labeled MAIN TAKEAWAY / SUPPORTING EXPLANATION blocks. */
export function parseTakeawayAnswerBody(body: string): TakeawayAnswerParts | null {
  const trimmed = body.trim();
  if (!trimmed || !hasLabeledTakeawayFormat(trimmed)) return null;

  const mainBlock = trimmed.match(
    /MAIN TAKEAWAY:\s*([\s\S]*?)(?=\n\s*SUPPORTING EXPLANATION:|\n\s*Why investors care:|$)/i
  )?.[1];
  const supportBlock = trimmed.match(
    /SUPPORTING EXPLANATION:\s*([\s\S]*?)(?=\n\s*Why investors care:|$)/i
  )?.[1];

  const takeaway = firstSentence(mainBlock ?? "");
  if (!takeaway) return null;

  const supportRaw = supportBlock?.trim() ?? "";
  const structured =
    supportRaw.length > 0 &&
    (hasStructuredSupportBody(supportRaw) ||
      hasLessonSupportingFormat(supportRaw));
  const lessonParsed = supportRaw ? parseLessonSupportingBody(supportRaw) : null;

  const supporting = supportRaw
    ? structured
      ? null
      : supportingSentences(supportBlock!) || null
    : null;

  const supportChunks = structured
    ? lessonParsed?.middleChunks.length
      ? lessonParsed.middleChunks
      : parseScannableSupportBody(supportRaw)
    : undefined;

  const lesson: LessonLayoutParts =
    lessonParsed ?? inferLessonLayout(supportChunks, supporting);

  return { takeaway, supporting, supportChunks, lesson };
}

/** Legacy answers: first sentence = takeaway, next 1–2 = supporting. */
export function inferTakeawayFromParagraphs(paragraphs: string[]): TakeawayAnswerParts | null {
  const sentences: string[] = [];
  for (const paragraph of paragraphs) {
    const chunk = collapseLines(paragraph);
    if (!chunk) continue;
    sentences.push(...splitIntoSentences(chunk));
  }
  if (!sentences.length) return null;

  return {
    takeaway: sentences[0]!,
    supporting:
      sentences.length > 1 ? sentences.slice(1, 3).join(" ").trim() || null : null
  };
}

export function resolveTakeawayAnswer(
  body: string,
  paragraphs: string[] = []
): TakeawayAnswerParts | null {
  return (
    parseTakeawayAnswerBody(body) ??
    inferTakeawayFromParagraphs(
      paragraphs.length > 0
        ? paragraphs
        : body
            .split(/\n{2,}/)
            .map((p) => collapseLines(p))
            .filter(Boolean)
    )
  );
}

export function buildTakeawayAnswerBody(parts: TakeawayAnswerParts): string {
  const lines = ["MAIN TAKEAWAY:", parts.takeaway.trim()];
  if (parts.supporting?.trim()) {
    lines.push("", "SUPPORTING EXPLANATION:", parts.supporting.trim());
  }
  return lines.join("\n");
}

/** Strip generation labels before human-first structure analysis. */
export function stripTakeawayLabelsForAnalysis(body: string): string {
  return body
    .replace(/MAIN TAKEAWAY:\s*/gi, "")
    .replace(/SUPPORTING EXPLANATION:\s*/gi, "")
    .replace(/LESSON_INTRO:\s*/gi, "")
    .replace(/LESSON_MIDDLE:\s*/gi, "")
    .replace(/LESSON_FOCUS:\s*/gi, "")
    .replace(/LESSON_CLOSING:\s*/gi, "")
    .replace(/KEY TAKEAWAY:\s*/gi, "")
    .trim();
}

export function countTakeawayWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Emoji section labels (🤝 PARTNERS) — not the gold takeaway sentence on legacy cards. */
export function isEmojiSectionHeadline(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (!/^(\p{Extended_Pictographic}+\s*)+/u.test(trimmed)) return false;
  const words = countTakeawayWords(trimmed);
  if (words > TAKEAWAY_MAX_WORDS) return false;
  if (trimmed.endsWith(".") && words > 6) return false;
  return true;
}

export function takeawayHasExampleLanguage(text: string): boolean {
  return TAKEAWAY_EXAMPLE_LANGUAGE_RE.test(text);
}

function countAndJoins(text: string): number {
  return (text.match(/\band\b/gi) ?? []).length;
}

/** True when takeaway reads like a paragraph instead of a headline. */
export function takeawayReadsLikeParagraph(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  const words = countTakeawayWords(trimmed);
  const andCount = countAndJoins(trimmed);

  if (words > TAKEAWAY_MAX_WORDS) return true;
  if (TAKEAWAY_CAUSE_OR_TIME_RE.test(trimmed)) return true;
  if (TAKEAWAY_EXAMPLE_LANGUAGE_RE.test(trimmed)) return true;
  if (TAKEAWAY_PARAGRAPH_LANGUAGE_RE.test(trimmed)) return true;
  if (andCount >= 2) return true;
  if (andCount >= 1 && words > 10) return true;
  return false;
}

/** First labeled takeaway block, or first sentence of legacy body. */
export function extractTakeawayForValidation(body: string): string {
  const parsed = parseTakeawayAnswerBody(body);
  if (parsed?.takeaway) return parsed.takeaway;
  const sentences = splitIntoSentences(stripTakeawayLabelsForAnalysis(body));
  return sentences[0]?.trim() ?? "";
}
