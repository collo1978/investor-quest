import { getIslandRule } from "@/data/contentRules";
import { pillarById, type PillarId, type PillarMeta } from "@/data/pillars";
import { contentKey } from "@/data/quests/content/types";
import type { QuestContentOverride } from "@/data/quests/content/types";
import { CONTROLLED_DEMO_MODE } from "@/lib/demo/controlledDemo";
import { resolveDemoQuestLearningRules } from "@/lib/demo/nvidiaDemoLearningDesign";

export {
  NVDA_DEMO_SOURCE,
  NVDA_DEMO_SOURCE_GEO,
  NVDA_DEMO_SOURCE_TEAM,
  NVDA_DEMO_TAGLINE
} from "@/lib/demo/nvidiaDemoSources";

/** True when controlled NVIDIA demo copy should apply (not a React hook). */
export function isNvidiaDemoVoiceActive(): boolean {
  return CONTROLLED_DEMO_MODE;
}

export function nvidiaIslandQuizPassMessage(
  pillarId: PillarId,
  slug: string
): string {
  if (pillarId === "business") {
    switch (slug) {
      case "what-they-do":
        return "You can explain NVIDIA using real stuff you already know — games, AI apps, speed. That's the whole unlock, and you just got it.";
      case "why-buying":
        return "You see who's really paying them — not just the ticker. Imagine one giant customer pausing; you'd feel why that matters.";
      case "everyday-life":
        return "You can point to where NVIDIA shows up in life — fast AI, smooth games — not just a stock symbol.";
      case "how-it-works":
        return "You get the journey from design to factory to your world. It's like following how a product gets made, not magic.";
      case "why-they-stay":
        return "You get why they're hard to copy — habit, speed, trust. That's the difference between hype and a real edge.";
      case "competition":
        return "You see the fight they're in, what could speed them up, and what could slow them down. The story finally clicks.";
      default:
        return "Business level-up — you're connecting NVIDIA to real life, not memorizing jargon.";
    }
  }
  if (pillarId === "financials") {
    switch (slug) {
      case "growth":
        return "You get why sales jumped and why people get nervous too — like a trend everyone copies until one day they don't.";
      case "profitability":
        return "You know if they're making real money, not just loud headlines. Think sold-out drops vs. empty shelves.";
      case "expenses":
        return "You see where the money goes and what that says about tomorrow — training harder because rivals got faster.";
      case "cash":
        return "You get cash in the bank — money that actually showed up, not just buzz.";
      case "financial-strength":
        return "You checked if they're on solid ground — savings-for-a-bad-month energy.";
      default:
        return "Money part clicked — you're reading this like real life, not a textbook.";
    }
  }
  if (pillarId === "forces") {
    switch (slug) {
      case "forces-hub-positive-inside":
        return "Positive inside — done. You read the topics and passed the quiz. That's a real section finish.";
      case "forces-hub-positive-outside":
        return "Outside tailwinds — locked in. Topics plus quiz means this category actually counts.";
      case "forces-hub-negative-inside":
        return "Inside risks — you finished the deck and the quiz. You know what could hurt from within.";
      case "forces-hub-negative-outside":
        return "Outside headwinds — complete. You're not guessing about competition and rules anymore.";
      default:
        return "You spotted something that could help or hurt them — inside or outside. Finish the category quiz when every topic is read.";
    }
  }
  if (pillarId === "management") {
    switch (slug) {
      case "mgmt-1":
        return "You met who's in charge and why that face matters — like knowing the coach, not just the jersey.";
      case "mgmt-quiz":
        return "You saw how boss pay works — when their wallet moves with the stock, incentives change.";
      case "mgmt-2":
        return "You know who's supposed to ask hard questions, not just cheer.";
      case "mgmt-governance":
        return "You get the basic rules — boring pages, real power underneath.";
      case "mgmt-financial-strength":
        return "You connected the bosses to real money in the bank — promises vs. savings.";
      default:
        return "People part done — you're not guessing from a logo anymore.";
    }
  }
  return "Level up — you earned it.";
}

export const NVDA_ONBOARDING = {
  step1Title: "Pick 2 interests",
  step1TitleAccent: "",
  step1Subtitle: "Will pick a stock to match.",
  step1Continue: "Next",
  step1Footnote: "About a minute — promise",

  step2Title: "Swipe names you know",
  step2Subtitle:
    "You'll swipe companies you'd recognize from real life. Your real journey starts with NVIDIA — we're just showing you how the game works.",

  matchScan: "Finding a company you'll actually get…",
  matchSlow: ["Still looking…", "Almost there…", "Locked in"],
  matchLocked: "Your first deep-dive: NVIDIA",
  matchUnlock: "You're starting with NVIDIA",
  matchPick: "Based on what you picked, we're starting with NVIDIA — the chips behind a lot of AI you already use",
  matchStart: "First up: understand NVIDIA like a friend would explain it",
  matchCta: "Go to the map",

  questMatchWaiting: "Picking your first company…"
} as const;

export const NVDA_DEMO_GATE = {
  wrongCompany:
    "This walkthrough follows NVIDIA only — the company behind a lot of AI and games you already touch. Head back to the map.",
  wrongCompanyTitle: "NVIDIA demo",
  questMissing:
    "That card isn't ready yet. Tap another on the island — plenty more to explore.",
  questMissingTitle: "Try another card"
} as const;

export const NVDA_PIPELINE_LINES: readonly string[] = [
  "Setting up your explainer…",
  "Almost ready — real-life examples, not jargon",
  "Making it something you'd actually repeat to a friend…"
];

/** Island blurbs — subtitles are editorial; descriptions align with ISLAND_RULES. */
export const NVDA_PILLAR_COPY: Record<
  PillarId,
  { subtitle: string; description: string; playerFeeling: string }
> = {
  business: {
    subtitle: "Six chapters — from what they do to who they fight.",
    description:
      "What NVIDIA does, why the world buys, everyday life, how it works, why customers stay, and the competition — each section feels different, each ends with a checkpoint quiz.",
    playerFeeling: getIslandRule("business").playerFeeling
  },
  financials: {
    subtitle: "Follow the money with real-life comparisons.",
    description:
      "Vital-sign signals: growth, profit, cash, and strength — can this company handle trouble?",
    playerFeeling: getIslandRule("financials").playerFeeling
  },
  forces: {
    subtitle: "What's pushing them forward or holding them back.",
    description:
      "Inside vs outside, help vs hurt — cause and effect on what might move NVIDIA next.",
    playerFeeling: getIslandRule("forces").playerFeeling
  },
  management: {
    subtitle: "Who's in charge and whether you trust them.",
    description:
      "Leadership, pay alignment, and oversight — would you trust these people with your money?",
    playerFeeling: getIslandRule("management").playerFeeling
  }
};

type QuestLabel = Pick<
  QuestContentOverride,
  "title" | "investorQuestion" | "objective" | "description" | "whyItMatters"
>;

const NVDA_QUEST_LABELS: Record<string, QuestLabel> = {
  [contentKey("business", "what-they-do")]: {
    title: "WHAT NVIDIA DOES",
    investorQuestion: "What does NVIDIA actually sell?",
    objective: "Explain the company in normal language.",
    whyItMatters:
      "If you can't explain it in everyday words, you're guessing about the stock."
  },
  [contentKey("business", "why-buying")]: {
    title: "WHY THE WORLD IS BUYING NVIDIA",
    investorQuestion: "Who spends the most money with NVIDIA?",
    objective: "See where the money comes from and why demand is hot.",
    whyItMatters:
      "When a few big customers pay most of the bills, one pause in orders can hurt fast."
  },
  [contentKey("business", "everyday-life")]: {
    title: "HOW NVIDIA FITS INTO EVERYDAY LIFE",
    investorQuestion: "Where do people interact with NVIDIA technology?",
    objective: "Connect the company to apps and games you already know.",
    whyItMatters:
      "Real-life links turn a ticker into something you can actually picture."
  },
  [contentKey("business", "how-it-works")]: {
    title: "HOW THE BUSINESS REALLY WORKS",
    investorQuestion: "How are NVIDIA chips designed and built?",
    objective: "Follow design → factory → delivery in plain steps.",
    whyItMatters:
      "Late chips feel like a delayed preorder — customers notice when shipments slip."
  },
  [contentKey("business", "why-they-stay")]: {
    title: "WHY CUSTOMERS KEEP CHOOSING NVIDIA",
    investorQuestion: "Why is NVIDIA hard to replace?",
    objective: "Trust, habit, and speed — not hype.",
    whyItMatters:
      "A real edge beats one hot year — customers stick when switching is painful."
  },
  [contentKey("business", "competition")]: {
    title: "THE COMPETITION NVIDIA FACES",
    investorQuestion: "Who is trying to compete with NVIDIA?",
    objective: "Name rivals, tailwinds, and what could slow them down.",
    whyItMatters:
      "You need the competitive picture before you judge if the lead can last."
  },
  [contentKey("financials", "growth")]: {
    title: "When sales took off",
    investorQuestion: "Why did sales jump — and why do people get nervous about it slowing?",
    objective: "The AI order rush in everyday terms.",
    whyItMatters:
      "A trend everyone chases can reverse — you've seen crazes cool off before."
  },
  [contentKey("financials", "profitability")]: {
    title: "Real money or just hype?",
    investorQuestion: "Are they profiting like a sold-out drop, or just loud online?",
    objective: "Profit and your slice of it — pizza metaphor included.",
    whyItMatters:
      "Headlines excite; what lands per owner is what you actually feel."
  },
  [contentKey("financials", "expenses")]: {
    title: "Where the money goes",
    investorQuestion: "What are they spending on — and is it like training for next season?",
    objective: "People, invention, staying ahead.",
    whyItMatters:
      "Spending tells you what they think is coming — save vs. invest in the next hit."
  },
  [contentKey("financials", "cash")]: {
    title: "Cash in the bank",
    investorQuestion: "Did customers actually pay — like money hitting your account?",
    objective: "Real cash vs. buzz.",
    whyItMatters:
      "Savings help when sales dip — same reason you like a buffer in your account."
  },
  [contentKey("financials", "financial-strength")]: {
    title: "Solid or shaky?",
    investorQuestion: "Could they handle a bad few months — like you with savings?",
    objective: "Debt, cash, promises ahead.",
    whyItMatters:
      "Breathing room matters when demand can flip as fast as a trend online."
  },
  [contentKey("management", "mgmt-1")]: {
    title: "Who runs it",
    investorQuestion: "Who's the face — and what happens if they ever leave?",
    objective: "Leader, track record, big bets.",
    whyItMatters:
      "You're trusting people, not a logo — like following a coach, not just the uniform."
  },
  [contentKey("management", "mgmt-quiz")]: {
    title: "How bosses get paid",
    investorQuestion: "When the stock moves, does their wallet move too?",
    objective: "Salary, bonus, stock — in human terms.",
    whyItMatters:
      "Pay shapes behavior — bonus after a losing season feels different."
  },
  [contentKey("management", "mgmt-2")]: {
    title: "Who asks the hard questions",
    investorQuestion: "Who's the friend in the group who says \"are we sure?\"",
    objective: "What the board watches.",
    whyItMatters:
      "One boss forever makes oversight matter — guardrails on a fast ride."
  },
  [contentKey("management", "mgmt-governance")]: {
    title: "Rules you can read",
    investorQuestion: "Do owners get a real vote — like picking club leaders?",
    objective: "Votes, pay rules, transparency.",
    whyItMatters:
      "Boring pages can stop surprise rule changes that hit you later."
  },
  [contentKey("management", "mgmt-financial-strength")]: {
    title: "Bosses & the bank account",
    investorQuestion: "Do they have savings for a rough month and still fund the next chip?",
    objective: "Connect talk to real money.",
    whyItMatters:
      "Promises meet the bank account — like paycheck vs. what you actually saved."
  },
  [contentKey("management", "management-summary")]: {
    title: "People story recap",
    investorQuestion: "What's the one-minute version you'd tell a friend?",
    objective: "Boss, pay, board — tied together.",
    whyItMatters:
      "People risk is still risk — even behind the AI apps you use daily."
  }
};

export function getNvidiaDemoQuestLabelOverride(
  pillarId: PillarId,
  slug: string
): QuestLabel | undefined {
  return NVDA_QUEST_LABELS[contentKey(pillarId, slug)];
}

export function mergeNvidiaDemoQuestOverride(
  pillarId: PillarId,
  slug: string,
  base: QuestContentOverride | undefined
): QuestContentOverride | undefined {
  if (!isNvidiaDemoVoiceActive()) return base;
  const labels = getNvidiaDemoQuestLabelOverride(pillarId, slug);
  if (!labels && !base) return undefined;
  let merged: QuestContentOverride = { ...labels, ...base };
  const rules = resolveDemoQuestLearningRules(
    pillarId,
    slug,
    merged.investorQuestion ?? labels?.investorQuestion
  );
  if (rules) {
    merged = {
      ...merged,
      objective: merged.objective ?? rules.section.teachingGoal
    };
  }
  return merged;
}

export function demoPillarById(id: PillarId): PillarMeta {
  const meta = pillarById(id);
  if (!isNvidiaDemoVoiceActive()) return meta;
  const copy = NVDA_PILLAR_COPY[id];
  return { ...meta, subtitle: copy.subtitle, description: copy.description };
}

export const NVDA_MISSION_BRIEF = {
  kicker: "Business island",
  title: "Your first mission",
  lead: "Start simple: what does NVIDIA do in your world — games, AI apps, the stuff you actually touch?",
  stepsTitle: "Here's the loop",
  steps: [
    "Read short cards with real-life examples",
    "Pass a quick quiz",
    "Unlock the next spot on the map"
  ],
  cta: "Let's go"
} as const;

export const NVDA_CONVICTION = {
  kicker: (pillar: string) => `${pillar} — nice, you get it now`,
  heading: "How confident do you feel?",
  body: (xp: number, hasNext: boolean) =>
    hasNext
      ? `Pick what fits, grab +${xp} XP, and we'll open the next island — you're building a real picture, not memorizing terms.`
      : `Pick what fits and grab +${xp} XP — you're starting to explain NVIDIA like you'd explain a game you love.`,
  nextUnlock: "Up next"
} as const;

export const NVDA_UNLOCK_FX = {
  title: "New island unlocked",
  detail: "It's live on the map — keep going and connect the next piece to real life."
} as const;

export const NVDA_ISLAND_BANNER = (companyName: string, pillarTitle: string) =>
  `${companyName} · ${pillarTitle} — tap a quest; we'll use examples from stuff you already know.`;

export const NVDA_DEMO_GATE_PILLAR =
  "This demo walks Business, Financials, Forces, and Management on the map — each uses real-life examples, not finance class.";
