/**
 * Investor Quest — quiz copy standards
 *
 * Primary feel: "I'm understanding THIS company" (~70–80% of prompts).
 * Secondary: investor judgment lenses (~20–30%) — never dominate.
 *
 * @see QUIZ_COPY_GUIDELINES
 */

import type { QuizQuestion } from "@/data/quests/types";

/** Target mix per quest (3–4 questions typical). */
export const QUIZ_QUESTION_MIX = {
  companySpecificMin: 0.7,
  investorLensMax: 0.3
} as const;

/** Patterns that break immersion — never use in player-facing quiz copy */
export const QUIZ_COPY_FORBIDDEN_PATTERNS: readonly RegExp[] = [
  /after reading the cards/i,
  /based on the cards/i,
  /according to the cards/i,
  /mentioned in the cards/i,
  /from the cards above/i,
  /the cards (say|show|tell)/i,
  /mark (all )?cards as read/i,
  /complete the (reading|cards)/i
];

export const QUIZ_COPY_GUIDELINES = `
Investor Quest quiz philosophy

Primary goal (~70–80% of questions): Company-specific understanding
- Frame around {Company.name} / {Company.ticker} — filled at runtime.
- Test what THIS business sells, who pays, moat, operations, risks, financials, management.
- Tie to the pillar you are on (Business / Forces / Financials / Management).
- Pull from insights the player just unlocked — not generic financial literacy.

Secondary (~20–30%): Investor thinking reinforcement
- Reusable lenses: revenue before price, margins vs. top line, cash vs. earnings, incentives, etc.
- Keep short; never more than one per quest on a 3-question quiz.

Pillar focus
- Business: products, customers, moat, operations, revenue mix
- Forces: competition, regulation, macro, supply chain, internal execution vs. external shocks
- Financials: growth quality, margins, expenses, cash flow, balance sheet
- Management: leadership, pay alignment, capital allocation, governance

Tone
- Smart friend explaining investing — conversational, concrete, short (see quest-card-voice rule + QUIZ_EXPLANATION_VOICE).
- Forbidden: "After reading the cards…", textbook/SEC voice ("designs and sells", "Understanding X helps investors see…"), silly distractors.

Wrong answers
- Realistic mistakes investors make (price action, hype, single metrics without context).

Explanations
- 1–2 sentences; picture-first; anchor to {Company.name} when possible.
- Good: "iPhone still pays most of the bills — Services adds monthly revenue on top."
- Bad: "The company's diversified revenue streams across multiple product categories…"

Future (not in quizzes yet): conviction reflection (confidence, top strength/risk, what to research next).
`.trim();

/** Dev/build guard — throws if copy violates standards */
export function assertQuizCopyAllowed(text: string, context?: string): void {
  for (const pattern of QUIZ_COPY_FORBIDDEN_PATTERNS) {
    if (pattern.test(text)) {
      throw new Error(
        `Quiz copy forbidden phrase${context ? ` (${context})` : ""}: ${text.slice(0, 80)}…`
      );
    }
  }
}

export function assertQuizQuestionsCopy(
  questions: readonly QuizQuestion[],
  catalogLabel?: string
): void {
  const prefix = catalogLabel ? `${catalogLabel}/` : "";
  for (const q of questions) {
    assertQuizCopyAllowed(q.prompt, `${prefix}${q.id}`);
    if ("choices" in q && q.choices) {
      for (const c of q.choices) assertQuizCopyAllowed(c, q.id);
    }
    if ("steps" in q && q.steps) {
      for (const s of q.steps) assertQuizCopyAllowed(s, q.id);
    }
    if ("explain" in q && q.explain) assertQuizCopyAllowed(q.explain, q.id);
  }
}

/** Realistic wrong answers — financially relevant, not jokes */
export const QUIZ_DISTRACTORS = {
  priceAction: [
    "Whether the stock went up recently",
    "What the share price did last week",
    "If the chart looks bullish on a daily screen"
  ],
  socialHype: [
    "What people on social media are saying",
    "Whether the CEO went viral this month",
    "How loud the bull case sounds on podcasts"
  ],
  surfaceMetric: [
    "How many stores or offices they have",
    "The company's age alone",
    "A single headline earnings beat"
  ],
  wrongFiling: [
    "The cover art on the annual report",
    "Only the auditor's signature page",
    "A press release about a brand refresh"
  ],
  governanceNoise: [
    "How polished the CEO's conference slides look",
    "Whether the logo was redesigned",
    "How many pages the proxy has"
  ]
} as const;

export type QuizDistractorPool = keyof typeof QUIZ_DISTRACTORS;
