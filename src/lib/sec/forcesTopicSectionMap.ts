import type { ForcesCategoryId } from "@/data/quests/forcesCategories";
import type { QuestCardSpec } from "@/lib/sec/questCardSpec";

export const FORCES_TOPIC_CARD_ID = "main" as const;

export type ForcesTopicSpec = QuestCardSpec & {
  forcesCategory: ForcesCategoryId;
  topicTitle: string;
  retrievalKeywords: readonly string[];
  /** positive = tailwind, negative = headwind framing */
  valence: "positive" | "negative";
  /** inside = company-controlled, outside = external */
  scope: "inside" | "outside";
};

export const FORCES_TOPIC_SPECS: readonly ForcesTopicSpec[] = [
  {
    questSlug: "positive-inside-supply-chain",
    cardId: FORCES_TOPIC_CARD_ID,
    formType: "10-K",
    sectionKeys: ["item_1a"],
    forcesCategory: "positive-inside",
    topicTitle: "Supply chain strength",
    valence: "positive",
    scope: "inside",
    retrievalKeywords: [
      "supply chain",
      "supplier",
      "manufacturing",
      "inventory",
      "logistics",
      "production capacity"
    ],
    promptFocus:
      "How Item 1A describes INTERNAL strengths in supply chain, manufacturing, or fulfillment — cite specific risks acknowledged then mitigated."
  },
  {
    questSlug: "positive-inside-technology",
    cardId: FORCES_TOPIC_CARD_ID,
    formType: "10-K",
    sectionKeys: ["item_1a"],
    forcesCategory: "positive-inside",
    topicTitle: "Technology systems",
    valence: "positive",
    scope: "inside",
    retrievalKeywords: [
      "technology",
      "information systems",
      "infrastructure",
      "software",
      "cyber",
      "data",
      "platform"
    ],
    promptFocus:
      "INTERNAL technology or systems strengths — reliability, R&D systems, digital capabilities — not cyber attacks."
  },
  {
    questSlug: "positive-inside-financial-strength",
    cardId: FORCES_TOPIC_CARD_ID,
    formType: "10-K",
    sectionKeys: ["item_1a"],
    forcesCategory: "positive-inside",
    topicTitle: "Financial strength",
    valence: "positive",
    scope: "inside",
    retrievalKeywords: [
      "cash",
      "liquidity",
      "capital",
      "financial condition",
      "balance sheet",
      "credit"
    ],
    promptFocus:
      "INTERNAL financial resilience — liquidity, cash, access to capital — as discussed in risk factors (often as mitigants)."
  },
  {
    questSlug: "positive-inside-brand-strength",
    cardId: FORCES_TOPIC_CARD_ID,
    formType: "10-K",
    sectionKeys: ["item_1a"],
    forcesCategory: "positive-inside",
    topicTitle: "Brand strength",
    valence: "positive",
    scope: "inside",
    retrievalKeywords: [
      "brand",
      "reputation",
      "customer loyalty",
      "trademark",
      "goodwill"
    ],
    promptFocus:
      "INTERNAL brand, reputation, or customer trust strengths — pricing power, loyalty, brand damage risks framed positively."
  },
  {
    questSlug: "negative-inside-operational-failures",
    cardId: FORCES_TOPIC_CARD_ID,
    formType: "10-K",
    sectionKeys: ["item_1a"],
    forcesCategory: "negative-inside",
    topicTitle: "Operational failures",
    valence: "negative",
    scope: "inside",
    retrievalKeywords: [
      "operational",
      "execution",
      "production",
      "quality",
      "delay",
      "disruption"
    ],
    promptFocus:
      "INTERNAL operational or execution risks — delays, quality, capacity, execution failures."
  },
  {
    questSlug: "negative-inside-supply-disruption",
    cardId: FORCES_TOPIC_CARD_ID,
    formType: "10-K",
    sectionKeys: ["item_1a"],
    forcesCategory: "negative-inside",
    topicTitle: "Supply chain disruption",
    valence: "negative",
    scope: "inside",
    retrievalKeywords: [
      "supply chain",
      "supplier",
      "shortage",
      "manufacturing",
      "component",
      "single source"
    ],
    promptFocus:
      "INTERNAL supply chain disruption risks — supplier concentration, shortages, logistics failures."
  },
  {
    questSlug: "negative-inside-cyber-risk",
    cardId: FORCES_TOPIC_CARD_ID,
    formType: "10-K",
    sectionKeys: ["item_1a"],
    forcesCategory: "negative-inside",
    topicTitle: "Cybersecurity / technology risks",
    valence: "negative",
    scope: "inside",
    retrievalKeywords: [
      "cyber",
      "security",
      "breach",
      "privacy",
      "data",
      "outage",
      "ransomware"
    ],
    promptFocus:
      "INTERNAL cyber, data, or technology failure risks — breaches, outages, privacy."
  },
  {
    questSlug: "negative-inside-financial-weakness",
    cardId: FORCES_TOPIC_CARD_ID,
    formType: "10-K",
    sectionKeys: ["item_1a"],
    forcesCategory: "negative-inside",
    topicTitle: "Financial weakness",
    valence: "negative",
    scope: "inside",
    retrievalKeywords: [
      "debt",
      "liquidity",
      "covenant",
      "leverage",
      "financial condition",
      "cash flow"
    ],
    promptFocus:
      "INTERNAL financial weakness risks — debt, liquidity, covenants, cash shortfalls."
  },
  {
    questSlug: "negative-inside-reputation-damage",
    cardId: FORCES_TOPIC_CARD_ID,
    formType: "10-K",
    sectionKeys: ["item_1a"],
    forcesCategory: "negative-inside",
    topicTitle: "Reputation damage",
    valence: "negative",
    scope: "inside",
    retrievalKeywords: [
      "reputation",
      "brand",
      "product liability",
      "recall",
      "consumer",
      "public relations"
    ],
    promptFocus:
      "INTERNAL reputation or brand damage risks — recalls, scandals, loss of trust."
  },
  {
    questSlug: "positive-outside-demand-growth",
    cardId: FORCES_TOPIC_CARD_ID,
    formType: "10-K",
    sectionKeys: ["item_1a"],
    forcesCategory: "positive-outside",
    topicTitle: "Customer demand growth",
    valence: "positive",
    scope: "outside",
    retrievalKeywords: [
      "demand",
      "market growth",
      "consumer",
      "customer",
      "adoption",
      "macroeconomic"
    ],
    promptFocus:
      "EXTERNAL demand tailwinds — market growth, consumer spending, adoption trends helping the company."
  },
  {
    questSlug: "positive-outside-competitive-advantages",
    cardId: FORCES_TOPIC_CARD_ID,
    formType: "10-K",
    sectionKeys: ["item_1a"],
    forcesCategory: "positive-outside",
    topicTitle: "Competitive advantages",
    valence: "positive",
    scope: "outside",
    retrievalKeywords: [
      "competition",
      "competitive",
      "market position",
      "industry",
      "differentiation"
    ],
    promptFocus:
      "EXTERNAL competitive dynamics that HELP — industry structure, share gains, favorable competitive position."
  },
  {
    questSlug: "positive-outside-economic-growth",
    cardId: FORCES_TOPIC_CARD_ID,
    formType: "10-K",
    sectionKeys: ["item_1a"],
    forcesCategory: "positive-outside",
    topicTitle: "Economic growth",
    valence: "positive",
    scope: "outside",
    retrievalKeywords: [
      "economic",
      "macroeconomic",
      "gdp",
      "inflation",
      "recession",
      "interest rate"
    ],
    promptFocus:
      "EXTERNAL economic tailwinds — growth, spending, rates, inflation dynamics that help results."
  },
  {
    questSlug: "positive-outside-favorable-regulation",
    cardId: FORCES_TOPIC_CARD_ID,
    formType: "10-K",
    sectionKeys: ["item_1a"],
    forcesCategory: "positive-outside",
    topicTitle: "Favorable regulation",
    valence: "positive",
    scope: "outside",
    retrievalKeywords: [
      "regulation",
      "regulatory",
      "government",
      "law",
      "compliance",
      "subsidy",
      "incentive"
    ],
    promptFocus:
      "EXTERNAL regulatory tailwinds — favorable rules, incentives, approvals, policy support."
  },
  {
    questSlug: "positive-outside-global-expansion",
    cardId: FORCES_TOPIC_CARD_ID,
    formType: "10-K",
    sectionKeys: ["item_1a"],
    forcesCategory: "positive-outside",
    topicTitle: "Global expansion",
    valence: "positive",
    scope: "outside",
    retrievalKeywords: [
      "international",
      "global",
      "foreign",
      "emerging market",
      "export",
      "geographic expansion"
    ],
    promptFocus:
      "EXTERNAL global expansion opportunities — new markets, international demand, export growth."
  },
  {
    questSlug: "negative-outside-demand-decline",
    cardId: FORCES_TOPIC_CARD_ID,
    formType: "10-K",
    sectionKeys: ["item_1a"],
    forcesCategory: "negative-outside",
    topicTitle: "Customer demand decline",
    valence: "negative",
    scope: "outside",
    retrievalKeywords: [
      "demand",
      "decline",
      "customer",
      "market",
      "spending",
      "slowdown"
    ],
    promptFocus:
      "EXTERNAL demand headwinds — weak customers, market shrinkage, spending pullbacks."
  },
  {
    questSlug: "negative-outside-competition",
    cardId: FORCES_TOPIC_CARD_ID,
    formType: "10-K",
    sectionKeys: ["item_1a"],
    forcesCategory: "negative-outside",
    topicTitle: "Competition",
    valence: "negative",
    scope: "outside",
    retrievalKeywords: [
      "competition",
      "competitive",
      "pricing",
      "market share",
      "rival"
    ],
    promptFocus:
      "EXTERNAL competitive pressure — rivals, price wars, share loss, disruptive entrants."
  },
  {
    questSlug: "negative-outside-economic-slowdown",
    cardId: FORCES_TOPIC_CARD_ID,
    formType: "10-K",
    sectionKeys: ["item_1a"],
    forcesCategory: "negative-outside",
    topicTitle: "Economic slowdown",
    valence: "negative",
    scope: "outside",
    retrievalKeywords: [
      "economic",
      "recession",
      "macroeconomic",
      "inflation",
      "interest rate",
      "slowdown"
    ],
    promptFocus:
      "EXTERNAL macro headwinds — recession, rates, inflation hurting demand or costs."
  },
  {
    questSlug: "negative-outside-regulation-risk",
    cardId: FORCES_TOPIC_CARD_ID,
    formType: "10-K",
    sectionKeys: ["item_1a"],
    forcesCategory: "negative-outside",
    topicTitle: "Regulation risk",
    valence: "negative",
    scope: "outside",
    retrievalKeywords: [
      "regulation",
      "regulatory",
      "antitrust",
      "government",
      "law",
      "investigation",
      "litigation"
    ],
    promptFocus:
      "EXTERNAL regulatory/legal headwinds — new rules, antitrust, investigations, compliance costs."
  },
  {
    questSlug: "negative-outside-geopolitical-risk",
    cardId: FORCES_TOPIC_CARD_ID,
    formType: "10-K",
    sectionKeys: ["item_1a"],
    forcesCategory: "negative-outside",
    topicTitle: "Geopolitical risk",
    valence: "negative",
    scope: "outside",
    retrievalKeywords: [
      "geopolitical",
      "trade",
      "tariff",
      "sanction",
      "war",
      "china",
      "international conflict"
    ],
    promptFocus:
      "EXTERNAL geopolitical risks — trade wars, sanctions, tariffs, regional conflict affecting operations."
  }
] as const;

export const FORCES_REQUIRED_10K_SECTION_KEYS = ["item_1a"] as const;

export function getForcesTopicSpecs(questSlug?: string): ForcesTopicSpec[] {
  if (!questSlug) return [...FORCES_TOPIC_SPECS];
  return FORCES_TOPIC_SPECS.filter((s) => s.questSlug === questSlug);
}

export function isForcesTopicSlug(slug: string): boolean {
  return FORCES_TOPIC_SPECS.some((s) => s.questSlug === slug);
}

export function isForcesHubSlug(slug: string): boolean {
  return slug.startsWith("forces-hub-");
}
