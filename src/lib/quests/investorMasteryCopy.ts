import type { PillarId } from "@/data/pillars";

export type InvestorMasteryContent = {
  /** Short kicker above the checkpoint (e.g. "Nice work"). */
  kicker: string;
  /** Short identity line — must not repeat checklist items. */
  message: string;
  /** Label above the checklist (e.g. "You now understand"). */
  learnedIntro: string;
  /** Beginner-friendly “you now understand” bullets (one per card when possible). */
  learned: readonly string[];
  /** One-line momentum into the quiz. */
  momentum: string;
};

type MasteryKey = `${PillarId}:${string}`;

function key(pillarId: PillarId, slug: string): MasteryKey {
  return `${pillarId}:${slug}`;
}

function withCompany(name: string, text: string): string {
  return text.replace(/\{company\}/g, name);
}

/** Per-section mastery copy — `{company}` is replaced with the company display name. */
const MASTERY_BY_SECTION = {
  [key("business", "what-they-do")]: {
    kicker: "Nice work",
    message:
      "You can now explain {company} like a real business, not a ticker.",
    learnedIntro: "You now understand",
    learned: [
      "What {company} actually sells",
      "Why customers buy {company} products"
    ],
    momentum: "Now let’s see what stuck."
  },
  [key("business", "why-buying")]: {
    kicker: "Checkpoint cleared",
    message:
      "You just followed the money — who pays, what sells, and why demand is hot.",
    learnedIntro: "You’ve just learned",
    learned: [
      "Who spends the most with {company}",
      "Which products make the most money",
      "Why buyers are rushing in now"
    ],
    momentum: "Quick quiz, then we move on."
  },
  [key("business", "everyday-life")]: {
    kicker: "Nice work",
    message:
      "This is the unlock: you can picture where {company} shows up in everyday life.",
    learnedIntro: "You’ve just learned",
    learned: [
      "Where you meet {company}'s technology",
      "How gaming and AI apps feel different",
      "Why builders rely on {company}"
    ],
    momentum: "Let’s lock it in with a quick checkpoint."
  },
  [key("business", "how-it-works")]: {
    kicker: "Section complete",
    message:
      "You can now trace the journey from design → factory → delivery like a real operator would.",
    learnedIntro: "You now understand",
    learned: [
      "How chips are designed and built",
      "Who manufactures and where risk sits",
      "How products reach customers worldwide"
    ],
    momentum: "Start the quiz when you’re ready."
  },
  [key("business", "why-they-stay")]: {
    kicker: "Nice work",
    message:
      "You’re starting to spot the sticky stuff — the reasons customers don’t switch easily.",
    learnedIntro: "You’ve just learned",
    learned: [
      "Why {company} is hard to replace",
      "What makes them different from rivals",
      "Why developers keep building on them"
    ],
    momentum: "Now let’s test your instincts."
  },
  [key("business", "competition")]: {
    kicker: "Checkpoint",
    message:
      "You see how tough the industry is — and what it takes to stay ahead when tech moves fast.",
    learnedIntro: "You now understand",
    learned: [
      "Why the industry is hard to compete in",
      "What customers look for",
      "What could threaten its position"
    ],
    momentum: "Quick quiz — then on to the next unlock."
  },
  [key("business", "who-competes")]: {
    kicker: "Nice work",
    message:
      "You can now name who {company} is fighting — across chips, big tech, and networking.",
    learnedIntro: "You now understand",
    learned: [
      "Which chip and tech rivals it faces",
      "Who competes in CPUs and smart devices",
      "Who competes in networking"
    ],
    momentum: "Lock it in with a quick checkpoint."
  },
  [key("financials", "growth")]: {
    kicker: "Nice work",
    message:
      "You just checked {company}'s growth pulse — what’s driving it and what could cool off.",
    learnedIntro: "Signals you just read",
    learned: [
      "Whether {company}'s sales are speeding up or slowing down",
      "What's driving growth, and what might fade",
      "Why investors watch growth before they trust the stock"
    ],
    momentum: "Now test the signal."
  },
  [key("financials", "profitability")]: {
    kicker: "Checkpoint cleared",
    message:
      "You just checked profitability — how much {company} keeps, and why it matters.",
    learnedIntro: "Signals you just read",
    learned: [
      "How profitable {company} really is",
      "What margins say about pricing power",
      "Why profit quality matters as much as revenue"
    ],
    momentum: "Quick quiz to confirm it."
  },
  [key("financials", "expenses")]: {
    kicker: "Nice work",
    message:
      "You just mapped where the money goes — the cost engine behind the story.",
    learnedIntro: "Signals you just read",
    learned: [
      "The biggest costs {company} carries",
      "Whether spending is growing faster than sales",
      "Why cost control affects long-term returns"
    ],
    momentum: "Let’s see what you remember."
  },
  [key("financials", "cash")]: {
    kicker: "Checkpoint",
    message:
      "You just checked cash reality — what actually hit the bank, not just headlines.",
    learnedIntro: "Signals you just read",
    learned: [
      "Whether profits turn into real cash",
      "How {company} uses cash day to day",
      "Why cash is harder to fake than headline earnings"
    ],
    momentum: "Ready for the checkpoint quiz?"
  },
  [key("financials", "financial-strength")]: {
    kicker: "Nice work",
    message:
      "You just checked {company}'s financial health — cushion vs. pressure.",
    learnedIntro: "Signals you just read",
    learned: [
      "How much debt or cushion {company} carries",
      "Whether the balance sheet looks sturdy or stretched",
      "Why financial strength affects investor confidence"
    ],
    momentum: "Now test your read."
  },
  [key("management", "mgmt-1")]: {
    kicker: "Nice work",
    message:
      "You just evaluated the people steering {company} — the human side of the story.",
    learnedIntro: "You’ve just learned",
    learned: [
      "Who leads {company} and what they oversee",
      "Whether leaders' backgrounds fit today's challenges",
      "Why the right team can change how investors feel"
    ],
    momentum: "Let’s see what you’d trust."
  },
  [key("management", "mgmt-quiz")]: {
    kicker: "Checkpoint",
    message:
      "You just looked at incentives — how leaders get paid and what that nudges them to do.",
    learnedIntro: "You now understand",
    learned: [
      "How executive pay is structured at {company}",
      "Whether pay rewards long-term results or short-term wins",
      "Why pay design shapes how leaders behave"
    ],
    momentum: "Quick checkpoint quiz."
  },
  [key("management", "mgmt-2")]: {
    kicker: "Nice work",
    message:
      "You just judged the decisions leaders make with cash — a huge trust signal.",
    learnedIntro: "You’ve just learned",
    learned: [
      "How {company} allocates cash: growth, buybacks, dividends",
      "What management prioritises when cash is tight",
      "Why capital choices signal what leaders believe in"
    ],
    momentum: "Now test your judgment."
  },
  [key("management", "mgmt-governance")]: {
    kicker: "Checkpoint cleared",
    message:
      "You just checked the guardrails — who has power, and who’s supposed to push back.",
    learnedIntro: "You now understand",
    learned: [
      "How {company}'s board oversees management",
      "What happens if leaders leave or the company is sold",
      "Why governance protects, or exposes, shareholders"
    ],
    momentum: "Quick quiz — then keep going."
  },
  [key("management", "mgmt-financial-strength")]: {
    kicker: "Nice work",
    message:
      "You just connected leadership talk to financial reality — that’s investor-level thinking.",
    learnedIntro: "You’ve just learned",
    learned: [
      "How management talks about {company}'s financial health",
      "Whether leaders seem aligned with shareholder interests",
      "Why trust in management affects the stock story"
    ],
    momentum: "Let’s see how much stuck."
  },
  [key("management", "management-summary")]: {
    kicker: "Section complete",
    message:
      "You just pulled the people story together — who runs it, how they’re paid, and whether you trust it.",
    learnedIntro: "You now understand",
    learned: [
      "The big picture on who runs {company}",
      "How pay, governance, and capital choices connect",
      "Why management quality is a core investor question"
    ],
    momentum: "Checkpoint quiz — then you’re done with this section."
  },
  [key("forces", "forces-hub-positive-inside")]: {
    kicker: "Checkpoint",
    message:
      "You just explored forces that could help {company} — the inside strengths that compound.",
    learnedIntro: "Strategic lenses you just used",
    learned: [
      "Strengths {company} controls from the inside",
      "How those strengths show up in real business",
      "Why internal tailwinds can support the stock"
    ],
    momentum: "Now test the strategy."
  },
  [key("forces", "forces-hub-positive-outside")]: {
    kicker: "Nice work",
    message:
      "You just explored forces that could help {company} — the outside tailwinds pushing demand.",
    learnedIntro: "Strategic lenses you just used",
    learned: [
      "Favorable trends outside {company}'s control",
      "How those trends could lift demand or margins",
      "Why external boosts still matter to investors"
    ],
    momentum: "Quick checkpoint quiz."
  },
  [key("forces", "forces-hub-negative-inside")]: {
    kicker: "Checkpoint cleared",
    message:
      "You just explored forces that could hurt {company} — the inside risks that can snowball.",
    learnedIntro: "Strategic lenses you just used",
    learned: [
      "Internal weaknesses that could hurt {company}",
      "How those risks might play out in real life",
      "Why self-inflicted problems worry investors fast"
    ],
    momentum: "Let’s see what you caught."
  },
  [key("forces", "forces-hub-negative-outside")]: {
    kicker: "Checkpoint",
    message:
      "You just explored forces that could hurt {company} — outside headwinds like rules and rivals.",
    learnedIntro: "Strategic lenses you just used",
    learned: [
      "Outside threats: regulation, competition, macro shifts",
      "How headwinds could squeeze {company}'s results",
      "Why external risk is part of every stock story"
    ],
    momentum: "Quick checkpoint quiz."
  }
} as Partial<Record<MasteryKey, InvestorMasteryContent>>;

type ForcesTopicBucket =
  | "positive-inside"
  | "positive-outside"
  | "negative-inside"
  | "negative-outside";

const FORCES_TOPIC_FALLBACKS: Record<ForcesTopicBucket, InvestorMasteryContent> = {
  "positive-inside": {
    kicker: "Nice work",
    message: "You're building a sharper picture of {company}'s internal strengths.",
    learnedIntro: "Strategic lenses you just used",
    learned: [
      "A specific strength {company} has inside its control",
      "How that strength shows up for customers or partners",
      "Why this kind of edge can support investor confidence"
    ],
    momentum: "Now test the strategy."
  },
  "positive-outside": {
    kicker: "Checkpoint",
    message: "You're noticing tailwinds that could lift {company}.",
    learnedIntro: "Strategic lenses you just used",
    learned: [
      "An outside trend working in {company}'s favor",
      "How that trend could help sales or margins",
      "Why external boosts still move stock prices"
    ],
    momentum: "Quick checkpoint quiz."
  },
  "negative-inside": {
    kicker: "Checkpoint cleared",
    message: "You're learning what could go wrong inside {company}.",
    learnedIntro: "Strategic lenses you just used",
    learned: [
      "An internal risk {company} needs to manage",
      "What could happen if that risk gets worse",
      "Why inside problems can hit a stock quickly"
    ],
    momentum: "Let’s see what you caught."
  },
  "negative-outside": {
    kicker: "Checkpoint",
    message: "You're watching headwinds that could pressure {company}.",
    learnedIntro: "Strategic lenses you just used",
    learned: [
      "An outside threat {company} can't fully ignore",
      "How that threat could show up in results",
      "Why external risks belong in every investor checklist"
    ],
    momentum: "Quick checkpoint quiz."
  }
};

function forcesTopicBucket(slug: string): ForcesTopicBucket | null {
  if (slug.startsWith("positive-inside-")) return "positive-inside";
  if (slug.startsWith("positive-outside-")) return "positive-outside";
  if (slug.startsWith("negative-inside-")) return "negative-inside";
  if (slug.startsWith("negative-outside-")) return "negative-outside";
  return null;
}

import { normalizeQuestProseDashes } from "@/lib/quests/normalizeQuestProse";

function bindContent(
  companyName: string,
  content: InvestorMasteryContent
): InvestorMasteryContent {
  return {
    kicker: normalizeQuestProseDashes(withCompany(companyName, content.kicker)),
    message: normalizeQuestProseDashes(withCompany(companyName, content.message)),
    learnedIntro: normalizeQuestProseDashes(
      withCompany(companyName, content.learnedIntro)
    ),
    learned: content.learned.map((item) =>
      normalizeQuestProseDashes(withCompany(companyName, item))
    ),
    momentum: normalizeQuestProseDashes(withCompany(companyName, content.momentum))
  };
}

const GENERIC_FALLBACK = {
  kicker: "Nice work",
  message: "You're building real investor instincts on {company}.",
  learnedIntro: "You now understand",
  learned: [
    "The core idea this quest section was teaching",
    "How it connects to {company}'s business story",
    "Why investors pay attention to this topic"
  ],
  momentum: "Quick checkpoint quiz."
} satisfies InvestorMasteryContent;

export function getInvestorMasteryContent(params: {
  companyName: string;
  pillarId: PillarId;
  questSlug: string;
  questTitle?: string;
}): InvestorMasteryContent {
  const { companyName, pillarId, questSlug } = params;
  const direct = MASTERY_BY_SECTION[key(pillarId, questSlug)];
  if (direct) return bindContent(companyName, direct);

  if (pillarId === "forces") {
    const bucket = forcesTopicBucket(questSlug);
    if (bucket) {
      return bindContent(companyName, FORCES_TOPIC_FALLBACKS[bucket]);
    }
  }

  return bindContent(companyName, GENERIC_FALLBACK);
}

export function investorMasteryTitle(companyName: string): string {
  return `${companyName} Investor Mastery`;
}
