import type { QuestTemplate } from "@/data/quests/types";
import { BUSINESS_QUEST_QUIZZES } from "@/data/quests/businessQuestQuizzes";

/**
 * Business pillar — seven adaptive-learning sections (Item 1 Business / 10-K).
 * Each section: insight cards → section checkpoint quiz (what-they-do: 3 cards).
 */
export const BUSINESS_QUEST_TEMPLATES: readonly QuestTemplate[] = [
  {
    slug: "what-they-do",
    type: "snapshot",
    pillarId: "business",
    title: "WHAT {Company.name} ACTUALLY DOES",
    objective:
      "Build a clear picture of what the company does, how it evolved, and who relies on it.",
    description:
      "Three quick cards: business purpose, company evolution, and global presence — grounded in Item 1 Business.",
    investorQuestion: "What does {Company.name} actually do?",
    plainEnglishAnswer: null,
    whyItMatters:
      "If you cannot explain what a company does in everyday words, every later judgment is guesswork.",
    secSection: {
      form: "10-K",
      section: "Item 1 Business",
      hint: "Products, services, and business overview."
    },
    aiTask:
      "Explain what {Company.name} does, how it evolved, and who uses its products — in plain English from Item 1 Business.",
    artifactType: "one-pager",
    rewardXp: 100,
    unlockRequirements: { pillar: "business" },
    completionState: { kind: "quiz", passPct: 0.66 },
    difficulty: "intro",
    visualStyle: "card",
    estimatedTime: 3,
    displayOrder: 1,
    hubIcon: "what-they-do",
    hubCardCount: 3,
    hubLocked: false,
    tags: ["overview", "intro", "company"],
    quizConfig: BUSINESS_QUEST_QUIZZES["what-they-do"],
    cards: [
      {
        id: "card-1",
        investorQuestion: "What does {Company.name} actually do?",
        plainEnglishAnswer: null,
        whyItMatters:
          "You cannot judge a company until you can explain what it does in plain words."
      },
      {
        id: "card-2",
        investorQuestion: "How has {Company.name} evolved over time?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Seeing how a company evolved shows whether it can adapt and grow."
      },
      {
        id: "card-3",
        investorQuestion: "Who uses {Company.name}'s products around the world?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Knowing who depends on the business helps you understand its size and reach."
      }
    ]
  },
  {
    slug: "why-buying",
    type: "revenue",
    pillarId: "business",
    title: "WHAT {Company.name} SELLS & WHY IT WINS",
    objective: "Understand what the company sells, why customers choose it and how it keeps improving.",
    description:
      "Three quick cards: value proposition, product portfolio and innovation — grounded in Item 1 Business.",
    investorQuestion: "What problem does {Company.name} solve for customers?",
    plainEnglishAnswer: null,
    whyItMatters:
      "If you cannot explain why customers choose this company, you cannot judge whether demand will last.",
    secSection: {
      form: "10-K",
      section: "Item 1 Business",
      hint: "Products, services, and competitive advantages."
    },
    aiTask:
      "Explain {Company.name}'s value proposition, product portfolio and innovation in plain English.",
    artifactType: "map",
    rewardXp: 120,
    unlockRequirements: {
      pillar: "business",
      questSlugs: ["what-they-do"]
    },
    completionState: { kind: "quiz", passPct: 0.66 },
    difficulty: "core",
    visualStyle: "panel",
    estimatedTime: 4,
    displayOrder: 2,
    hubIcon: "why-buying",
    hubCardCount: 3,
    tags: ["products", "value", "innovation"],
    quizConfig: BUSINESS_QUEST_QUIZZES["why-buying"],
    cards: [
      {
        id: "card-1",
        investorQuestion: "What problem does {Company.name} solve?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Investors look for businesses that solve real customer problems."
      },
      {
        id: "card-2",
        investorQuestion: "What products does {Company.name} sell?",
        plainEnglishAnswer: null,
        whyItMatters:
          "A broad range of products can reduce risk and create growth opportunities."
      },
      {
        id: "card-3",
        investorQuestion: "Why is innovation so important to {Company.name}?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Companies that keep innovating are more likely to stay competitive over the long term."
      }
    ]
  },
  {
    slug: "everyday-life",
    type: "everyday",
    pillarId: "business",
    title: "HOW {Company.name} STAYS AHEAD",
    objective: "See how the company tries to stay ahead through technology and innovation.",
    description:
      "Five quick cards on technology, AI, graphics, future markets, and owned inventions — grounded in Item 1 strategy themes.",
    investorQuestion:
      "How does {Company.name} stay ahead through technology?",
    plainEnglishAnswer: null,
    whyItMatters:
      "Knowing how a company tries to stay ahead helps you judge whether its edge can last.",
    secSection: {
      form: "10-K",
      section: "Item 1 Business",
      hint: "Strategy, competition, R&D, and key markets."
    },
    aiTask:
      "Explain how {Company.name} tries to stay ahead: core technology, AI, graphics, future markets, and owned inventions.",
    artifactType: "map",
    rewardXp: 120,
    unlockRequirements: {
      pillar: "business",
      questSlugs: ["why-buying"]
    },
    completionState: { kind: "quiz", passPct: 0.66 },
    difficulty: "core",
    visualStyle: "card",
    estimatedTime: 5,
    displayOrder: 3,
    hubIcon: "everyday-life",
    hubCardCount: 5,
    tags: ["everyday", "strategy", "competition"],
    quizConfig: BUSINESS_QUEST_QUIZZES["everyday-life"],
    cards: [
      {
        id: "card-1",
        investorQuestion:
          "How does {Company.name} stay ahead through technology?",
        plainEnglishAnswer: null,
        whyItMatters:
          "A full platform can be harder to copy than a single chip."
      },
      {
        id: "card-2",
        investorQuestion: "How does {Company.name} stay ahead in AI?",
        plainEnglishAnswer: null,
        whyItMatters:
          "AI spending is huge — leaders in AI tools can win repeat orders."
      },
      {
        id: "card-3",
        investorQuestion: "How does {Company.name} stay ahead in graphics?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Gaming and design keep millions of users tied to the brand."
      },
      {
        id: "card-4",
        investorQuestion:
          "How does {Company.name} stay ahead in self-driving cars?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Early bets on new markets can pay off if the industry grows."
      },
      {
        id: "card-5",
        investorQuestion:
          "How does {Company.name} stay ahead through its technology?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Owned inventions can spread through licensing, not just direct sales."
      }
    ]
  },
  {
    slug: "how-it-works",
    type: "operations",
    pillarId: "business",
    title: "HOW {Company.name} SELLS AND MARKETS",
    objective: "See how the company reaches customers and supports them.",
    description:
      "Partners, customer support, and developers — how sales, distribution, and ecosystem growth work in Item 1.",
    investorQuestion: "How does {Company.name} reach customers around the world?",
    plainEnglishAnswer: null,
    whyItMatters:
      "Strong partnerships and customer relationships can help a company grow faster and reach more buyers.",
    secSection: {
      form: "10-K",
      section: "Item 1 Business",
      hint: "Sales, distribution, partners, and customer support."
    },
    aiTask:
      "Explain how {Company.name} sells and markets: partners, customer support, and why developers matter.",
    artifactType: "note",
    rewardXp: 120,
    unlockRequirements: {
      pillar: "business",
      questSlugs: ["everyday-life"]
    },
    completionState: { kind: "quiz", passPct: 0.66 },
    difficulty: "core",
    visualStyle: "panel",
    estimatedTime: 4,
    displayOrder: 4,
    hubIcon: "how-it-works",
    hubCardCount: 3,
    tags: ["operations", "supply-chain", "delivery"],
    quizConfig: BUSINESS_QUEST_QUIZZES["how-it-works"],
    cards: [
      {
        id: "card-1",
        investorQuestion:
          "How does {Company.name} reach customers around the world?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Partner networks can expand reach beyond what one company could do alone."
      },
      {
        id: "card-2",
        investorQuestion:
          "How does {Company.name} help customers use its technology?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Hands-on support helps customers succeed — and keep buying."
      },
      {
        id: "card-3",
        investorQuestion: "Why are developers important to {Company.name}?",
        plainEnglishAnswer: null,
        whyItMatters:
          "More developers on the platform can strengthen the whole ecosystem."
      }
    ]
  },
  {
    slug: "why-they-stay",
    type: "operations",
    pillarId: "business",
    title: "WHO MAKES {Company.name}'S CHIPS?",
    objective: "Follow design → supplier → factory in plain steps.",
    description:
      "Who manufactures the chips, why suppliers matter, and where products are made — supply chain in Item 1.",
    investorQuestion: "Does {Company.name} manufacture its own chips?",
    plainEnglishAnswer: null,
    whyItMatters:
      "Even great products depend on partners who can actually build and ship them.",
    secSection: {
      form: "10-K",
      section: "Supply Chain",
      hint: "Manufacturing partners, suppliers, and global operations."
    },
    aiTask:
      "Explain who manufactures {Company.name}'s chips, why it uses suppliers, and where products are made.",
    artifactType: "scorecard",
    rewardXp: 140,
    unlockRequirements: {
      pillar: "business",
      questSlugs: ["how-it-works"]
    },
    completionState: { kind: "quiz", passPct: 0.66 },
    difficulty: "deep",
    visualStyle: "board",
    estimatedTime: 5,
    displayOrder: 5,
    hubIcon: "why-they-stay",
    hubCardCount: 4,
    tags: ["operations", "supply-chain", "manufacturing"],
    quizConfig: BUSINESS_QUEST_QUIZZES["why-they-stay"],
    cards: [
      {
        id: "card-1",
        investorQuestion: "Does {Company.name} manufacture its own chips?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Design plus manufacturing partners decide whether launches land on time."
      },
      {
        id: "card-2",
        investorQuestion: "Why does {Company.name} work with suppliers?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Specialist suppliers can scale faster than owning every factory."
      },
      {
        id: "card-3",
        investorQuestion: "Where are {Company.name}'s products made?",
        plainEnglishAnswer: null,
        whyItMatters:
          "A global supply chain can access the best manufacturers — but adds distance and risk."
      },
      {
        id: "card-4",
        investorQuestion:
          "Which companies help manufacture {Company.name}'s chips?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Depending on a few key partners can be a strength or a bottleneck."
      }
    ]
  },
  {
    slug: "competition",
    type: "industry",
    pillarId: "business",
    title: "HOW TOUGH IS THIS INDUSTRY?",
    objective: "See why the industry is hard to compete in and what it takes to win.",
    description:
      "Fast-moving technology, customer expectations, future demand, and new challengers — competition in Item 1.",
    investorQuestion: "Why is this industry difficult to compete in?",
    plainEnglishAnswer: null,
    whyItMatters:
      "Highly competitive industries reward companies that keep improving — and punish those that stop.",
    secSection: {
      form: "10-K",
      section: "Competition",
      hint: "Industry dynamics, competitive factors, and market trends."
    },
    aiTask:
      "Explain how tough the industry is for {Company.name}: technology pace, customer needs, and competitive threats.",
    artifactType: "memo",
    rewardXp: 140,
    unlockRequirements: {
      pillar: "business",
      questSlugs: ["why-they-stay"]
    },
    completionState: { kind: "quiz", passPct: 0.66 },
    difficulty: "deep",
    visualStyle: "panel",
    estimatedTime: 5,
    displayOrder: 6,
    hubIcon: "competition",
    hubCardCount: 4,
    tags: ["competition", "industry", "strategy"],
    quizConfig: BUSINESS_QUEST_QUIZZES.competition,
    cards: [
      {
        id: "card-1",
        investorQuestion: "Why is this industry difficult to compete in?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Fast-changing technology means standing still can mean falling behind."
      },
      {
        id: "card-2",
        investorQuestion: "What helps companies win customers?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Performance, price, and support decide who customers choose."
      },
      {
        id: "card-3",
        investorQuestion:
          "Why does {Company.name} need to predict future demand?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Building the wrong product is costly when customer needs shift."
      },
      {
        id: "card-4",
        investorQuestion: "What could threaten {Company.name}'s position?",
        plainEnglishAnswer: null,
        whyItMatters:
          "New challengers can undercut on price, speed, or features."
      }
    ]
  },
  {
    slug: "who-competes",
    type: "industry",
    pillarId: "business",
    title: "WHO IS {Company.name} COMPETING AGAINST?",
    objective: "Name the rivals across chips, tech, CPUs, devices, and networking.",
    description:
      "AI chip makers, big tech, CPU rivals, automotive and smart devices, and networking — competition in Item 1.",
    investorQuestion: "Which chip companies compete with {Company.name}?",
    plainEnglishAnswer: null,
    whyItMatters:
      "Knowing who you fight helps you judge whether the lead can last.",
    secSection: {
      form: "10-K",
      section: "Competition",
      hint: "Named competitors by product category and market."
    },
    aiTask:
      "List who competes with {Company.name} across chips, big tech, CPUs, devices, and networking.",
    artifactType: "memo",
    rewardXp: 150,
    unlockRequirements: {
      pillar: "business",
      questSlugs: ["competition"]
    },
    completionState: { kind: "quiz", passPct: 0.66 },
    difficulty: "deep",
    visualStyle: "panel",
    estimatedTime: 6,
    displayOrder: 7,
    hubIcon: "who-competes",
    hubCardCount: 5,
    tags: ["competition", "rivals", "strategy"],
    quizConfig: BUSINESS_QUEST_QUIZZES["who-competes"],
    cards: [
      {
        id: "card-1",
        investorQuestion: "Which chip companies compete with {Company.name}?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Chip rivals can undercut on price, speed, or features."
      },
      {
        id: "card-2",
        investorQuestion:
          "Which technology companies compete with {Company.name}?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Big tech building its own chips can change who buys from you."
      },
      {
        id: "card-3",
        investorQuestion:
          "Which companies compete with {Company.name} in CPUs?",
        plainEnglishAnswer: null,
        whyItMatters:
          "CPU competition can pull customers toward other platforms."
      },
      {
        id: "card-4",
        investorQuestion:
          "Which companies compete with {Company.name} in vehicles and smart devices?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Auto and edge markets can shift if rivals win key design slots."
      },
      {
        id: "card-5",
        investorQuestion:
          "Which companies compete with {Company.name} in networking?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Data-center networking rivals can affect cloud and AI build-outs."
      }
    ]
  }
] as const;
