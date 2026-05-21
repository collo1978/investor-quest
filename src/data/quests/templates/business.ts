import type { QuestTemplate } from "@/data/quests/types";

/**
 * Business pillar — 5 quests covering the core of "what the company does".
 * Slugs match the `/business/[questSlug]` routes (snapshot/revenue/operations/advantage/industry).
 */
export const BUSINESS_QUEST_TEMPLATES: readonly QuestTemplate[] = [
  {
    slug: "snapshot",
    type: "snapshot",
    pillarId: "business",
    title: "A Quick Snapshot",
    objective: "Get a quick overview of the business.",
    description:
      "In a tight brief: what does {Company.name} ({Company.ticker}) sell, to whom, and what is the one-line thesis for why it matters?",
    investorQuestion: "What does this company actually do?",
    plainEnglishAnswer: null,
    whyItMatters:
      "If you can't say what a company sells in one sentence, you can't judge whether it can grow.",
    secSection: {
      form: "10-K",
      section: "Item 1 — Business",
      hint: "Use the opening overview and product/services subsections."
    },
    aiTask:
      "Summarize {Company.name}'s business model in 3-5 plain-English sentences: products, customers, and the one-line thesis.",
    artifactType: "one-pager",
    rewardXp: 100,
    unlockRequirements: { pillar: "business" },
    completionState: {
      kind: "checklist",
      checklistKeys: ["evidence", "numbers", "risk"]
    },
    difficulty: "intro",
    visualStyle: "card",
    estimatedTime: 3,
    displayOrder: 1,
    hubIcon: "snapshot",
    hubCardCount: 3,
    hubLocked: false,
    tags: ["overview", "intro", "thesis"],
    cards: [
      {
        id: "card-1",
        investorQuestion: "What does this company actually do?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Understanding the business is the first step to investing with confidence."
      },
      {
        id: "card-2",
        investorQuestion: "What problem does it solve for customers?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Companies that solve real problems tend to last longer and grow stronger."
      },
      {
        id: "card-3",
        investorQuestion:
          "How big is the company or its position in the market?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Bigger or leading companies often have advantages like brand, scale, and trust."
      }
    ]
  },
  {
    slug: "revenue",
    type: "revenue",
    pillarId: "business",
    title: "Revenue",
    objective:
      "See where {Company.name} earns its money — by product, region, and customer.",
    description:
      "Trace {Company.name}'s revenue mix: products and services, geographic markets, and customer base.",
    investorQuestion: "Where does the company actually make its money?",
    plainEnglishAnswer: null,
    whyItMatters:
      "Knowing the revenue mix tells you which parts of the business actually matter to the bottom line.",
    secSection: {
      form: "10-K",
      section: "Item 1 — Business",
      hint: "Use the products/services, markets, and customer subsections."
    },
    aiTask:
      "Explain {Company.name}'s revenue split by product/service, geographic region, and customer type in plain English.",
    artifactType: "map",
    rewardXp: 120,
    unlockRequirements: { pillar: "business", questSlugs: ["snapshot"] },
    completionState: { kind: "quiz", passPct: 0.66 },
    difficulty: "core",
    visualStyle: "panel",
    estimatedTime: 4,
    displayOrder: 2,
    hubIcon: "revenue",
    hubCardCount: 3,
    tags: ["revenue", "products", "geography", "customers"],
    cards: [
      {
        id: "card-1",
        investorQuestion:
          "What products or services does the company sell?",
        plainEnglishAnswer: null,
        whyItMatters:
          "If most money comes from one thing, the business may be risky if demand drops."
      },
      {
        id: "card-2",
        investorQuestion: "Which geographic regions do they sell to?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Relying on one region can be risky if that market slows down."
      },
      {
        id: "card-3",
        investorQuestion: "Who are the customers?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Knowing who pays helps you judge how stable and predictable the business is."
      }
    ]
  },
  {
    slug: "operations",
    type: "operations",
    pillarId: "business",
    title: "Operations",
    objective:
      "See how {Company.name} actually runs day-to-day — distribution and workforce.",
    description:
      "Outline how {Company.name}'s products reach customers and what kind of workforce executes the business.",
    investorQuestion: "How does the business actually run day-to-day?",
    plainEnglishAnswer: null,
    whyItMatters:
      "Operations decide whether growing the business cheaply is even possible.",
    secSection: {
      form: "10-K",
      section: "Item 1 — Business",
      hint: "Combine the distribution, supply chain, and human-capital subsections."
    },
    aiTask:
      "Describe {Company.name}'s distribution channels and workforce composition in plain English.",
    artifactType: "note",
    rewardXp: 120,
    unlockRequirements: { pillar: "business", questSlugs: ["revenue"] },
    completionState: { kind: "quiz", passPct: 0.66 },
    difficulty: "core",
    visualStyle: "panel",
    estimatedTime: 4,
    displayOrder: 3,
    hubIcon: "operations",
    hubCardCount: 2,
    tags: ["operations", "distribution", "workforce"],
    cards: [
      {
        id: "card-1",
        investorQuestion: "How do their products reach customers?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Shows how complex or expensive it is to deliver — which affects profits."
      },
      {
        id: "card-2",
        investorQuestion: "What kind of workforce runs the business?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Strong teams and leadership help the company execute and grow."
      }
    ]
  },
  {
    slug: "advantage",
    type: "advantage",
    pillarId: "business",
    title: "Advantage",
    objective:
      "Find what gives {Company.name} an edge — R&D investment and what protects the business.",
    description:
      "Identify {Company.name}'s edge: how much it invests in R&D and what protects it (brand, IP, ecosystem, loyalty).",
    investorQuestion: "What gives this company an edge?",
    plainEnglishAnswer: null,
    whyItMatters:
      "Companies that are easy to copy lose pricing power. Durable advantages protect long-term returns.",
    secSection: {
      form: "10-K",
      section: "Item 1 — Business",
      hint: "Use the R&D and competition / intellectual-property subsections."
    },
    aiTask:
      "Explain {Company.name}'s R&D investment focus and what protects it (brand, IP, proprietary tech, ecosystem, loyalty) in plain English.",
    artifactType: "scorecard",
    rewardXp: 140,
    unlockRequirements: {
      pillar: "business",
      questSlugs: ["revenue", "operations"]
    },
    completionState: { kind: "quiz", passPct: 0.66 },
    difficulty: "deep",
    visualStyle: "board",
    estimatedTime: 5,
    displayOrder: 4,
    hubIcon: "advantage",
    hubCardCount: 2,
    tags: ["moat", "advantage", "r-and-d"],
    cards: [
      {
        id: "card-1",
        investorQuestion: "Do they invest in research and development (R&D)?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Investing in new ideas helps the company stay competitive over time."
      },
      {
        id: "card-2",
        investorQuestion:
          "What protects the business (patents, brand, technology)?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Strong protection makes it harder for competitors to copy them."
      }
    ]
  },
  {
    slug: "industry",
    type: "industry",
    pillarId: "business",
    title: "Industry",
    objective:
      "Gauge how tough {Company.name}'s industry is — competitors, intensity, and regulation.",
    description:
      "Place {Company.name} in its industry: main rivals, competitive intensity, and the regulatory backdrop.",
    investorQuestion: "How tough is the industry?",
    plainEnglishAnswer: null,
    whyItMatters:
      "Even a great company can struggle in a shrinking or hostile industry. Context is half the thesis.",
    secSection: {
      form: "10-K",
      section: "Item 1 — Business",
      hint: "Use the competition and regulatory subsections; cross-check peers."
    },
    aiTask:
      "Profile {Company.name}'s industry in plain English: main competitors, how competitive it is, and key regulations.",
    artifactType: "memo",
    rewardXp: 140,
    unlockRequirements: { pillar: "business", questSlugs: ["advantage"] },
    completionState: { kind: "quiz", passPct: 0.66 },
    difficulty: "deep",
    visualStyle: "panel",
    estimatedTime: 5,
    displayOrder: 5,
    hubIcon: "industry",
    hubCardCount: 3,
    tags: ["industry", "competition", "regulation"],
    cards: [
      {
        id: "card-1",
        investorQuestion: "Who are the main competitors?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Strong competitors can limit growth and reduce profits."
      },
      {
        id: "card-2",
        investorQuestion: "How competitive is the industry?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Highly competitive markets often mean lower margins."
      },
      {
        id: "card-3",
        investorQuestion: "Are there regulations that affect the business?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Rules and laws can increase costs or limit how the company operates."
      }
    ]
  }
] as const;
