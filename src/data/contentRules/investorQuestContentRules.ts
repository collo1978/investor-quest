/**
 * Investor Quest — Adaptive Learning Design (MVP rules brain)
 *
 * Central source of truth for how each island and section should TEACH and FEEL.
 * Code-only for now — not in Supabase, no admin UI.
 *
 * Future: quest pipelines, copy review, and LLM prompts should call
 * `getIslandRule`, `getSectionRule`, and `getQuestionTypeRule` so generated
 * answers match island identity + the actual question.
 */
import type { PillarId } from "@/data/pillars";
import type { ForcesCategoryId } from "@/data/quests/forcesCategories";

// -----------------------------------------------------------------------------
// Shared rule shape
// -----------------------------------------------------------------------------

export type ContentRuleBase = {
  /** What the player should learn in this context. */
  teachingGoal: string;
  /** Emotional register for copy and UI chrome. */
  emotionalTone: string;
  /** How answers should be written. */
  answerStyle: string;
  /** How content appears on screen (cards, signals, forces, trust, etc.). */
  presentationStyle: string;
  /** Quiz / deck interactions that fit this context. */
  interactionStyle: string;
  /** Banned tone, jargon, or patterns. */
  avoid: readonly string[];
  /** Short pattern description for writers and generators. */
  exampleAnswerStyle: string;
};

export type IslandRule = ContentRuleBase & {
  pillarId: PillarId;
  /** One-line player payoff after the section/island. */
  playerFeeling: string;
};

export type SectionRule = ContentRuleBase & {
  pillarId: PillarId;
  sectionId: string;
  sectionLabel: string;
};

export type QuestionTypeId =
  | "company-understanding"
  | "problem-solved"
  | "business-model"
  | "competitive-advantage"
  | "market-position"
  | "financial-health"
  | "force-help"
  | "force-hurt"
  | "management-trust"
  | "risk-awareness";

export type QuestionTypeRule = ContentRuleBase & {
  id: QuestionTypeId;
  label: string;
  /** Example question stems this rule applies to. */
  exampleQuestions: readonly string[];
};

// -----------------------------------------------------------------------------
// Island-level rules (four pillars)
// -----------------------------------------------------------------------------

export const ISLAND_RULES: Record<PillarId, IslandRule> = {
  business: {
    pillarId: "business",
    teachingGoal:
      "Help the player understand what the company actually does in plain life terms.",
    emotionalTone: "Curious, friendly, conversational — like a smart friend.",
    answerStyle:
      "Relatable examples, human explanations, everyday language; complete the loop (situation → insight → what the company does).",
    presentationStyle:
      "Story cards, real-life comparisons, “you already understand this” moments.",
    interactionStyle:
      "Conversational cards, simple quizzes, explain-it-back moments.",
    playerFeeling: "Ohhh, I finally get this company.",
    avoid: [
      "SEC filing tone",
      "analyst jargon",
      "infrastructure / enterprise / accelerated",
      "same opener on every card",
      "answers that stop before saying what the company does"
    ],
    exampleAnswerStyle:
      "“NVIDIA makes chips that power AI and games you use — when ChatGPT feels fast, there’s a good chance their tech helped.”"
  },
  financials: {
    pillarId: "financials",
    teachingGoal:
      "Help the player judge if the company looks financially healthy.",
    emotionalTone: "Clear, visual, signal-based — company vital signs.",
    answerStyle:
      "Simple money language, trend spotting, health-check signals (strong / watch / weak).",
    presentationStyle:
      "Dashboard feel, green/yellow/red signals, simple charts, vital signs.",
    interactionStyle:
      "Healthy vs unhealthy, spot the trend, metric signal checks.",
    playerFeeling: "I can quickly see if this company looks healthy.",
    avoid: [
      "dense accounting lectures",
      "ratio soup without meaning",
      "hype without numbers",
      "ignoring whether trends are improving or fading"
    ],
    exampleAnswerStyle:
      "“Sales shot up because everyone ordered AI chips — strong signal. The watch-out: what if those orders slow?”"
  },
  forces: {
    pillarId: "forces",
    teachingGoal:
      "Help the player understand what could help or hurt the company next.",
    emotionalTone: "Strategic, future-focused, cause-and-effect.",
    answerStyle:
      "Simple “this helps because…” / “this hurts because…” language; land the impact on the company.",
    presentationStyle:
      "Bullish vs bearish, push/pull forces, storm vs sunlight metaphors.",
    interactionStyle:
      "Sort impacts, rank risks, choose strongest force; category quiz after all topics read.",
    playerFeeling: "I can see what might move this company next.",
    avoid: [
      "generic risk lists with no cause",
      "politics with no business link",
      "same lag/ChatGPT example on every force",
      "forgetting to say help OR hurt for NVIDIA"
    ],
    exampleAnswerStyle:
      "“If giant buyers pause chip orders, NVIDIA’s sales cool fast — that outside headwind hits revenue before the hype fades.”"
  },
  management: {
    pillarId: "management",
    teachingGoal:
      "Help the player decide if they trust the people running the company.",
    emotionalTone: "Human, judgment-based, trust-focused.",
    answerStyle:
      "Plain-English leadership judgment, shareholder alignment, decision quality.",
    presentationStyle: "Trust meter, leadership profiles, boardroom feel.",
    interactionStyle:
      "Trust score, would-you-approve moments, alignment checks.",
    playerFeeling: "Would I trust these people with my money?",
    avoid: [
      "CEO worship without results",
      "proxy jargon walls",
      "ignoring pay alignment",
      "answers that don’t answer who decides what"
    ],
    exampleAnswerStyle:
      "“The CEO has been there decades and bet early on AI — results backed the story, but you’re still trusting one face with the wheel.”"
  }
};

// -----------------------------------------------------------------------------
// Island quiz checkpoints — same loop, different checkpoint *kind*
// learn cards → island-style interaction → quiz → XP/progress
// -----------------------------------------------------------------------------

export type IslandQuizRule = {
  pillarId: PillarId;
  /** Short UI label — e.g. "Understanding check", "Health check". */
  quizKind: string;
  /** The question the checkpoint answers for the player. */
  checkpointGoal: string;
  emotionalTone: string;
  /** How quiz questions should feel (not exam-style). */
  interactionStyle: string;
  /** Headline on the unlocked intro screen. */
  unlockedHeadline: string;
  /** Body copy before Start — receives required correct count and total. */
  readyIntro: (requiredCorrect: number, total: number) => string;
  /** Primary CTA to begin the checkpoint. */
  startCta: string;
  /** Locked-state hint when cards remain. */
  lockedHint: string;
  /** Default pass line when no section-specific copy exists. */
  defaultPassMessage: string;
  /** Question kinds that fit this island (for generators). */
  preferredQuestionKinds: readonly string[];
  /** In-quiz encouragement copy. */
  playingFeedback: {
    prompt: string;
    correct: string;
    wrong: string;
  };
};

export const ISLAND_QUIZ_RULES: Record<PillarId, IslandQuizRule> = {
  business: {
    pillarId: "business",
    quizKind: "Understanding check",
    checkpointGoal: "Do you understand what the company does?",
    emotionalTone: "Curious, friendly, conversational — explain-it-back.",
    interactionStyle:
      "Conversational MC and scenarios; plain-language “what do they actually do?” — alternate formats (never same kind twice in a row).",
    unlockedHeadline: "Understanding check unlocked",
    readyIntro: (required, total) =>
      `Explain it back in everyday words — get ${required} of ${total} right to show you can say what this company actually does.`,
    startCta: "Start understanding check",
    lockedHint: "Read every insight card first — then prove you get what the company does.",
    defaultPassMessage:
      "You can explain what this company does in normal life terms — that's the unlock.",
    preferredQuestionKinds: [
      "multiple-choice",
      "scenario",
      "fill-blank",
      "true-false"
    ],
    playingFeedback: {
      prompt: "",
      correct: "Yep — you get what they do",
      wrong: "Close — read the why, then keep going"
    }
  },
  financials: {
    pillarId: "financials",
    quizKind: "Health check",
    checkpointGoal:
      "Can you spot if the company looks financially strong or weak?",
    emotionalTone: "Clear, visual, signal-based — vital signs not lectures.",
    interactionStyle:
      "Healthy vs weak, spot the trend, traffic-light signals — one number idea max per explain.",
    unlockedHeadline: "Health check unlocked",
    readyIntro: (required, total) =>
      `Read the money vital signs — score ${required} of ${total} to show you can spot strong vs weak financial signals.`,
    startCta: "Run health check",
    lockedHint:
      "Finish the cards first — then run the health check on this slice.",
    defaultPassMessage:
      "You can spot whether this company looks financially strong or weak at a glance.",
    preferredQuestionKinds: [
      "red-flag",
      "risk-meter",
      "true-false",
      "multiple-choice",
      "scenario"
    ],
    playingFeedback: {
      prompt: "Strong signal, watch, or weak?",
      correct: "Good read — that's the signal",
      wrong: "Check the trend — try the next one"
    }
  },
  forces: {
    pillarId: "forces",
    quizKind: "Strategy checkpoint",
    checkpointGoal: "Can you tell what helps or hurts the company?",
    emotionalTone: "Strategic, future-focused, cause-and-effect.",
    interactionStyle:
      "Help vs hurt, rank impacts, bull/bear stance — always land *because* it moves the company.",
    unlockedHeadline: "Strategy checkpoint unlocked",
    readyIntro: (required, total) =>
      `Name what pushes or pulls this company — ${required} of ${total} right to lock this force quadrant.`,
    startCta: "Start strategy checkpoint",
    lockedHint:
      "Read every force topic in this section — then prove you see what helps or hurts.",
    defaultPassMessage:
      "You can name what might help or hurt this company next — not just buzzwords.",
    preferredQuestionKinds: [
      "bull-bear",
      "scenario",
      "odd-one-out",
      "red-flag",
      "multiple-choice"
    ],
    playingFeedback: {
      prompt: "What helps or hurts — and why?",
      correct: "Sharp call — you see the force",
      wrong: "Think cause → effect on the company"
    }
  },
  management: {
    pillarId: "management",
    quizKind: "Trust judgment",
    checkpointGoal:
      "Would you trust the people running the company with your money?",
    emotionalTone: "Human, judgment-based, trust-focused.",
    interactionStyle:
      "Would-you-trust, alignment checks, pay vs results — boardroom judgment not hero worship.",
    unlockedHeadline: "Trust checkpoint unlocked",
    readyIntro: (required, total) =>
      `Judge the people and the pay — ${required} of ${total} right to show you'd trust them with your money.`,
    startCta: "Start trust checkpoint",
    lockedHint:
      "Read the leadership cards first — then answer whether you'd trust this team.",
    defaultPassMessage:
      "You sized up the people running the company — trust is earned, and you're asking the right questions.",
    preferredQuestionKinds: [
      "true-false",
      "scenario",
      "multiple-choice",
      "red-flag"
    ],
    playingFeedback: {
      prompt: "Would you trust this call?",
      correct: "Solid judgment — keep that lens",
      wrong: "Alignment matters — review and continue"
    }
  }
};

// -----------------------------------------------------------------------------
// Section-level rules — Business
// -----------------------------------------------------------------------------

export type BusinessSectionId =
  | "what-they-do"
  | "why-buying"
  | "everyday-life"
  | "how-it-works"
  | "why-they-stay"
  | "competition"
  | "who-competes";

/** Per-section checkpoint — same quiz loop, different emotional register. */
export type BusinessSectionQuizRule = Pick<
  IslandQuizRule,
  | "quizKind"
  | "checkpointGoal"
  | "emotionalTone"
  | "interactionStyle"
  | "unlockedHeadline"
  | "startCta"
  | "lockedHint"
  | "defaultPassMessage"
  | "playingFeedback"
> & {
  readyIntro: IslandQuizRule["readyIntro"];
};

export const BUSINESS_SECTION_QUIZ_RULES: Record<
  BusinessSectionId,
  BusinessSectionQuizRule
> = {
  "what-they-do": {
    quizKind: "Understanding check",
    checkpointGoal: "Do you understand what the company actually does?",
    emotionalTone: "Curious, friendly, conversational — explain-it-back.",
    interactionStyle:
      "Conversational MC and scenarios; plain-language “what do they actually do?”",
    unlockedHeadline: "Understanding check unlocked",
    readyIntro: (required, total) =>
      `Explain it back in everyday words — ${required} of ${total} right to show you get what this company actually does.`,
    startCta: "Start understanding check",
    lockedHint: "Read all three cards first — then prove you get what this company actually does.",
    defaultPassMessage:
      "You can explain what this company does in normal life terms — that's the foundation.",
    playingFeedback: {
      prompt: "",
      correct: "Yep — you get what they do",
      wrong: "Close — read the why, then keep going"
    }
  },
  "why-buying": {
    quizKind: "Business model check",
    checkpointGoal: "Do you understand why customers spend money here?",
    emotionalTone: "Clear, practical, factual — money trail without jargon.",
    interactionStyle:
      "Who pays, what sells, why demand is hot — one fact per beat.",
    unlockedHeadline: "Business model check unlocked",
    readyIntro: (required, total) =>
      `Follow the money — ${required} of ${total} right to show you know why buyers keep spending.`,
    startCta: "Start business model check",
    lockedHint: "Read every card on demand and customers — then run the check.",
    defaultPassMessage:
      "You know where the money comes from and who writes the biggest checks.",
    playingFeedback: {
      prompt: "Who pays and why?",
      correct: "Sharp — that's the money story",
      wrong: "Think who writes the big checks"
    }
  },
  "everyday-life": {
    quizKind: "Real-world connection check",
    checkpointGoal: "Can you connect the company to everyday life?",
    emotionalTone: "Relatable, warm, “ohhh I use that” energy.",
    interactionStyle:
      "Apps, games, AI tools you know — tie chips to touchpoints.",
    unlockedHeadline: "Real-world check unlocked",
    readyIntro: (required, total) =>
      `Connect the dots to real life — ${required} of ${total} right to show you see where this company shows up.`,
    startCta: "Start real-world check",
    lockedHint: "Read all five cards — then connect the dots.",
    defaultPassMessage:
      "You can point to where this company shows up in life — not just on a chart.",
    playingFeedback: {
      prompt: "Where do you actually meet this company?",
      correct: "That's the real-world link",
      wrong: "Picture an app or game you use"
    }
  },
  "how-it-works": {
    quizKind: "How it works check",
    checkpointGoal: "Do you understand how the business machine works?",
    emotionalTone: "Behind-the-scenes, visual journey.",
    interactionStyle:
      "Design → build → ship — trace the machine in plain steps.",
    unlockedHeadline: "How it works check unlocked",
    readyIntro: (required, total) =>
      `Trace the machine — ${required} of ${total} right to show you get how products actually get made and delivered.`,
    startCta: "Start how-it-works check",
    lockedHint: "Read the behind-the-scenes cards — then trace the machine.",
    defaultPassMessage:
      "You see how the business runs — design, partners, delivery — not magic.",
    playingFeedback: {
      prompt: "What happens first in the machine?",
      correct: "You traced it right",
      wrong: "Follow design → build → deliver"
    }
  },
  "why-they-stay": {
    quizKind: "Why they stay check",
    checkpointGoal: "Do you understand why customers stay?",
    emotionalTone: "Trust, strength, confidence-building.",
    interactionStyle:
      "Switching cost, habit, trusted name — why buyers stick.",
    unlockedHeadline: "Why they stay check unlocked",
    readyIntro: (required, total) =>
      `Name why customers stick — ${required} of ${total} right to show you get the edge.`,
    startCta: "Start why-they-stay check",
    lockedHint: "Read the loyalty and moat cards — then prove you get why they stay.",
    defaultPassMessage:
      "You get why customers keep choosing them — trust and habit, not just hype.",
    playingFeedback: {
      prompt: "Why is switching painful?",
      correct: "That's the stickiness",
      wrong: "Think trust, tools, and habit"
    }
  },
  competition: {
    quizKind: "Strategy check",
    checkpointGoal: "Do you understand the battlefield around the company?",
    emotionalTone: "Strategic, future-focused, clear-eyed.",
    interactionStyle:
      "Rivals, tailwinds, headwinds — cause and effect on the company.",
    unlockedHeadline: "Strategy check unlocked",
    readyIntro: (required, total) =>
      `Read the battlefield — ${required} of ${total} right to show you see rivals, trends, and risks.`,
    startCta: "Start strategy check",
    lockedHint: "Read competition and future-risk cards — then run the strategy check.",
    defaultPassMessage:
      "You see who they fight, what could accelerate them, and what could slow them down.",
    playingFeedback: {
      prompt: "Help, hurt, or rival move?",
      correct: "Sharp strategic read",
      wrong: "Land the effect on the company"
    }
  },
  "who-competes": {
    quizKind: "Competitor check",
    checkpointGoal: "Can you name who the company is competing against?",
    emotionalTone: "Clear-eyed, factual — rivals by category.",
    interactionStyle:
      "Named competitors in chips, big tech, CPUs, devices, and networking.",
    unlockedHeadline: "Competitor check unlocked",
    readyIntro: (required, total) =>
      `Name the rivals — ${required} of ${total} right to show you know who they fight.`,
    startCta: "Start competitor check",
    lockedHint: "Read every competitor card — then run the check.",
    defaultPassMessage:
      "You can name who competes with this company across chips, tech, and networking.",
    playingFeedback: {
      prompt: "Who is the rival here?",
      correct: "You know the battlefield",
      wrong: "Scan the company lists again"
    }
  }
};

export const BUSINESS_SECTION_RULES: Record<BusinessSectionId, SectionRule> = {
  "what-they-do": {
    pillarId: "business",
    sectionId: "what-they-do",
    sectionLabel: "What they do",
    teachingGoal: "Explain the company in normal life terms instantly.",
    emotionalTone: "Friendly, conversational, relatable.",
    answerStyle:
      "WHAT they sell first, then why customers buy — different opener per card.",
    presentationStyle: "Short story cards, one idea per card.",
    interactionStyle: "Read cards → understanding check.",
    avoid: ["opening every card the same way", "filing placeholders", "jargon before the WHAT"],
    exampleAnswerStyle:
      "“NVIDIA makes chips behind a lot of AI and gaming — when ChatGPT feels fast, their tech is often in the loop.”"
  },
  "why-buying": {
    pillarId: "business",
    sectionId: "why-buying",
    sectionLabel: "Why the world is buying",
    teachingGoal: "Explain demand and where the money comes from.",
    emotionalTone: "Clear, practical, factual — still easy.",
    answerStyle:
      "Who pays biggest, which products print money, why the AI rush — scannable facts, one hook each.",
    presentationStyle: "Money trail, concentration callouts.",
    interactionStyle: "Who buys → what sells → why now.",
    avoid: ["SEC not disclosed as the whole answer", "hiding who the big customers are"],
    exampleAnswerStyle:
      "“Most dollars are cloud giants reordering AI chips — not you buying one card at the mall.”"
  },
  "everyday-life": {
    pillarId: "business",
    sectionId: "everyday-life",
    sectionLabel: "Everyday life",
    teachingGoal: "Connect the company to things people already know.",
    emotionalTone: "Relatable, warm, real-world.",
    answerStyle:
      "Apps, games, AI tools, developer habit — where you meet them without investor jargon.",
    presentationStyle: "Touchpoints and “you already use this” moments.",
    interactionStyle: "Real-world connection check after cards.",
    avoid: ["abstract chip talk with no app or game example", "repeating card-1 product list"],
    exampleAnswerStyle:
      "“You meet NVIDIA when a game looks incredible or an AI app answers in seconds — speed you can feel.”"
  },
  "how-it-works": {
    pillarId: "business",
    sectionId: "how-it-works",
    sectionLabel: "How it works",
    teachingGoal: "Explain operations and systems simply.",
    emotionalTone: "Behind-the-scenes, visual journey.",
    answerStyle:
      "Design → partner build → worldwide delivery; brains over owning every factory.",
    presentationStyle: "Pipeline in plain words.",
    interactionStyle: "Trace the machine → how-it-works check.",
    avoid: ["factory jargon without who builds what", "skipping delivery to customers"],
    exampleAnswerStyle:
      "“NVIDIA designs; partner fabs build; shipments land at cloud giants that power apps you touch.”"
  },
  "why-they-stay": {
    pillarId: "business",
    sectionId: "why-they-stay",
    sectionLabel: "Why they stay",
    teachingGoal: "Explain competitive advantage emotionally.",
    emotionalTone: "Trust, strength, confidence-building.",
    answerStyle:
      "Hard to replace, different from rivals, developers keep building — habit and trust, not hype.",
    presentationStyle: "Moat and switching-cost framing.",
    interactionStyle: "Why they stay check.",
    avoid: ["moat forever claims", "same trust paragraph on every card"],
    exampleAnswerStyle:
      "“Teams stick with NVIDIA because the stack is trusted and switching tools is slow and risky.”"
  },
  competition: {
    pillarId: "business",
    sectionId: "competition",
    sectionLabel: "Competition",
    teachingGoal: "Explain competition, trends, and strategic pressure.",
    emotionalTone: "Strategic, future-focused.",
    answerStyle:
      "Industry difficulty, customer expectations, future demand, and new challengers — land impact on NVIDIA.",
    presentationStyle: "Battlefield and rule-change framing.",
    interactionStyle: "Strategy check after cards.",
    avoid: ["rival name-drops without why it matters", "panic without mechanism"],
    exampleAnswerStyle:
      "“Technology moves fast — companies must keep improving or fall behind.”"
  },
  "who-competes": {
    pillarId: "business",
    sectionId: "who-competes",
    sectionLabel: "Who competes",
    teachingGoal: "Name competitors across product categories.",
    emotionalTone: "Clear, factual, scannable lists.",
    answerStyle:
      "Bullet lists of named rivals by category — chips, big tech, CPUs, devices, networking.",
    presentationStyle: "Category cards with competitor bullet lists.",
    interactionStyle: "Read cards → competitor check.",
    avoid: ["wall of names without category", "mixing unrelated rivals on one card"],
    exampleAnswerStyle:
      "“In AI chips, NVIDIA competes with AMD, Intel, and Huawei — each building processors for advanced computing.”"
  }
};

// -----------------------------------------------------------------------------
// Section-level rules — Financials
// -----------------------------------------------------------------------------

export type FinancialsSectionId =
  | "growth"
  | "profitability"
  | "expenses"
  | "cash"
  | "financial-strength";

export const FINANCIALS_SECTION_RULES: Record<
  FinancialsSectionId,
  SectionRule
> = {
  growth: {
    pillarId: "financials",
    sectionId: "growth",
    sectionLabel: "Growth",
    teachingGoal: "Show whether the company is getting bigger.",
    emotionalTone: "Trend spotting.",
    answerStyle: "Up/down story, what drove it, what could slow it.",
    presentationStyle: "Rising line, “rush vs cooldown” signals.",
    interactionStyle: "Spot the trend, healthy growth vs hype.",
    avoid: ["growth without source", "ignoring reversal risk"],
    exampleAnswerStyle:
      "“Sales jumped as companies raced to buy AI chips — real orders. Watch if that rush cools.”"
  },
  profitability: {
    pillarId: "financials",
    sectionId: "profitability",
    sectionLabel: "Profitability",
    teachingGoal: "Show whether the company keeps enough money after costs.",
    emotionalTone: "Simple health check.",
    answerStyle: "Margins and per-share profit in plain words.",
    presentationStyle: "Green/yellow margin signal.",
    interactionStyle: "Healthy profit vs thin profit.",
    avoid: ["revenue confused with profit"],
    exampleAnswerStyle:
      "“Margins rose when demand was hot and prices stayed strong — that’s real profit power, not just big sales.”"
  },
  expenses: {
    pillarId: "financials",
    sectionId: "expenses",
    sectionLabel: "Expenses",
    teachingGoal: "Show whether spending is buying future strength or bloat.",
    emotionalTone: "Disciplined, practical.",
    answerStyle: "Where dollars go; invest vs waste framing.",
    presentationStyle: "Spending buckets, R&D as future bet.",
    interactionStyle: "Smart spend vs scary spend.",
    avoid: ["all spending labeled bad"],
    exampleAnswerStyle:
      "“They’re spending more to stay ahead in AI — hiring and next-gen chips. The test: does it buy products people still want?”"
  },
  cash: {
    pillarId: "financials",
    sectionId: "cash",
    sectionLabel: "Cash Flow",
    teachingGoal: "Show whether real cash is coming in.",
    emotionalTone: "Practical.",
    answerStyle: "Cash in bank vs promises; customer actually paid.",
    presentationStyle: "Cash meter, “money that showed up.”",
    interactionStyle: "Real cash vs headline hype.",
    avoid: ["accounting profit without cash mention"],
    exampleAnswerStyle:
      "“Operating cash flow stayed strong — buyers actually paid, not just a good story on paper.”"
  },
  "financial-strength": {
    pillarId: "financials",
    sectionId: "financial-strength",
    sectionLabel: "Financial Strength",
    teachingGoal: "Show whether the company can handle trouble.",
    emotionalTone: "Calm safety check.",
    answerStyle: "Cash vs debt, room to breathe, future bills.",
    presentationStyle: "Safety cushion / storm readiness.",
    interactionStyle: "Could it survive a bad year?",
    avoid: ["ignoring big future commitments"],
    exampleAnswerStyle:
      "“More cash muscle than scary debt right now — cushion if sales dip for a few quarters.”"
  }
};

// -----------------------------------------------------------------------------
// Section-level rules — Forces (quadrants)
// -----------------------------------------------------------------------------

export const FORCES_SECTION_RULES: Record<ForcesCategoryId, SectionRule> = {
  "positive-inside": {
    pillarId: "forces",
    sectionId: "positive-inside",
    sectionLabel: "Positive Inside",
    teachingGoal: "Show what the company controls that could help it.",
    emotionalTone: "Strengths and momentum.",
    answerStyle: "This helps because… + how it shows up for the company.",
    presentationStyle: "Sunlight / tailwind inside the building.",
    interactionStyle: "Read topics → category quiz.",
    avoid: ["vague “good management” with no mechanism"],
    exampleAnswerStyle:
      "“Strong cash and on-time chips help NVIDIA keep inventing when the market gets shaky.”"
  },
  "negative-inside": {
    pillarId: "forces",
    sectionId: "negative-inside",
    sectionLabel: "Negative Inside",
    teachingGoal: "Show what inside the company could hurt it.",
    emotionalTone: "Warning signs.",
    answerStyle: "This hurts because… + trust or delivery risk.",
    presentationStyle: "Storm clouds inside.",
    interactionStyle: "Rank internal risks.",
    avoid: ["blaming outside world only"],
    exampleAnswerStyle:
      "“A pattern of late launches could push buyers toward rivals — that’s self-inflicted pain.”"
  },
  "positive-outside": {
    pillarId: "forces",
    sectionId: "positive-outside",
    sectionLabel: "Positive Outside",
    teachingGoal: "Show outside trends that could help it.",
    emotionalTone: "Opportunity and tailwinds.",
    answerStyle: "Outside push + why orders or mood could rise.",
    presentationStyle: "Tailwind arrows.",
    interactionStyle: "Pick the strongest tailwind.",
    avoid: ["assuming tailwinds last forever"],
    exampleAnswerStyle:
      "“When every company races to build AI, they need more chips — NVIDIA sells a large share while the rush lasts.”"
  },
  "negative-outside": {
    pillarId: "forces",
    sectionId: "negative-outside",
    sectionLabel: "Negative Outside",
    teachingGoal: "Show outside forces that could hurt it.",
    emotionalTone: "Pressure and risk awareness.",
    answerStyle: "Outside headwind + revenue or market impact.",
    presentationStyle: "Headwinds, policy shocks.",
    interactionStyle: "Strongest external threat.",
    avoid: ["doom without mechanism"],
    exampleAnswerStyle:
      "“Export rules can block sales overnight — that’s outside pressure hitting NVIDIA for real.”"
  }
};

// -----------------------------------------------------------------------------
// Section-level rules — Management
// -----------------------------------------------------------------------------

export type ManagementSectionId =
  | "leadership"
  | "incentives"
  | "board"
  | "capital-allocation";

export const MANAGEMENT_SECTION_RULES: Record<
  ManagementSectionId,
  SectionRule
> = {
  leadership: {
    pillarId: "management",
    sectionId: "leadership",
    sectionLabel: "Leadership",
    teachingGoal: "Explain who is running the company.",
    emotionalTone: "Human and trust-based.",
    answerStyle: "Who leads, track record, why tenure matters.",
    presentationStyle: "Leader profile, face of the company.",
    interactionStyle: "Would you bet on this team?",
    avoid: ["bios without outcomes"],
    exampleAnswerStyle:
      "“Jensen Huang co-founded NVIDIA and still runs it — decades steering gaming and the AI pivot.”"
  },
  incentives: {
    pillarId: "management",
    sectionId: "incentives",
    sectionLabel: "Incentives",
    teachingGoal:
      "Explain whether leaders are rewarded for things shareholders care about.",
    emotionalTone: "Alignment check.",
    answerStyle: "Pay tied to stock vs flat salary; fair in good and bad years.",
    presentationStyle: "Wallet moves with share price.",
    interactionStyle: "Aligned or misaligned?",
    avoid: ["pay numbers without meaning"],
    exampleAnswerStyle:
      "“Top leaders own a lot of stock — when the price drops, their wealth drops too.”"
  },
  board: {
    pillarId: "management",
    sectionId: "board",
    sectionLabel: "Board",
    teachingGoal: "Explain who is watching management.",
    emotionalTone: "Oversight and accountability.",
    answerStyle: "Board asks hard questions; watches supply, policy, succession.",
    presentationStyle: "Boardroom guardrails.",
    interactionStyle: "Who says “are we sure?”",
    avoid: ["board as rubber stamp"],
    exampleAnswerStyle:
      "“The board oversees the CEO and stress-tests supply and export risks — boring meetings, huge topics.”"
  },
  "capital-allocation": {
    pillarId: "management",
    sectionId: "capital-allocation",
    sectionLabel: "Capital Allocation",
    teachingGoal: "Explain how leaders use company money.",
    emotionalTone: "Judgment and discipline.",
    answerStyle: "Invent vs buybacks vs dividends; discipline in downturns.",
    presentationStyle: "Where the paycheck goes.",
    interactionStyle: "Smart use of cash?",
    avoid: ["buybacks praised without context"],
    exampleAnswerStyle:
      "“They fund the next chip while returning some cash to owners — not blowing everything on a one-week party.”"
  }
};

// -----------------------------------------------------------------------------
// Question-type rules (cross-island — adapt to the actual question)
// -----------------------------------------------------------------------------

export const QUESTION_TYPE_RULES: Record<QuestionTypeId, QuestionTypeRule> = {
  "company-understanding": {
    id: "company-understanding",
    label: "Company understanding",
    exampleQuestions: [
      "What does the company do?",
      "What does {Company.name} actually do?"
    ],
    teachingGoal: "Explain WHAT the company is in simple terms.",
    emotionalTone: "Curious, welcoming.",
    answerStyle:
      "Lead with what they sell/do, then one real-life tie-in the player already knows.",
    presentationStyle: "Story card, plain WHAT before WHY.",
    interactionStyle: "Conversational read.",
    avoid: ["starting with frustration before saying what they do"],
    exampleAnswerStyle:
      "“They make chips for AI and games — you see it when apps feel fast or graphics look incredible.”"
  },
  "problem-solved": {
    id: "problem-solved",
    label: "Problem solved",
    exampleQuestions: [
      "What problem does the company solve?",
      "What problem does {Company.name} solve for customers?"
    ],
    teachingGoal: "Explain the frustration, then how the company fixes it.",
    emotionalTone: "Relatable frustration → relief.",
    answerStyle:
      "You know when… → why it hurts → company builds/sells the fix. Must finish the loop.",
    presentationStyle: "Before/after speed or reliability.",
    interactionStyle: "Pain → solution quiz.",
    avoid: ["stopping after the pain", "homework laptop tropes only"],
    exampleAnswerStyle:
      "“Apps feel slow → people leave → NVIDIA’s chips help answers land in seconds.”"
  },
  "business-model": {
    id: "business-model",
    label: "Business model",
    exampleQuestions: [
      "How do they make money?",
      "What products or services do they sell?",
      "Where does the money come from?"
    ],
    teachingGoal: "Explain the money model clearly.",
    emotionalTone: "Clear, factual.",
    answerStyle: "Who pays, for what, how often — easy to scan.",
    presentationStyle: "Money trail bullets in prose.",
    interactionStyle: "Match product to buyer.",
    avoid: ["hiding who the big customers are"],
    exampleAnswerStyle:
      "“They sell high-end chips to cloud giants for AI — repeat huge orders, not mall foot traffic.”"
  },
  "competitive-advantage": {
    id: "competitive-advantage",
    label: "Competitive advantage",
    exampleQuestions: [
      "Why do customers choose them?",
      "What protects the company?",
      "What gives them an edge?"
    ],
    teachingGoal: "Explain trust, habit, or edge vs rivals.",
    emotionalTone: "Confident but not cocky.",
    answerStyle: "Why buyers stick; switching cost; trusted name.",
    presentationStyle: "Moat / default choice framing.",
    interactionStyle: "Why them vs rival.",
    avoid: ["moat forever claims"],
    exampleAnswerStyle:
      "“Buyers choose NVIDIA because the name is trusted and teams already know the software stack.”"
  },
  "market-position": {
    id: "market-position",
    label: "Market position",
    exampleQuestions: [
      "How big is the company?",
      "How strong is its position?",
      "Market share / importance"
    ],
    teachingGoal: "Explain size and why the market watches them.",
    emotionalTone: "Big-picture, strategic.",
    answerStyle: "Role in the industry + what changes if demand shifts.",
    presentationStyle: "Center of the map vs one of many.",
    interactionStyle: "How important are they?",
    avoid: ["hype without substance"],
    exampleAnswerStyle:
      "“They’re a default supplier for serious AI — huge when orders flow, watched closely when they pause.”"
  },
  "financial-health": {
    id: "financial-health",
    label: "Financial health",
    exampleQuestions: [
      "Is the company profitable?",
      "Cash flow",
      "Balance sheet",
      "Financial strength"
    ],
    teachingGoal: "Health signal in plain money language.",
    emotionalTone: "Calm, visual, signal-based.",
    answerStyle: "Trend + signal (strong/watch/weak) + one number idea max.",
    presentationStyle: "Vital sign / traffic light.",
    interactionStyle: "Healthy or not?",
    avoid: ["ratio dumps"],
    exampleAnswerStyle:
      "“Cash is strong and debt isn’t scary — green signal for breathing room if sales soften.”"
  },
  "force-help": {
    id: "force-help",
    label: "Force — helps",
    exampleQuestions: [
      "What could help?",
      "Positive force",
      "Tailwind",
      "Strength"
    ],
    teachingGoal: "Cause → helps the company because…",
    emotionalTone: "Opportunity, momentum.",
    answerStyle: "Named force + mechanism + impact on company.",
    presentationStyle: "Sunlight / push forward.",
    interactionStyle: "Sort helping forces.",
    avoid: ["help with no because"],
    exampleAnswerStyle:
      "“More AI spending helps because buyers order more chips — NVIDIA sells into that rush.”"
  },
  "force-hurt": {
    id: "force-hurt",
    label: "Force — hurts",
    exampleQuestions: [
      "What could hurt?",
      "Risk",
      "Headwind",
      "Negative force"
    ],
    teachingGoal: "Cause → hurts the company because…",
    emotionalTone: "Alert, strategic.",
    answerStyle: "Named risk + how it hits revenue, trust, or supply.",
    presentationStyle: "Storm / headwind.",
    interactionStyle: "Rank risks.",
    avoid: ["fear without mechanism"],
    exampleAnswerStyle:
      "“Rivals catching up hurts because buyers can switch orders — NVIDIA could lose pricing power.”"
  },
  "management-trust": {
    id: "management-trust",
    label: "Management trust",
    exampleQuestions: [
      "Who runs the company?",
      "Do you trust management?",
      "Executive pay",
      "Board oversight"
    ],
    teachingGoal: "Human judgment on people and alignment.",
    emotionalTone: "Trust-focused, direct.",
    answerStyle: "Who decides, how they’re paid, what they delivered.",
    presentationStyle: "Trust meter / boardroom.",
    interactionStyle: "Would you trust them with your money?",
    avoid: ["cult of personality"],
    exampleAnswerStyle:
      "“Long-time CEO with an AI track record — pay moves with the stock, board watches big risks.”"
  },
  "risk-awareness": {
    id: "risk-awareness",
    label: "Risk awareness",
    exampleQuestions: [
      "What could go wrong?",
      "Regulation",
      "Competition risk"
    ],
    teachingGoal: "Plain-language risk with consequence.",
    emotionalTone: "Clear-eyed, not panicked.",
    answerStyle: "If X happens → company feels Y.",
    presentationStyle: "Warning label with consequence.",
    interactionStyle: "Pick biggest risk.",
    avoid: ["listing risks without impact"],
    exampleAnswerStyle:
      "“If export rules tighten, NVIDIA can lose access to a huge market — sales hit fast.”"
  }
};
