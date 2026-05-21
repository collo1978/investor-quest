import type { PillarId } from "@/data/pillars";

/**
 * Human-first pattern keyed to what the card is actually asking —
 * not a one-size-fits-all customer-problem template.
 */
export type QuestionIntent =
  | "what_company_does"
  | "customer_problem"
  | "market_scale"
  | "how_they_make_money"
  | "risk_force"
  | "force_positive"
  | "financials"
  | "general";

export type QuestionIntentContext = {
  pillarId?: PillarId | string;
  questSlug?: string;
  cardId?: string;
  cardQuestion?: string;
  promptFocus?: string;
};

const EXPLICIT_CARD_INTENT: Partial<
  Record<string, Partial<Record<string, QuestionIntent>>>
> = {
  snapshot: {
    "card-1": "what_company_does",
    "card-2": "customer_problem",
    "card-3": "market_scale"
  },
  revenue: {
    "card-1": "how_they_make_money",
    "card-2": "how_they_make_money",
    "card-3": "how_they_make_money"
  }
};

function normalizeQuestion(q: string): string {
  return q.toLowerCase().replace(/\s+/g, " ").trim();
}

function questionHints(q: string): QuestionIntent | null {
  if (!q) return null;

  if (
    /\b(problem|pain|solve|frustrat|struggle|lag|slow|without)\b/.test(q) &&
    /\b(customer|user|people|buyer|player)\b/.test(q)
  ) {
    return "customer_problem";
  }

  if (
    /\b(how big|market position|position in the market|scale|size of the company|leading|dominant|major player|market share)\b/.test(
      q
    )
  ) {
    return "market_scale";
  }

  if (
    /\b(what does|actually do|sell|products? or services|business model)\b/.test(
      q
    ) &&
    !/\b(revenue|money|geograph|region|customer)\b/.test(q)
  ) {
    return "what_company_does";
  }

  if (
    /\b(revenue|make money|earn|geographic|region|who (?:are |pays |pay )|customers?|money comes)\b/.test(
      q
    )
  ) {
    return "how_they_make_money";
  }

  if (
    /\b(risk|go wrong|threat|headwind|regulat|compet|supply chain|could hurt)\b/.test(
      q
    )
  ) {
    return "risk_force";
  }

  if (
    /\b(growth|revenue|margin|profit|cash flow|eps|earnings|expense|debt|financial)\b/.test(
      q
    )
  ) {
    return "financials";
  }

  return null;
}

/** Resolve the human-first pattern for this card. */
export function detectQuestionIntent(ctx: QuestionIntentContext): QuestionIntent {
  const pillar = ctx.pillarId ?? "";
  const slug = ctx.questSlug ?? "";
  const cardId = ctx.cardId ?? "";
  const q = normalizeQuestion(ctx.cardQuestion ?? "");
  const focus = normalizeQuestion(ctx.promptFocus ?? "");

  if (pillar === "financials") return "financials";
  if (pillar === "forces") {
    if (slug.startsWith("positive") || focus.includes("strength")) {
      return "force_positive";
    }
    return "risk_force";
  }

  const explicit = EXPLICIT_CARD_INTENT[slug]?.[cardId];
  if (explicit) return explicit;

  const fromQuestion = questionHints(q);
  if (fromQuestion) return fromQuestion;
  if (focus.includes("customer pain") || focus.includes("pain without")) {
    return "customer_problem";
  }
  if (focus.includes("scale") || focus.includes("market position")) {
    return "market_scale";
  }
  if (focus.includes("revenue") || focus.includes("geograph")) {
    return "how_they_make_money";
  }

  if (slug === "revenue") return "how_they_make_money";
  if (slug === "snapshot" && cardId === "card-1") return "what_company_does";

  return "general";
}

export const QUESTION_INTENT_LABELS: Record<QuestionIntent, string> = {
  what_company_does: "What does the company do?",
  customer_problem: "What problem does it solve?",
  market_scale: "How big / market position",
  how_they_make_money: "How do they make money?",
  risk_force: "What could go wrong (force)",
  force_positive: "Strength / tailwind (force)",
  financials: "Financials",
  general: "General human-first"
};

export const INTENT_ADAPTIVE_PRINCIPLE = `INTENT-ADAPTIVE HUMAN-FIRST (critical)
Human-first means the reader understands THIS card's question in normal life — not that every answer uses the same customer-pain template.
Match the question type. Do NOT open with game lag / AI slowness unless the card is explicitly about customer pain.`;

type IntentPromptPack = {
  cardPrompt: string;
  styleReference: string;
  writeInstruction: string;
  sentenceMap: string;
};

export const INTENT_PROMPT_PACKS: Record<QuestionIntent, IntentPromptPack> = {
  what_company_does: {
    cardPrompt: `WHAT THE COMPANY DOES
Pattern: everyday experience → simple analogy → what they sell/do → investor meaning.
- Lead with where the reader already bumps into this company (phone, store, game, work).
- Explain what they sell or help power in plain words — not engineering categories.
- Do NOT lead with customer pain, lag, or "without them" unless this card asks for that.`,
    styleReference: `STYLE REFERENCE (what they do — tone only):
"If you've streamed music or used a phone app, you've already touched this company's world.

Think of them like the team behind the apps and devices people use every day — not the shop you walk into.

They design and sell the products and services people pay for most often.

Why investors care:
When people keep buying those products, revenue can stay steady or grow."`,
    writeInstruction:
      "Write: everyday moment → analogy → what they sell/do (max 4 sentences); then Why investors care:",
    sentenceMap:
      "1. Everyday experience — where people already see this company\n2. Analogy — what role they play\n3. What they sell/do — one plain line from the filing\n4. Optional — one extra fact if needed"
  },

  customer_problem: {
    cardPrompt: `CUSTOMER PROBLEM
Pattern: customer pain → consequence → how the company helps → investor meaning.
- Lead with frustration or risk WITHOUT the company, then what improves WITH them.
- Never: industries tour, solutions, innovation hype, "technology is crucial."`,
    styleReference: `STYLE REFERENCE (customer problem — tone only):
"When a game stutters or an AI chat takes forever to reply, devices aren't fast enough.

Think of it like a phone running too many apps — everything slows down.

This company makes the parts inside devices so games and apps feel quick again.

Why investors care:
If people keep demanding faster tech, demand for those parts can keep growing."`,
    writeInstruction:
      "Write: pain WITHOUT them → consequence → analogy → benefit WITH them (max 4 sentences); then Why investors care:",
    sentenceMap:
      "1. Pain WITHOUT them — everyday frustration\n2. Consequence — what stays broken\n3. Analogy OR how they help\n4. Benefit WITH them — plain role"
  },

  market_scale: {
    cardPrompt: `MARKET SCALE & POSITION
Pattern: real-world scale comparison → market importance → simple analogy → investor meaning.
- Explain how LARGE or IMPORTANT the company is — flagship products, reach, leadership.
- Use familiar scale ("one of the biggest names in…", "most people have heard of…").
- Do NOT make this a customer-pain card (no lag, stutter, "without them", AI slowness).
- Do NOT repeat the full product list from card 1.`,
    styleReference: `STYLE REFERENCE (market scale — tone only):
"NVIDIA is one of the biggest names behind the AI boom.

Think of it like a key engine supplier for many companies building modern AI — not the app you tap on.

When a company becomes this important to a fast-growing industry, its size and reach matter.

Why investors care:
Major players in a hot industry often attract attention when demand keeps rising."`,
    writeInstruction:
      "Write: scale in real life → why the market position matters → analogy → investor meaning (max 4 sentences); then Why investors care:",
    sentenceMap:
      "1. Scale in real life — how big/important it feels\n2. Market position — leader, major name, wide reach\n3. Analogy — what that scale is like\n4. Optional — one filing fact on size or flagship products"
  },

  how_they_make_money: {
    cardPrompt: `HOW THEY MAKE MONEY
Pattern: what customers pay for → simple example → main money source → investor meaning.
- Focus on revenue lines, regions, or who pays — matching THIS card only.
- Use a quick everyday money moment (subscription, purchase, ad, license).
- Do NOT open with tech pain or lag.`,
    styleReference: `STYLE REFERENCE (revenue — tone only):
"Most of this company's money comes from products people buy again and again.

Think of it like a store where one aisle brings most of the sales — the rest adds variety.

The filing shows which product lines bring in the biggest share of revenue.

Why investors care:
When one line pays most of the bills, its health drives the whole business."`,
    writeInstruction:
      "Write: what people pay for → simple money example → main revenue source for THIS card (max 4 sentences); then Why investors care:",
    sentenceMap:
      "1. What customers pay for — everyday purchase moment\n2. Simple example or analogy for the money flow\n3. Main source for THIS card (product, region, or customer type)\n4. Optional — one number or filing fact"
  },

  force_positive: {
    cardPrompt: `POSITIVE FORCE (strength / tailwind)
Pattern: real-world upside → why it helps the company → simple analogy → investor meaning.
- This is a strength the company controls or a helpful outside tailwind — NOT a customer-pain card.
- Do NOT open with lag, stutter, or "without them."`,
    styleReference: `STYLE REFERENCE (positive force — tone only):
"When stores stay stocked and launches hit on time, shoppers notice.

Think of it like a bakery that always has flour — it can bake every day without drama.

The filing describes supply chain strength as something they manage well.

Why investors care:
Reliable operations can protect margins when demand is hot."`,
    writeInstruction:
      "Write: everyday upside → why this strength matters → analogy → filing fact (max 4 sentences); then Why investors care:",
    sentenceMap:
      "1. Real-world upside — what goes better\n2. Why this strength matters for the business\n3. Analogy — Think of it like…\n4. One filing fact about this force"
  },

  risk_force: {
    cardPrompt: `RISK / NEGATIVE FORCE
Pattern: real-world risk → what could happen → how it hurts the company → investor meaning.
- Show how this force might show up in everyday life (price, delay, safety, hype).
- One analogy required.`,
    styleReference: `STYLE REFERENCE (risk force — tone only):
"If key parts get hard to buy, new products can launch late or cost more.

Think of it like a bakery that can't get flour — shelves stay half-empty.

The filing flags supply pressure as something that could squeeze margins or delays.

Why investors care:
Operational risks can slow growth even when demand looks strong."`,
    writeInstruction:
      "Write: real-world risk → what could happen → filing fact about this force (max 4 sentences); include one analogy; then Why investors care:",
    sentenceMap:
      "1. Real-world risk — everyday stake\n2. What could happen\n3. Analogy — Think of it like…\n4. One filing fact about this force"
  },

  financials: {
    cardPrompt: `FINANCIALS
Pattern: household/business money comparison → what the number shows → simple consequence → investor meaning.
- Anchor numbers to paychecks, bills, price tags, or running a small business.
- Say trends honestly (up/down); weave figures into sentences.`,
    styleReference: `STYLE REFERENCE (financials — tone only):
"Imagine your income grew a little each year while rent stayed flat — you'd feel more breathing room.

That's the idea when revenue climbs faster than costs.

The filing shows total revenue rising over three years.

Why investors care:
Steady top-line growth often means demand is still expanding."`,
    writeInstruction:
      "Write: money comparison in everyday life → what the filing number shows → consequence (max 4 sentences); then Why investors care:",
    sentenceMap:
      "1. Household/business money comparison\n2. What the number or trend shows\n3. Simple consequence — better or worse for the business\n4. Optional — one filing figure for THIS card"
  },

  general: {
    cardPrompt: `GENERAL CARD
Pattern: real-life hook → plain explanation of the filing fact → investor meaning.
- Match the card question exactly; do not default to customer-pain language.`,
    styleReference: `STYLE REFERENCE (general — tone only):
"Most investors meet this topic through everyday products and prices — not accounting textbooks.

Think of the filing as a reality check on what people actually buy and pay.

Answer only what this card asks, in words a friend would use.

Why investors care:
Clear facts here help judge whether the business is getting stronger or shakier."`,
    writeInstruction:
      "Write: real-life hook → plain answer to THIS question (max 4 sentences); then Why investors care:",
    sentenceMap:
      "1. Real-life hook\n2. Plain explanation\n3. Optional analogy or filing fact\n4. Tie back to the question"
  }
};

export function buildIntentPromptFooter(ctx: QuestionIntentContext): string {
  const intent = detectQuestionIntent(ctx);
  const pack = INTENT_PROMPT_PACKS[intent];

  return [
    "",
    `QUESTION TYPE: ${QUESTION_INTENT_LABELS[intent]}`,
    pack.cardPrompt,
    "",
    pack.styleReference,
    "",
    "Sentence map for this card:",
    pack.sentenceMap,
    "",
    pack.writeInstruction
  ].join("\n");
}
