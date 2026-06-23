/**
 * Schools Business Island — quiz micro-rewards + completion copy.
 */

export const SCHOOLS_HUB_CELEBRATE_SESSION_KEY =
  "iq-schools-business-hub-celebrate";

/** Set when leaving quest summary for hub — suppresses summary flash during navigation. */
export const SCHOOLS_QUEST_SUMMARY_EXIT_SESSION_KEY =
  "iq-schools-quest-summary-exited";

export function markSchoolsQuestSummaryExited(slug: string): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(SCHOOLS_QUEST_SUMMARY_EXIT_SESSION_KEY, slug);
  } catch {
    /* ignore */
  }
}

export function peekSchoolsQuestSummaryExited(slug: string): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(SCHOOLS_QUEST_SUMMARY_EXIT_SESSION_KEY) === slug;
  } catch {
    return false;
  }
}

export function clearSchoolsQuestSummaryExited(slug?: string): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    if (slug == null) {
      sessionStorage.removeItem(SCHOOLS_QUEST_SUMMARY_EXIT_SESSION_KEY);
      return;
    }
    if (sessionStorage.getItem(SCHOOLS_QUEST_SUMMARY_EXIT_SESSION_KEY) === slug) {
      sessionStorage.removeItem(SCHOOLS_QUEST_SUMMARY_EXIT_SESSION_KEY);
    }
  } catch {
    /* ignore */
  }
}

export const SCHOOLS_MICRO_XP_PER_CORRECT = 10;
/** Quest-clear bonus shown on the post-quiz skill summary. */
export const SCHOOLS_CARD_COMPLETE_XP = 75;
export const SCHOOLS_BUSINESS_HUB_CARD_TOTAL = 7;
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
  competition: 6,
  "who-competes": 7
};

export const SCHOOLS_COMPLETION_HEADLINE = "You Did the Work";
export const SCHOOLS_COMPLETION_SKILL_HEADING = "Stack Another Skill";

export type SchoolsQuestCompletionCopy = {
  headline: string;
  investorSkillHeading: string;
  /** Intro line before optional bullet list (e.g. "The best investors first ask:"). */
  skillIntro?: string;
  skillBullets?: readonly string[];
  investorSkillLines: readonly string[];
  ctaLabel?: string;
  whatYouLearnedLabel?: string;
  whatYouLearned?: string;
};

export const SCHOOLS_QUEST_COMPLETION_COPY: Partial<
  Record<string, SchoolsQuestCompletionCopy>
> = {
  "what-they-do": {
    headline: "First Quest Complete",
    investorSkillHeading: "New Investor Skill Unlocked",
    skillIntro: "The best investors first ask:",
    skillBullets: [
      "What does the company sell?",
      "What problem does it solve?"
    ],
    investorSkillLines: [
      "Companies that solve important problems often attract more customers."
    ],
    ctaLabel: "Unlock Next Quest →"
  },
  "why-buying": {
    headline: "Second Quest Complete",
    investorSkillHeading: "New Investor Skill Unlocked",
    skillIntro: "The best investors ask:",
    skillBullets: ["What are all the company's revenue sources?"],
    investorSkillLines: [
      "Knowing where a company makes its money helps investors understand what is driving the business."
    ],
    ctaLabel: "Unlock Next Quest →"
  },
  "everyday-life": {
    headline: "Third Quest Complete",
    investorSkillHeading: "New Investor Skill Unlocked",
    skillIntro: "The best investors ask:",
    skillBullets: [
      "How is the company trying to stay ahead of competitors?"
    ],
    investorSkillLines: [
      "Companies that keep innovating often have a better chance of long-term success."
    ],
    ctaLabel: "Unlock Next Quest →"
  },
  "how-it-works": {
    headline: "Fourth Quest Complete",
    investorSkillHeading: "New Investor Skill Unlocked",
    skillIntro: "The best investors ask:",
    skillBullets: [
      "How does the company get its products or services to customers?"
    ],
    investorSkillLines: [
      "Companies with strong partnerships, customer relationships, and distribution networks can often grow faster and reach more customers."
    ],
    ctaLabel: "Unlock Next Quest →"
  },
  "why-they-stay": {
    headline: "Fifth Quest Complete",
    investorSkillHeading: "New Investor Skill Unlocked",
    skillIntro: "The best investors ask:",
    skillBullets: [
      "Who helps the company make its products?",
      "What happens if those suppliers run into problems?"
    ],
    investorSkillLines: [
      "Even great products depend on a strong supply chain."
    ],
    ctaLabel: "Unlock Next Quest →"
  },
  competition: {
    headline: "Sixth Quest Complete",
    investorSkillHeading: "New Investor Skill Unlocked",
    skillIntro: "The best investors ask:",
    skillBullets: [
      "How difficult is this industry to compete in?",
      "What does a company need to do to stay successful?"
    ],
    investorSkillLines: [
      "Companies in highly competitive industries must constantly innovate to stay ahead."
    ],
    ctaLabel: "Unlock Next Quest →"
  },
  "who-competes": {
    headline: "Seventh Quest Complete",
    investorSkillHeading: "New Investor Skill Unlocked",
    skillIntro: "The best investors ask:",
    skillBullets: [
      "Who are the company's competitors?",
      "What advantages does the company have over them?"
    ],
    investorSkillLines: [
      "Understanding the competition helps investors judge whether a company can protect its market position."
    ],
    ctaLabel: "Unlock Next Quest →"
  }
};

export function resolveSchoolsQuestCompletionCopy(
  slug: string
): SchoolsQuestCompletionCopy | null {
  return SCHOOLS_QUEST_COMPLETION_COPY[slug] ?? null;
}

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
    "NVIDIA's two main product segments",
    "What Compute & Networking does",
    "What the Graphics segment does"
  ],
  "everyday-life": [
    "How it tries to stay ahead of competitors",
    "Where it invests in new technology",
    "Why innovation can drive long-term success"
  ],
  "how-it-works": [
    "How it reaches customers worldwide",
    "How it helps customers succeed",
    "Why developers matter to its ecosystem"
  ],
  "why-they-stay": [
    "Who actually manufactures its chips",
    "Why it works with suppliers",
    "Where its global supply chain operates"
  ],
  competition: [
    "Why the industry is hard to compete in",
    "What customers look for",
    "What could threaten its position"
  ],
  "who-competes": [
    "Which chip and tech rivals it faces",
    "Who competes in CPUs and devices",
    "Who competes in networking"
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

export const SCHOOLS_CONVICTION_CONFIDENT_LABEL = "YES, IT DOES";
export const SCHOOLS_CONVICTION_CAUTIOUS_LABEL = "I'M GETTING THERE";

export function schoolsConvictionConfidentDescription(companyName: string): string {
  const company = companyName.trim() || "this company";
  return `I understand what ${company} does and why customers choose it.`;
}

export const SCHOOLS_CONVICTION_CAUTIOUS_DESCRIPTION =
  "Some things make sense, but I still have questions.";
