/**
 * Global quest copy rules — single source of truth for bans, limits, and prompts.
 * Consumed by formatter, validator, AI generation, and admin audits.
 */

import { EM_DASH_IN_COPY_RE, DRAMATIC_NARRATION_RE } from "@/lib/quests/directProseCopy";
import { GENERIC_CUSTOMER_AUDIENCE_PATTERNS } from "@/lib/quests/customerAudienceCopy";
import { INNOVATION_RD_BAD_PATTERNS } from "@/lib/quests/innovationRdCopy";
import { QUIZ_COPY_FORBIDDEN_PATTERNS } from "@/lib/quests/quizCopy";

export type BannedPhraseCategory =
  | "dash"
  | "cinematic"
  | "customer_generic"
  | "innovation_hype"
  | "buzzword"
  | "section"
  | "quiz"
  | "corporate";

export type BannedPhrasePattern = {
  id: string;
  re: RegExp;
  category: BannedPhraseCategory;
  /** Short label for admin audit table */
  label: string;
};

/** Section headers that must never appear in player-facing card bodies. */
export const BANNED_COPY_SECTION_HEADERS =
  /^(?:How to read this|Investor [Ii]nsight|Investor takeaway|What we know|What changed|What the filing says|Bottom line|Main [Ee]xplanation|Real-world analogy|Simple version|Why it matters)\s*:?\s*$/gim;

export const BANNED_COPY_SECTION_INLINE =
  /\n\s*(?:How to read this|Investor [Ii]nsight|Investor takeaway|What we know|What changed|Bottom line|Simple version)\s*:?\s*/gi;

export const QUEST_COPY_LIMITS = {
  /** Max sentences in main story (1 takeaway + up to 2 supporting) */
  maxMainSentences: 3,
  /** Max sentences shown on flashcard-style UI */
  maxDisplayParagraphs: 2,
  maxMainStoryWords: 95,
  maxWhyInvestorsCareWords: 32,
  maxQuizExplainWords: 45
} as const;

export const GLOBAL_BANNED_PHRASE_PATTERNS: readonly BannedPhrasePattern[] = [
  { id: "em_dash", re: EM_DASH_IN_COPY_RE, category: "dash", label: "Em dash or --" },
  {
    id: "cinematic_filler",
    re: DRAMATIC_NARRATION_RE,
    category: "cinematic",
    label: "Cinematic / dramatic filler"
  },
  {
    id: "buzzword_whatevers_next",
    re: /\bwhatever'?s next\b/i,
    category: "innovation_hype",
    label: "Casual filler (whatever's next)"
  },
  {
    id: "buzzword_pours_billions",
    re: /\bpours? billions\b/i,
    category: "innovation_hype",
    label: "Hype phrasing (pours billions)"
  },
  {
    id: "buzzword_stack_commas",
    re: /\b(?:custom chips?|cameras?|AI|Vision Pro)[^.]{0,90}(?:,\s*(?:custom chips?|cameras?|AI|Vision Pro|software|hardware)){2,}/i,
    category: "buzzword",
    label: "Buzzword stack"
  },
  {
    id: "real_story_bigger",
    re: /\bthe real story is\b/i,
    category: "cinematic",
    label: "the real story is…"
  },
  {
    id: "beneath_surface",
    re: /\bbeneath the surface\b/i,
    category: "cinematic",
    label: "beneath the surface"
  },
  {
    id: "judgment_sharper",
    re: /\bthat makes every judgment sharper\b/i,
    category: "cinematic",
    label: "that makes every judgment sharper"
  },
  {
    id: "deeper_story",
    re: /\bthe deeper story matters\b/i,
    category: "cinematic",
    label: "the deeper story matters"
  },
  {
    id: "in_simple_terms",
    re: /\bin simple terms\b/i,
    category: "corporate",
    label: "In simple terms"
  },
  {
    id: "designs_and_sells",
    re: /\bdesigns and sells\b/i,
    category: "corporate",
    label: "designs and sells"
  },
  {
    id: "provides_solutions",
    re: /\bprovides? solutions\b/i,
    category: "corporate",
    label: "provides solutions"
  },
  ...GENERIC_CUSTOMER_AUDIENCE_PATTERNS.map((p) => ({
    id: p.id,
    re: p.re,
    category: "customer_generic" as const,
    label: `Generic audience (${p.id})`
  })),
  ...INNOVATION_RD_BAD_PATTERNS.map((p) => ({
    id: p.id,
    re: p.re,
    category: "innovation_hype" as const,
    label: `R&D / moat (${p.id})`
  })),
  ...QUIZ_COPY_FORBIDDEN_PATTERNS.map((re, i) => ({
    id: `quiz_forbidden_${i}`,
    re,
    category: "quiz" as const,
    label: "Quiz meta-reference (cards/reading)"
  }))
];

export const QUEST_COPY_GLOBAL_RULES_TEXT = `GLOBAL QUEST COPY (all pillars, cards, quizzes, completion UI)

CARD STRUCTURE (player sees only):
- Question
- Main answer (1–2 short sentences)
- Optional one supporting sentence
- Visual/chart when configured
- Small source line
- One "Why investors care" line (embedded in answer OR template why slot — never duplicated below)

BANNED EVERYWHERE:
- Em dashes (—), en dashes (–), or " -- "
- Sections: "Investor Insight", "How to read this", "Simple version", "Bottom line", analyst headings
- Repeated explanation below the card (same "why" twice)
- Cinematic filler: real story, beneath the surface, whatever's next, judgment sharper, deeper story
- Generic customers: regular people, everyone, normal consumers
- Buzzword stacks and tech-bro hype
- Dramatic narration and forced cleverness

VOICE:
- Short, specific, beginner-friendly, investor-focused, human — not AI narration or SEC summary.

LENGTH:
- Max ${QUEST_COPY_LIMITS.maxMainSentences} sentences before "Why investors care"
- Max ${QUEST_COPY_LIMITS.maxMainStoryWords} words in main story
- Quiz explain: max ${QUEST_COPY_LIMITS.maxQuizExplainWords} words`;

export type BannedPhraseHit = {
  id: string;
  label: string;
  category: BannedPhraseCategory;
  match: string;
};

export function scanBannedPhrases(text: string): BannedPhraseHit[] {
  const hits: BannedPhraseHit[] = [];
  for (const p of GLOBAL_BANNED_PHRASE_PATTERNS) {
    const m = text.match(p.re);
    if (m) {
      hits.push({
        id: p.id,
        label: p.label,
        category: p.category,
        match: m[0].slice(0, 80)
      });
    }
  }
  return hits;
}

export function hasBannedCopySection(text: string): boolean {
  return (
    BANNED_COPY_SECTION_INLINE.test(text) ||
    /^(?:How to read this|Investor [Ii]nsight)/im.test(text)
  );
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}
