/**
 * Global quest answer formatter — clean and normalize before render or save.
 */

import { splitIntoSentences } from "@/lib/quests/scannableAnswer";
import { splitQuestAnswer } from "@/lib/quests/questAnswerFormat";
import { polishInnovationRdCopy } from "@/lib/quests/innovationRdCopy";
import {
  BANNED_COPY_SECTION_HEADERS,
  BANNED_COPY_SECTION_INLINE,
  QUEST_COPY_LIMITS
} from "@/lib/quests/questCopyRules";
import { normalizeQuestProseDashes } from "@/lib/quests/normalizeQuestProse";

export type FormattedQuestCardCopy = {
  /** Storage-compatible combined answer (body + optional Why investors care) */
  plainEnglishAnswer: string;
  /** Separate why line — null when merged into body only */
  investorInsight: string | null;
  /** 1–2 sentences for flashcard main display */
  mainParagraphs: string[];
  whyInvestorsCare: string | null;
  /** True when formatter removed duplicate sections or trimmed length */
  wasModified: boolean;
};

function stripBannedSections(text: string): string {
  let out = text
    .replace(BANNED_COPY_SECTION_HEADERS, "")
    .replace(BANNED_COPY_SECTION_INLINE, "\n\n")
    .replace(/\n\s*Simple [Vv]ersion:\s*[\s\S]*$/i, "")
    .trim();
  out = out.replace(/\n{3,}/g, "\n\n");
  return out;
}

function normalizeInline(text: string): string {
  return normalizeQuestProseDashes(polishInnovationRdCopy(text))
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeParagraph(text: string): string {
  return normalizeQuestProseDashes(polishInnovationRdCopy(text.replace(/\n+/g, " ").trim()));
}

function trimSentences(sentences: string[], max: number): string[] {
  return sentences.slice(0, max).map((s) => s.trim()).filter(Boolean);
}

function buildCombinedAnswer(
  paragraphs: string[],
  why: string | null
): string {
  const body = paragraphs.join("\n\n").trim();
  if (!why?.trim()) return body;
  if (!body) return `Why investors care:\n${why.trim()}`;
  return `${body}\n\nWhy investors care:\n${why.trim()}`;
}

function dedupeWhy(a: string | null, b: string | null): string | null {
  const x = a?.trim() || null;
  const y = b?.trim() || null;
  if (!x) return y;
  if (!y) return x;
  const nx = x.toLowerCase().replace(/\s+/g, " ");
  const ny = y.toLowerCase().replace(/\s+/g, " ");
  if (nx === ny || nx.includes(ny) || ny.includes(nx)) return x;
  return x;
}

/**
 * Format quest card copy for display and storage.
 * Strips banned sections, dedupes "why", caps length.
 */
export function formatQuestCardCopy(input: {
  plainEnglishAnswer: string | null | undefined;
  investorInsight?: string | null;
  /** Flashcard UI: cap at 2 body paragraphs */
  displayMode?: "storage" | "display";
}): FormattedQuestCardCopy | null {
  const raw = input.plainEnglishAnswer?.trim();
  if (!raw) return null;

  const stripped = stripBannedSections(raw);
  const wasBanned = stripped !== raw;

  const split = splitQuestAnswer(stripped);
  let body = split.plainEnglishAnswer;
  let why = dedupeWhy(split.investorInsight, input.investorInsight ?? null);

  const embeddedInsight = input.investorInsight?.trim();
  if (embeddedInsight && !why) {
    why = normalizeInline(embeddedInsight);
  }

  body = stripBannedSections(body);
  const sentences = splitIntoSentences(body);
  const maxBody =
    input.displayMode === "display"
      ? QUEST_COPY_LIMITS.maxDisplayParagraphs
      : QUEST_COPY_LIMITS.maxMainSentences;
  const trimmedSentences = trimSentences(sentences, maxBody);
  const paragraphs = trimmedSentences.map(normalizeParagraph);

  if (why) {
    why = normalizeInline(why);
    const whyWords = why.split(/\s+/).filter(Boolean);
    if (whyWords.length > QUEST_COPY_LIMITS.maxWhyInvestorsCareWords) {
      why = whyWords
        .slice(0, QUEST_COPY_LIMITS.maxWhyInvestorsCareWords)
        .join(" ")
        .replace(/[,.]$/, "")
        .concat(".");
    }
  }

  const plainEnglishAnswer = buildCombinedAnswer(paragraphs, why);
  const wasTrimmed =
    sentences.length > trimmedSentences.length ||
    paragraphs.join(" ") !== body.replace(/\n+/g, " ");

  return {
    plainEnglishAnswer,
    investorInsight: null,
    mainParagraphs: paragraphs,
    whyInvestorsCare: why,
    wasModified: wasBanned || wasTrimmed
  };
}

/** Light cleanup for any player-visible string (toasts, quizzes, labels). */
export function formatPlayerCopy(text: string): string {
  if (!text?.trim()) return text;
  const stripped = stripBannedSections(text);
  return normalizeQuestProseDashes(polishInnovationRdCopy(stripped));
}

/** Merge formatted card fields for content resolver. */
export function formatQuestCardFields(input: {
  plainEnglishAnswer: string | null | undefined;
  investorInsight?: string | null;
}): {
  plainEnglishAnswer: string | null;
  investorInsight: string | null | undefined;
} {
  if (!input.plainEnglishAnswer?.trim()) {
    return {
      plainEnglishAnswer: null,
      investorInsight: input.investorInsight?.trim()
        ? formatPlayerCopy(input.investorInsight)
        : undefined
    };
  }
  const formatted = formatQuestCardCopy({
    plainEnglishAnswer: input.plainEnglishAnswer,
    investorInsight: input.investorInsight,
    displayMode: "storage"
  });
  if (!formatted) {
    return { plainEnglishAnswer: null, investorInsight: undefined };
  }
  return {
    plainEnglishAnswer: formatted.plainEnglishAnswer,
    investorInsight: formatted.investorInsight ?? undefined
  };
}
