import type { QuestTemplate } from "@/data/quests/types";

/**
 * Forces pillar — two cinematic paths: internal company forces vs
 * external market forces. Each quest is multi-card (gold layout) with
 * quiz gated until all cards are marked read.
 */
export const FORCES_QUEST_TEMPLATES: readonly QuestTemplate[] = [
  {
    slug: "inside-forces",
    type: "risk",
    pillarId: "forces",
    title: "Inside Forces",
    objective:
      "Surface the operational, financial, and reputational forces *inside* {Company.name} that can help or hurt the stock.",
    description:
      "Walk through business risk, supply chain, technology, financial stability, and brand — the levers management can influence.",
    investorQuestion:
      "What forces inside the company could help or hurt the stock?",
    plainEnglishAnswer: null,
    whyItMatters:
      "Internal execution quality is often the first place surprises show up before they hit revenue or margins.",
    secSection: {
      form: "10-K",
      section: "Item 1A — Risk Factors (operational, supply chain, cyber, financial, reputational)",
      hint: "Group risks by theme; ignore generic boilerplate."
    },
    aiTask:
      "Summarize {Company.name}'s five most material *internal* risk themes in plain English with one bull and one bear angle each.",
    artifactType: "checklist",
    rewardXp: 200,
    unlockRequirements: { pillar: "forces" },
    completionState: { kind: "quiz", passPct: 0.66 },
    difficulty: "core",
    visualStyle: "card",
    estimatedTime: 6,
    tags: ["forces", "internal", "operations"],
    cards: [
      {
        id: "card-1",
        investorQuestion:
          "What are the company's business and operational risks?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Investors ask: How well does the company run its operations? Positive impact: Efficient operations can reduce costs, improve margins, and support growth. Negative impact: Operational failures, delays, or poor execution can increase costs and reduce sales."
      },
      {
        id: "card-2",
        investorQuestion:
          "What supply chain risks could affect the business?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Investors ask: How dependent is the company on suppliers or manufacturing partners? Positive impact: A strong supply chain allows the company to scale production and meet demand. Negative impact: Supplier shortages or manufacturing disruptions could limit production."
      },
      {
        id: "card-3",
        investorQuestion:
          "What technology or cybersecurity risks could disrupt operations?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Investors ask: How important are technology systems to the business? Positive impact: Reliable systems can improve efficiency and support product innovation. Negative impact: System failures or cyberattacks could disrupt operations and damage trust."
      },
      {
        id: "card-4",
        investorQuestion: "What financial risks could affect the company?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Investors ask: How strong is the company's financial stability? Positive impact: Strong finances allow the company to invest in growth and survive downturns. Negative impact: High debt or liquidity issues could limit investment and increase risk."
      },
      {
        id: "card-5",
        investorQuestion:
          "What reputation or brand risks could affect the company?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Investors ask: How important is customer trust and brand reputation? Positive impact: A strong brand can increase customer loyalty and pricing power. Negative impact: Brand damage or product failures could reduce demand and trust."
      }
    ]
  },
  {
    slug: "outside-forces",
    type: "industry",
    pillarId: "forces",
    title: "Outside Forces",
    objective:
      "Map the competitive, regulatory, and macro pressures *outside* {Company.name} that can move the stock even when execution is solid.",
    description:
      "Competitors, substitutes, new entrants, buyer power, and macro shocks — the classic external field.",
    investorQuestion:
      "What forces outside the company could boost or hurt the stock?",
    plainEnglishAnswer: null,
    whyItMatters:
      "Even great operators lose when the industry structure or macro tide turns against them.",
    secSection: {
      form: "10-K",
      section: "Item 1 — Business (competition) + Item 1A — Risk Factors (market, regulatory, macro)",
      hint: "Pair competition commentary with external risk bullets."
    },
    aiTask:
      "List the top five *external* forces acting on {Company.name} in plain English, with a one-line read on how each could move the stock.",
    artifactType: "map",
    rewardXp: 200,
    unlockRequirements: { pillar: "forces" },
    completionState: { kind: "quiz", passPct: 0.66 },
    difficulty: "core",
    visualStyle: "panel",
    estimatedTime: 5,
    tags: ["forces", "external", "industry"],
    cards: [
      {
        id: "card-1",
        investorQuestion:
          "How intense is competition in the company's core markets?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Rivalry caps pricing power. Fewer differentiated players usually mean happier shareholders; brutal price wars mean the opposite."
      },
      {
        id: "card-2",
        investorQuestion:
          "What regulatory or legal changes could reshape the business?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Rules can open new markets overnight — or close them. Investors track regulatory tail risk separately from operational risk."
      },
      {
        id: "card-3",
        investorQuestion:
          "Which macro or demand shocks would hurt results fastest?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Recessions, FX swings, and commodity spikes flow through demand and costs even when management executes well."
      }
    ]
  }
] as const;
