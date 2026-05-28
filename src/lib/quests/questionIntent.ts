import type { PillarId } from "@/data/pillars";

/**
 * Human-first pattern keyed to what the card is actually asking —
 * not a one-size-fits-all customer-problem template.
 */
export type QuestionIntent =
  | "what_company_does"
  | "customer_problem"
  | "market_scale"
  | "target_customer"
  | "how_they_make_money"
  | "innovation_advantage"
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
    "card-3": "target_customer"
  },
  advantage: {
    "card-1": "innovation_advantage",
    "card-2": "innovation_advantage"
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
    /\b(who are|who is|who buys|who pays|whose customers?|customer base|target (?:audience|market|customer)|types? of (?:customers?|buyers?|clients?))\b/.test(
      q
    ) &&
    /\b(customers?|buyers?|users?|clients?|audience)\b/.test(q)
  ) {
    return "target_customer";
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
    /\b(revenue|make money|earn|geographic|region|money comes)\b/.test(q)
  ) {
    return "how_they_make_money";
  }

  if (
    /\b(r&d|research and development|innovation|competitive advantage|competitive moat|\bmoat\b|what protects|proprietary|patents?|intellectual property|technology edge|invest in (?:research|development)|hard to copy|ecosystem (?:lock|advantage|moat))\b/.test(
      q
    )
  ) {
    return "innovation_advantage";
  }

  if (
    /\b(risk|go wrong|threat|headwind|regulat|compet|supply chain|could hurt)\b/.test(
      q
    )
  ) {
    return "risk_force";
  }

  if (
    /\b(leave|step down|depart|succession|sold|takeover|acquisition|merger|ceo change)\b/.test(
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
  if (pillar === "management") {
    const mgmt = questionHints(q);
    if (mgmt) return mgmt;
    return "general";
  }
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
  if (slug === "advantage") return "innovation_advantage";
  if (slug === "what-they-do" && cardId === "card-1") return "what_company_does";

  return "general";
}

export const QUESTION_INTENT_LABELS: Record<QuestionIntent, string> = {
  what_company_does: "What does the company do?",
  customer_problem: "What problem does it solve?",
  market_scale: "How big / market position",
  target_customer: "Who are the customers?",
  how_they_make_money: "How do they make money?",
  innovation_advantage: "R&D / innovation / moat",
  risk_force: "What could go wrong (force)",
  force_positive: "Strength / tailwind (force)",
  financials: "Financials",
  general: "General human-first"
};

export const INTENT_ADAPTIVE_PRINCIPLE = `INTENT-ADAPTIVE HUMAN-FIRST (critical)
Human-first means the reader understands THIS card's question in normal life — not that every answer uses the same template.
Match the question type. Answer ONLY what the card asks.
Do NOT drift into investor analysis, loyalty economics, or clever meta-commentary in the main story.
Sound like a smart friend — not Wikipedia, not a teacher ("In simple terms"), not forced analogies.`;

type IntentPromptPack = {
  cardPrompt: string;
  styleReference: string;
  writeInstruction: string;
  sentenceMap: string;
};

export const INTENT_PROMPT_PACKS: Record<QuestionIntent, IntentPromptPack> = {
  what_company_does: {
    cardPrompt: `WHAT THE COMPANY DOES
Pattern: name what people actually use → where the money comes from → one extra fact if needed.
- List real products/services people touch (iPhone, app store, etc.) — not "designs and sells a range of…"
- No forced analogy. No "In simple terms". No textbook opener.
- Do NOT lead with customer pain, lag, or "without them" unless this card asks for that.`,
    styleReference: `STYLE REFERENCE (what they do — tone only):
"Apple makes everyday tech people use constantly — iPhones, Macs, iPads, Apple Watches, and AirPods.

It also earns when you pay for App Store apps, iCloud, Apple Music, and Apple TV+.

iPhone still brings in the biggest share of sales.

Why investors care:
If people keep buying devices and subscriptions, Apple keeps making money from the same customers over and over."`,
    writeInstruction:
      "Write: what people use/buy → main money lines → optional one fact (max 4 sentences); then Why investors care:",
    sentenceMap:
      "1. What people actually use or buy — name real products\n2. Other ways money comes in (subscriptions, fees)\n3. What matters most (flagship line or habit)\n4. Optional — one short filing fact"
  },

  customer_problem: {
    cardPrompt: `CUSTOMER PROBLEM
Pattern: what life feels like with them → concrete everyday example → how that helps (time, frustration, simplicity).
- Answer ONLY the customer problem in the question. No investor analysis in the main story.
- Name real moments: photos, messages, devices, bills, frustration, time saved.
- Never: spec sheets, stickiness, loyalty economics, industries tour, solutions, innovation hype.`,
    styleReference: `STYLE REFERENCE (customer problem — tone only):
"Apple makes technology feel simple and connected.

People can move photos, messages, apps, and files easily between devices without needing to think about it too much.

For many customers, Apple products save time, reduce frustration, and work smoothly together in everyday life.

Why investors care:
When daily life feels easier, people tend to stay with the same brand."`,
    writeInstruction:
      "Write: what problem disappears for customers → everyday example → how life gets easier (max 4 sentences); then Why investors care:",
    sentenceMap:
      "1. What feels simpler or less frustrating for customers\n2. Concrete everyday example (photos, messages, devices, etc.)\n3. How that helps in daily life\n4. Optional — one short filing fact tied to the problem"
  },

  target_customer: {
    cardPrompt: `TARGET CUSTOMERS / AUDIENCE
Pattern: WHO buys (specific segment) → WHY they buy (value proposition) → WHY the model is strong (loyalty, repeat purchases, ecosystem, switching costs, developers, or enterprise — use filing facts).
- Name a real customer type and how they purchase — not "regular people", "everyone", or "people upgrading phones".
- Sentence 2: why they choose this company (premium, convenience, trust, network, etc.).
- Sentence 3: business-model strength investors notice (ecosystem lock-in, repeat spend, developer pull, enterprise contracts).
- You MAY mention loyalty, ecosystem, switching costs, and repeat purchases here — this card is about who pays and why that matters.
${CUSTOMER_AUDIENCE_HARD_RULES}`,
    styleReference: CUSTOMER_AUDIENCE_STYLE_REFERENCE,
    writeInstruction:
      "Write: target customer segment → why they buy → why the model is strong (max 4 sentences); then Why investors care:",
    sentenceMap:
      "1. WHO buys — specific segment + purchasing behavior\n2. WHY they buy — value proposition\n3. WHY the model is strong — loyalty, ecosystem, switching costs, repeat purchases, or enterprise adoption\n4. Optional — one short filing fact"
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

  innovation_advantage: {
    cardPrompt: `R&D / INNOVATION / COMPETITIVE ADVANTAGE
Pattern: what the company invests in → why it matters for the business → optional one concrete example.
- Explain R&D focus OR what protects the business (brand, IP, chips, software, ecosystem, switching costs) — match the card question.
${INNOVATION_RD_HARD_RULES}`,
    styleReference: `${INNOVATION_RD_STYLE_REFERENCE}\n\n${INNOVATION_MOAT_STYLE_REFERENCE}`,
    writeInstruction:
      "Write: what they invest in OR what protects them → business impact (integration, moat, switching costs) (max 4 sentences); then Why investors care:",
    sentenceMap:
      "1. What they invest in (R&D) OR what protects the business (moat)\n2. Why it matters — ecosystem, integration, performance, switching costs, or pricing power\n3. Optional — one concrete example from the filing\n4. Optional — rival or risk if R&D slows"
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
      "Write: what people pay for → main revenue source for THIS card (max 4 sentences); no forced analogy; then Why investors care:",
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

The filing describes supply chain strength as something they manage well.

Why investors care:
Reliable operations can protect margins when demand is hot."`,
    writeInstruction:
      "Write: everyday upside → why this strength matters → filing fact (max 4 sentences); no forced analogy; then Why investors care:",
    sentenceMap:
      "1. Real-world upside — what goes better\n2. Why this strength matters for the business\n3. One filing fact about this force\n4. Optional — investor meaning"
  },

  risk_force: {
    cardPrompt: `RISK / NEGATIVE FORCE
Pattern: real-world risk → what could happen → investor meaning.
- Show how this force might show up in everyday life (price, delay, safety, hype).
- No forced kitchen/bakery analogies.`,
    styleReference: `STYLE REFERENCE (risk force — tone only):
"If key parts get hard to buy, new products can launch late or cost more.

The filing flags supply pressure as something that could squeeze margins or delays.

Why investors care:
Operational risks can slow growth even when demand looks strong."`,
    writeInstruction:
      "Write: real-world risk → what could happen → filing fact (max 4 sentences); then Why investors care:",
    sentenceMap:
      "1. Real-world risk — everyday stake\n2. What could happen to the business\n3. One filing fact about this force\n4. Optional — investor stake"
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

import {
  CUSTOMER_AUDIENCE_HARD_RULES,
  CUSTOMER_AUDIENCE_STYLE_REFERENCE
} from "@/lib/quests/customerAudienceCopy";
import {
  INNOVATION_MOAT_STYLE_REFERENCE,
  INNOVATION_RD_HARD_RULES,
  INNOVATION_RD_STYLE_REFERENCE
} from "@/lib/quests/innovationRdCopy";
import { QUEST_CARD_FOCUS_RULES } from "@/lib/quests/questionFocusGate";

export function buildIntentPromptFooter(ctx: QuestionIntentContext): string {
  const intent = detectQuestionIntent(ctx);
  const pack = INTENT_PROMPT_PACKS[intent];
  const questionBlock = ctx.cardQuestion?.trim()
    ? [
        "",
        "CARD QUESTION (answer ONLY this in the main story):",
        ctx.cardQuestion.trim()
      ]
    : [];

  return [
    "",
    QUEST_CARD_FOCUS_RULES,
    "",
    `QUESTION TYPE: ${QUESTION_INTENT_LABELS[intent]}`,
    ...questionBlock,
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
