import type { QuestTemplate } from "@/data/quests/types";
import { BUSINESS_QUEST_QUIZZES } from "@/data/quests/businessQuestQuizzes";

/**
 * Business pillar — six adaptive-learning sections (Item 1 Business / 10-K).
 * Each section: insight cards → section checkpoint quiz (what-they-do: 2 cards).
 */
export const BUSINESS_QUEST_TEMPLATES: readonly QuestTemplate[] = [
  {
    slug: "what-they-do",
    type: "snapshot",
    pillarId: "business",
    title: "WHAT {Company.name} ACTUALLY DOES",
    objective: "Explain what the company does in normal language.",
    description:
      "Two quick cards: what they sell and why customers buy — grounded in Item 1 Business.",
    investorQuestion: "What does {Company.name} actually sell?",
    plainEnglishAnswer: null,
    whyItMatters:
      "If you cannot explain what they sell in everyday words, every later judgment is guesswork.",
    secSection: {
      form: "10-K",
      section: "Item 1 Business",
      hint: "Products, services, and business overview."
    },
    aiTask:
      "Explain what {Company.name} sells and why customers buy in plain English — products and buyer benefits.",
    artifactType: "one-pager",
    rewardXp: 100,
    unlockRequirements: { pillar: "business" },
    completionState: { kind: "quiz", passPct: 0.66 },
    difficulty: "intro",
    visualStyle: "card",
    estimatedTime: 3,
    displayOrder: 1,
    hubIcon: "what-they-do",
    hubCardCount: 2,
    hubLocked: false,
    tags: ["overview", "intro", "company"],
    quizConfig: BUSINESS_QUEST_QUIZZES["what-they-do"],
    cards: [
      {
        id: "card-1",
        investorQuestion: "What does {Company.name} actually sell?",
        plainEnglishAnswer: null,
        whyItMatters:
          "You cannot judge growth if you cannot say what people actually buy."
      },
      {
        id: "card-2",
        investorQuestion: "Why do customers buy {Company.name} products?",
        plainEnglishAnswer: null,
        whyItMatters:
          "When buyers get real speed and efficiency, they keep ordering."
      }
    ]
  },
  {
    slug: "why-buying",
    type: "revenue",
    pillarId: "business",
    title: "WHY THE WORLD IS BUYING {Company.name}",
    objective: "See where the money comes from and who pays the biggest bills.",
    description:
      "Who spends the most, which products print money, and why the AI chip rush is happening — Item 1 and segment disclosures.",
    investorQuestion: "Who spends the most money with {Company.name}?",
    plainEnglishAnswer: null,
    whyItMatters:
      "When a few big customers pay most of the bills, one pause in orders can hurt fast.",
    secSection: {
      form: "10-K",
      section: "Revenue Segments",
      hint: "Products, services, markets, and major customers."
    },
    aiTask:
      "Explain {Company.name}'s demand drivers: top customers, biggest product lines, and why buyers are rushing in now.",
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
    tags: ["revenue", "customers", "demand"],
    quizConfig: BUSINESS_QUEST_QUIZZES["why-buying"],
    cards: [
      {
        id: "card-1",
        investorQuestion: "Who spends the most money with {Company.name}?",
        plainEnglishAnswer: null,
        whyItMatters:
          "A handful of giants can move the whole company up or down."
      },
      {
        id: "card-2",
        investorQuestion:
          "What products make {Company.name} the most money?",
        plainEnglishAnswer: null,
        whyItMatters:
          "If one product carries the company, a bad cycle hits hard."
      },
      {
        id: "card-3",
        investorQuestion:
          "Why are companies rushing to buy AI chips?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Demand waves explain both the hype and the risk of a slowdown."
      }
    ]
  },
  {
    slug: "everyday-life",
    type: "everyday",
    pillarId: "business",
    title: "HOW {Company.name} FITS INTO EVERYDAY LIFE",
    objective: "Connect the company to apps, games, and AI you already touch.",
    description:
      "Where you meet their tech, how gaming and AI apps feel different, and why builders rely on them — still grounded in Item 1.",
    investorQuestion:
      "Where do people interact with {Company.name} technology?",
    plainEnglishAnswer: null,
    whyItMatters:
      "When you can point to real life, the company stops feeling like a ticker symbol.",
    secSection: {
      form: "10-K",
      section: "Item 1 Business",
      hint: "Products, end markets, and how customers use the technology."
    },
    aiTask:
      "Connect {Company.name} to everyday life: consumer touchpoints, gaming, AI apps, and why developers standardize on them.",
    artifactType: "map",
    rewardXp: 120,
    unlockRequirements: {
      pillar: "business",
      questSlugs: ["why-buying"]
    },
    completionState: { kind: "quiz", passPct: 0.66 },
    difficulty: "core",
    visualStyle: "card",
    estimatedTime: 4,
    displayOrder: 3,
    hubIcon: "everyday-life",
    hubCardCount: 3,
    tags: ["everyday", "relatable", "ecosystem"],
    quizConfig: BUSINESS_QUEST_QUIZZES["everyday-life"],
    cards: [
      {
        id: "card-1",
        investorQuestion:
          "Where do people interact with {Company.name} technology?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Touchpoints turn abstract chips into something you can picture."
      },
      {
        id: "card-2",
        investorQuestion:
          "How does {Company.name} affect gaming and AI apps?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Speed and graphics are how most people feel the business in real life."
      },
      {
        id: "card-3",
        investorQuestion: "Why do AI companies rely on {Company.name}?",
        plainEnglishAnswer: null,
        whyItMatters:
          "When builders depend on you, demand can stick even when headlines shift."
      }
    ]
  },
  {
    slug: "how-it-works",
    type: "operations",
    pillarId: "business",
    title: "HOW THE BUSINESS REALLY WORKS",
    objective: "Follow design → factory → delivery in plain steps.",
    description:
      "How chips are designed and built, who manufactures them, and how tech reaches the world — supply chain and human capital in Item 1.",
    investorQuestion: "How are {Company.name} chips designed and built?",
    plainEnglishAnswer: null,
    whyItMatters:
      "Late chips feel like a delayed preorder — customers notice when shipments slip.",
    secSection: {
      form: "10-K",
      section: "Supply Chain",
      hint: "Manufacturing, partners, distribution, and workforce."
    },
    aiTask:
      "Explain how {Company.name} designs chips, who builds them, and how products reach customers worldwide.",
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
        investorQuestion: "How are {Company.name} chips designed and built?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Design plus manufacturing partners decide whether launches land on time."
      },
      {
        id: "card-2",
        investorQuestion: "Who helps manufacture {Company.name} products?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Depending on a few factories can be a strength or a bottleneck."
      },
      {
        id: "card-3",
        investorQuestion:
          "How does {Company.name} deliver its technology worldwide?",
        plainEnglishAnswer: null,
        whyItMatters:
          "More steps to reach customers usually mean more cost and more delay risk."
      }
    ]
  },
  {
    slug: "why-they-stay",
    type: "advantage",
    pillarId: "business",
    title: "WHY CUSTOMERS KEEP CHOOSING {Company.name}",
    objective: "Trust, habit, and speed — not hype.",
    description:
      "Why they are hard to replace, what makes them different, and why developers keep building on them — R&D and competition subsections.",
    investorQuestion: "Why is {Company.name} hard to replace?",
    plainEnglishAnswer: null,
    whyItMatters:
      "A real edge beats one hot year — customers stick when switching is painful.",
    secSection: {
      form: "10-K",
      section: "Item 1. Business",
      hint: "R&D, intellectual property, ecosystem, and competition."
    },
    aiTask:
      "Explain why customers stay with {Company.name}: switching costs, trust, product lead, and developer habit.",
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
    hubCardCount: 3,
    tags: ["moat", "advantage", "loyalty"],
    quizConfig: BUSINESS_QUEST_QUIZZES["why-they-stay"],
    cards: [
      {
        id: "card-1",
        investorQuestion: "Why is {Company.name} hard to replace?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Harder to copy means they can charge more without losing customers."
      },
      {
        id: "card-2",
        investorQuestion:
          "What makes {Company.name} different from competitors?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Difference only matters if buyers feel it when they place orders."
      },
      {
        id: "card-3",
        investorQuestion:
          "Why do developers keep building around {Company.name}?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Developer habit is a quiet moat — tools and code outlast one product cycle."
      }
    ]
  },
  {
    slug: "competition",
    type: "industry",
    pillarId: "business",
    title: "THE COMPETITION {Company.name} FACES",
    objective: "Name rivals, tailwinds, and what could slow them down.",
    description:
      "Who is competing, trends that could accelerate growth, and risks ahead — competition and regulation in Item 1.",
    investorQuestion: "Who is trying to compete with {Company.name}?",
    plainEnglishAnswer: null,
    whyItMatters:
      "You need the competitive picture before you judge if the lead can last.",
    secSection: {
      form: "10-K",
      section: "Competition",
      hint: "Competition, industry trends, and regulatory risks."
    },
    aiTask:
      "Profile rivals, industry tailwinds, and strategic risks for {Company.name} in plain English.",
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
    hubCardCount: 3,
    tags: ["competition", "strategy", "regulation"],
    quizConfig: BUSINESS_QUEST_QUIZZES.competition,
    cards: [
      {
        id: "card-1",
        investorQuestion: "Who is trying to compete with {Company.name}?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Strong competitors can limit growth and reduce profits."
      },
      {
        id: "card-2",
        investorQuestion:
          "What trends could help {Company.name} grow even faster?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Tailwinds can lift everyone — you want to know which ones are real."
      },
      {
        id: "card-3",
        investorQuestion:
          "What could slow {Company.name} down in the future?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Headwinds show up in orders and mood long before the story resets."
      }
    ]
  }
] as const;
