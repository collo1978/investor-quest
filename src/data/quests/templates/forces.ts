import type { ForcesCategoryId } from "@/data/quests/forcesCategories";
import { FORCES_CATEGORY_QUEST_QUIZZES } from "@/data/quests/forcesQuestQuizzes";
import {
  FORCES_HUB_CATEGORY_SLOTS,
  forcesCategoryPath
} from "@/lib/forces/forcesHubCategories";
import { forcesCategoryMeta } from "@/data/quests/forcesCategories";
import type { QuestTemplate } from "@/data/quests/types";

const PASS = 0.66 as const;

const SEC_FORCES = {
  form: "10-K" as const,
  section: "Item 1A. Risk Factors",
  hint: "Map internal vs external forces; skip generic boilerplate."
};

function forcesTopic(params: {
  slug: string;
  forcesCategory: ForcesCategoryId;
  displayOrder: number;
  title: string;
  description: string;
  whyItMatters: string;
  prevSlug?: string;
  type?: QuestTemplate["type"];
}): QuestTemplate {
  const meta = forcesCategoryMeta(params.forcesCategory);
  return {
    slug: params.slug,
    type: params.type ?? "risk",
    pillarId: "forces",
    forcesCategory: params.forcesCategory,
    displayOrder: params.displayOrder,
    title: params.title,
    objective: `${meta.title} · ${meta.subtitle}`,
    description: params.description,
    investorQuestion: `How does ${params.title} affect {Company.name}?`,
    plainEnglishAnswer: null,
    whyItMatters: params.whyItMatters,
    secSection: SEC_FORCES,
    aiTask: `Explain how "${params.title}" could help or hurt {Company.name}'s stock, using Item 1A in plain English.`,
    artifactType: "checklist",
    rewardXp: 40,
    unlockRequirements: params.prevSlug
      ? { pillar: "forces", questSlugs: [params.prevSlug] }
      : { pillar: "forces" },
    completionState: { kind: "read" },
    difficulty: "core",
    visualStyle: "card",
    estimatedTime: 2,
    tags: ["forces", params.forcesCategory]
  };
}

/** Hub map, one CMS row per quadrant (display_order 1. 4). */
function forcesHubCategory(
  slot: (typeof FORCES_HUB_CATEGORY_SLOTS)[number]
): QuestTemplate {
  return {
    slug: slot.hubSlug,
    type: "risk",
    pillarId: "forces",
    forcesCategory: slot.categoryId,
    displayOrder: slot.orderNumber,
    title: slot.defaultTitle,
    objective: slot.defaultSubtitle,
    description: slot.defaultSubtitle,
    investorQuestion: slot.defaultSubtitle,
    plainEnglishAnswer: slot.defaultSubtitle,
    whyItMatters: slot.defaultSubtitle,
    secSection: {
      form: "10-K",
      section: "Item 1A. Risk Factors",
      hint: "Hub category entry point"
    },
    aiTask: `Guide the investor through ${slot.defaultTitle} for {Company.name}.`,
    artifactType: "checklist",
    rewardXp: 100,
    unlockRequirements: { pillar: "forces" },
    completionState: { kind: "quiz", passPct: PASS },
    quizConfig: FORCES_CATEGORY_QUEST_QUIZZES[slot.categoryId],
    difficulty: "intro",
    visualStyle: "card",
    estimatedTime: 1,
    hubIcon: slot.categoryId,
    hubSubtitle: slot.defaultSubtitle,
    hubCardCount: slot.categoryId === "positive-inside" ? 4 : 5,
    hubRoute: forcesCategoryPath(slot.categoryId),
    hubLocked: slot.orderNumber > 1,
    tags: ["forces", "hub", slot.categoryId]
  };
}

const FORCES_HUB_TEMPLATES: readonly QuestTemplate[] =
  FORCES_HUB_CATEGORY_SLOTS.map(forcesHubCategory);

/**
 * Forces pillar. 4 hub categories × topic decks (19 topics after positive-inside trim).
 * Each card: title, short explanation, why it matters, source, mark-as-read.
 */
export const FORCES_QUEST_TEMPLATES: readonly QuestTemplate[] = [
  ...FORCES_HUB_TEMPLATES,
  // ── Positive. Inside (4 topics) ──────────────────────────────────
  forcesTopic({
    slug: "positive-inside-supply-chain",
    forcesCategory: "positive-inside",
    displayOrder: 11,
    title: "Supply chain strength",
    description:
      "A strong supply chain allows the company to scale production and meet demand.",
    whyItMatters:
      "Reliable suppliers and manufacturing give {Company.name} room to grow without constant firefighting on fulfillment."
  }),
  forcesTopic({
    slug: "positive-inside-technology",
    forcesCategory: "positive-inside",
    displayOrder: 12,
    title: "Technology systems",
    description:
      "Reliable systems can improve efficiency and support product innovation.",
    whyItMatters:
      "Solid tech infrastructure can lower costs and speed new features, both can support a stronger long-term story.",
    prevSlug: "positive-inside-supply-chain"
  }),
  forcesTopic({
    slug: "positive-inside-financial-strength",
    forcesCategory: "positive-inside",
    displayOrder: 13,
    title: "Financial strength",
    description:
      "Strong finances allow the company to invest in growth and survive downturns.",
    whyItMatters:
      "A healthy balance sheet gives {Company.name} flexibility to invest, buy back stock, or weather a bad year without panic.",
    prevSlug: "positive-inside-technology"
  }),
  forcesTopic({
    slug: "positive-inside-brand-strength",
    forcesCategory: "positive-inside",
    displayOrder: 14,
    title: "Brand strength",
    description:
      "A strong brand can increase customer loyalty and pricing power.",
    whyItMatters:
      "Trusted brands let {Company.name} charge more and keep customers, that shows up in margins and repeat revenue.",
    prevSlug: "positive-inside-financial-strength"
  }),

  // ── Negative. Inside ─────────────────────────────────────────────
  forcesTopic({
    slug: "negative-inside-operational-failures",
    forcesCategory: "negative-inside",
    displayOrder: 21,
    title: "Operational failures",
    description:
      "Delays or poor execution can increase costs and reduce sales.",
    whyItMatters:
      "Execution slips are often the first sign that guidance or margins could disappoint, even when the industry looks fine."
  }),
  forcesTopic({
    slug: "negative-inside-supply-disruption",
    forcesCategory: "negative-inside",
    displayOrder: 22,
    title: "Supply chain disruption",
    description:
      "Supplier shortages or manufacturing disruptions could limit production.",
    whyItMatters:
      "If {Company.name} cannot ship what customers want, revenue and trust can drop fast, investors watch lead times closely.",
    prevSlug: "negative-inside-operational-failures"
  }),
  forcesTopic({
    slug: "negative-inside-cyber-risk",
    forcesCategory: "negative-inside",
    displayOrder: 23,
    title: "Cybersecurity / technology risks",
    description:
      "System failures or cyberattacks could disrupt operations and damage trust.",
    whyItMatters:
      "Outages and breaches can halt sales, trigger fines, and erode confidence, especially for digital-first businesses.",
    prevSlug: "negative-inside-supply-disruption"
  }),
  forcesTopic({
    slug: "negative-inside-financial-weakness",
    forcesCategory: "negative-inside",
    displayOrder: 24,
    title: "Financial weakness",
    description:
      "High debt or liquidity issues could limit investment and increase risk.",
    whyItMatters:
      "Heavy debt or thin cash limits {Company.name}'s options in a downturn and can magnify losses if results slip.",
    prevSlug: "negative-inside-cyber-risk"
  }),
  forcesTopic({
    slug: "negative-inside-reputation-damage",
    forcesCategory: "negative-inside",
    displayOrder: 25,
    title: "Reputation damage",
    description:
      "Brand damage or product failures could reduce demand and trust.",
    whyItMatters:
      "Trust is hard to rebuild, product recalls or scandals can hit demand and valuation long after headlines fade.",
    prevSlug: "negative-inside-financial-weakness"
  }),

  // ── Positive. Outside ────────────────────────────────────────────
  forcesTopic({
    slug: "positive-outside-demand-growth",
    forcesCategory: "positive-outside",
    displayOrder: 31,
    title: "Customer demand growth",
    description:
      "Growing demand can drive revenue growth and expansion.",
    whyItMatters:
      "Rising demand lifts revenue without {Company.name} needing to win share, a tailwind every investor wants on their side.",
    type: "industry"
  }),
  forcesTopic({
    slug: "positive-outside-competitive-advantages",
    forcesCategory: "positive-outside",
    displayOrder: 32,
    title: "Competitive advantages",
    description:
      "Strong competitive advantages can increase market share.",
    whyItMatters:
      "Durable edges, network effects, scale, or switching costs, help {Company.name} grow profitably in a crowded market.",
    prevSlug: "positive-outside-demand-growth",
    type: "industry"
  }),
  forcesTopic({
    slug: "positive-outside-economic-growth",
    forcesCategory: "positive-outside",
    displayOrder: 33,
    title: "Economic growth",
    description:
      "Economic growth can increase spending and demand.",
    whyItMatters:
      "A healthy economy often lifts consumer and business spending, cyclical names can rerate quickly when growth returns.",
    prevSlug: "positive-outside-competitive-advantages",
    type: "industry"
  }),
  forcesTopic({
    slug: "positive-outside-favorable-regulation",
    forcesCategory: "positive-outside",
    displayOrder: 34,
    title: "Favorable regulation",
    description:
      "Favorable regulations or incentives can support growth.",
    whyItMatters:
      "Subsidies, tax credits, or lighter rules can open new markets or improve economics overnight for the right sectors.",
    prevSlug: "positive-outside-economic-growth",
    type: "industry"
  }),
  forcesTopic({
    slug: "positive-outside-global-expansion",
    forcesCategory: "positive-outside",
    displayOrder: 35,
    title: "Global expansion",
    description:
      "Global expansion can create new growth opportunities.",
    whyItMatters:
      "New regions can extend {Company.name}'s growth runway when home markets mature, if execution and regulation cooperate.",
    prevSlug: "positive-outside-favorable-regulation",
    type: "industry"
  }),

  // ── Negative. Outside ────────────────────────────────────────────
  forcesTopic({
    slug: "negative-outside-demand-decline",
    forcesCategory: "negative-outside",
    displayOrder: 41,
    title: "Customer demand decline",
    description:
      "Losing major customers or declining demand could reduce revenue.",
    whyItMatters:
      "Demand shocks hit top line first, even great operators struggle when customers pull back or switch away.",
    type: "industry"
  }),
  forcesTopic({
    slug: "negative-outside-competition",
    forcesCategory: "negative-outside",
    displayOrder: 42,
    title: "Competition",
    description:
      "Intense competition can reduce pricing power and margins.",
    whyItMatters:
      "Price wars and new entrants can compress margins for years, investors need to know if {Company.name} can defend share.",
    prevSlug: "negative-outside-demand-decline",
    type: "industry"
  }),
  forcesTopic({
    slug: "negative-outside-economic-slowdown",
    forcesCategory: "negative-outside",
    displayOrder: 43,
    title: "Economic slowdown",
    description:
      "Economic slowdowns can reduce customer spending.",
    whyItMatters:
      "Recessions and rate shocks often show up in guidance before they show up in headlines, macro matters for every stock.",
    prevSlug: "negative-outside-competition",
    type: "industry"
  }),
  forcesTopic({
    slug: "negative-outside-regulation-risk",
    forcesCategory: "negative-outside",
    displayOrder: 44,
    title: "Regulation risk",
    description:
      "Regulations or lawsuits could increase costs or restrict operations.",
    whyItMatters:
      "New rules or legal battles can cap growth or add permanent costs, regulatory risk is a separate lens from operational risk.",
    prevSlug: "negative-outside-economic-slowdown",
    type: "industry"
  }),
  forcesTopic({
    slug: "negative-outside-geopolitical-risk",
    forcesCategory: "negative-outside",
    displayOrder: 45,
    title: "Geopolitical risk",
    description:
      "Trade restrictions or geopolitical tensions could disrupt operations.",
    whyItMatters:
      "Tariffs, sanctions, and conflict can break supply chains and block markets, global companies carry this risk whether they discuss it or not.",
    prevSlug: "negative-outside-regulation-risk",
    type: "industry"
  })
] as const;