/**
 * Schools Business Island — quiz micro-rewards + completion copy.
 */

export const SCHOOLS_HUB_CELEBRATE_SESSION_KEY =
  "iq-schools-business-hub-celebrate";

export const SCHOOLS_MICRO_XP_PER_CORRECT = 10;
/** Quest-clear bonus shown on the post-quiz skill summary. */
export const SCHOOLS_CARD_COMPLETE_XP = 75;
export const SCHOOLS_BUSINESS_HUB_CARD_TOTAL = 6;
export const SCHOOLS_MICRO_CELEBRATION_MS = 1000;

export const SCHOOLS_CORRECT_MESSAGES = [
  "Nice work!",
  "Correct!",
  "You got it!",
  "Investor skill +1",
  "You're getting the hang of this."
] as const;

export const SCHOOLS_WRONG_MESSAGES = [
  "Not quite. Try again.",
  "Almost. Give it another shot."
] as const;

/** Hub slot index after completing each Business quest slug. */
export const SCHOOLS_BUSINESS_HUB_SLOT: Record<string, number> = {
  "what-they-do": 1,
  "why-buying": 2,
  "everyday-life": 3,
  "how-it-works": 4,
  "why-they-stay": 5,
  competition: 6
};

export const SCHOOLS_COMPLETION_HEADLINE = "Nice work.";

export const SCHOOLS_COMPLETION_PRIDE_LINE =
  "You now understand {company} better than most beginners.";

/** Mentor-style closing — encouragement, not a lesson recap. */
export const SCHOOLS_MENTOR_CLOSING = [
  "Most people stop at the stock price.",
  "Great investors learn the business first.",
  "You're building that skill right now."
] as const;

/**
 * Short recap bullets per quest — "it" refers to the company.
 * Kept brief; not investment advice.
 */
export const SCHOOLS_QUEST_SKILL_TAKEAWAYS: Record<string, readonly string[]> = {
  "what-they-do": [
    "What it sells",
    "Why customers buy its products"
  ],
  "why-buying": [
    "Who pays the biggest bills",
    "Where the money comes from",
    "Why buyers keep ordering"
  ],
  "everyday-life": [
    "Where you meet it in daily life",
    "How it shows up in games and AI",
    "Why builders rely on it"
  ],
  "how-it-works": [
    "How its products get designed",
    "Who helps build them",
    "How the tech reaches the world"
  ],
  "why-they-stay": [
    "Why it's hard to replace",
    "What sets it apart",
    "Why developers keep building on it"
  ],
  competition: [
    "Who it's competing with",
    "Trends that could help it grow",
    "Risks that could slow it down"
  ]
};

export function resolveSchoolsQuestTakeaways(
  slug: string
): readonly string[] {
  return SCHOOLS_QUEST_SKILL_TAKEAWAYS[slug] ?? [
    "What it sells",
    "How it makes money",
    "Why customers keep buying it"
  ];
}

export function resolveSchoolsCompletionPrideLine(
  companyName: string
): string {
  const company = companyName.trim() || "this company";
  return SCHOOLS_COMPLETION_PRIDE_LINE.replace("{company}", company);
}

export function schoolsCorrectMessage(questionIndex: number): string {
  return SCHOOLS_CORRECT_MESSAGES[
    questionIndex % SCHOOLS_CORRECT_MESSAGES.length
  ];
}

export function schoolsWrongMessage(questionIndex: number): string {
  return SCHOOLS_WRONG_MESSAGES[questionIndex % SCHOOLS_WRONG_MESSAGES.length];
}

export function markSchoolsHubCelebrateReturn(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(SCHOOLS_HUB_CELEBRATE_SESSION_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function consumeSchoolsHubCelebrateReturn(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    if (sessionStorage.getItem(SCHOOLS_HUB_CELEBRATE_SESSION_KEY) !== "1") {
      return false;
    }
    sessionStorage.removeItem(SCHOOLS_HUB_CELEBRATE_SESSION_KEY);
    return true;
  } catch {
    return false;
  }
}

/** Post-quest reflection — learning check-in (not investing / conviction framing). */
export function schoolsConvictionKicker(pillarTitle: string): string {
  return `${pillarTitle.toUpperCase()} — CHECK-IN`;
}

export function schoolsConvictionHeading(companyName: string): string {
  const company = companyName.trim() || "this company";
  return `Does ${company} make more sense now?`;
}

export const SCHOOLS_CONVICTION_BODY = "Pick the option that feels closest.";

export const SCHOOLS_CONVICTION_CONFIDENT_LABEL = "Yes, it does";
export const SCHOOLS_CONVICTION_CAUTIOUS_LABEL = "I'm getting there";

export function schoolsConvictionConfidentDescription(companyName: string): string {
  const company = companyName.trim() || "this company";
  return `I understand what ${company} does and why customers choose it.`;
}

export const SCHOOLS_CONVICTION_CAUTIOUS_DESCRIPTION =
  "Some things make sense, but I still have questions.";
