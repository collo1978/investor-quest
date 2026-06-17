import type { QuizConfig } from "@/data/quests/types";
import type { BusinessQuestSlug } from "@/lib/business/businessSlugMigration";

/**
 * Business pillar defaults — one checkpoint per section.
 * Tokens filled in `library.ts` via fillQuizConfigTokens.
 */

const PASS = 0.66 as const;

export const BUSINESS_QUEST_QUIZZES: Record<BusinessQuestSlug, QuizConfig> = {
  "what-they-do": {
    passThreshold: PASS,
    questions: [
      {
        kind: "multiple-choice",
        id: "wtd-q1",
        prompt:
          "After this section, what should you be able to explain about {Company.name}?",
        choices: [
          "What it makes and why customers buy",
          "Exact next-quarter EPS to the penny",
          "Only insider trades from last week",
          "Which colour the logo uses"
        ],
        correctIndex: 0,
        explain:
          "You start with what they do in normal words — numbers come later."
      },
      {
        kind: "true-false",
        id: "wtd-q2",
        prompt:
          "You should understand what {Company.name} sells before you worry about the stock price.",
        correct: true,
        explain:
          "Price is noise until you know the business in everyday language."
      },
      {
        kind: "fill-blank",
        id: "wtd-q3",
        prompt:
          "A good one-line test: can you explain what {Company.name} does to a friend who does not invest?",
        options: [
          "Yes — in plain words",
          "No — only jargon",
          "Only if I read the ticker",
          "Only after ten ratios"
        ],
        correctIndex: 0,
        explain:
          "If you can say it simply, you actually understand the company."
      }
    ]
  },
  "why-buying": {
    passThreshold: PASS,
    questions: [
      {
        kind: "multiple-choice",
        id: "wb-q1",
        prompt: "Why do investors care who pays {Company.name} the most?",
        choices: [
          "A few huge buyers can move the whole business up or down",
          "Only store foot traffic matters",
          "Logo colour drives revenue",
          "Headlines equal cash collected"
        ],
        correctIndex: 0,
        explain:
          "Customer concentration is a real business risk, not trivia."
      },
      {
        kind: "scenario",
        id: "wb-q2",
        prompt:
          "One product line at {Company.name} carries most of the sales. What is the main concern?",
        choices: [
          "A slowdown in that line can drag down the whole company",
          "Concentration always means margins must triple",
          "The business automatically has no competitors",
          "Dividends are guaranteed every quarter"
        ],
        correctIndex: 0,
        explain:
          "Heavy reliance on one winner is fine until demand in that line softens."
      },
      {
        kind: "true-false",
        id: "wb-q3",
        prompt:
          "Knowing where the money comes from helps you judge why customers spend here.",
        correct: true,
        explain:
          "Demand and who pays are the business model in plain sight."
      }
    ]
  },
  "everyday-life": {
    passThreshold: PASS,
    questions: [
      {
        kind: "multiple-choice",
        id: "el-q1",
        prompt:
          "Why connect {Company.name} to apps and games you already use?",
        choices: [
          "It turns a ticker into something you can picture in real life",
          "Charts replace reading the business",
          "Only analysts need real-world links",
          "Products never touch consumers"
        ],
        correctIndex: 0,
        explain:
          "Relatable examples are how beginners build real understanding."
      },
      {
        kind: "true-false",
        id: "el-q2",
        prompt:
          "If you can name where you meet a company's tech, you understand it better than memorizing jargon.",
        correct: true,
        explain:
          "Touchpoints make the business stick in your head."
      },
      {
        kind: "scenario",
        id: "el-q3",
        prompt:
          "A friend asks why {Company.name} matters for AI. Best answer style?",
        choices: [
          "Point to apps they use that feel fast or look incredible",
          "Quote only the market cap",
          "Say it is complicated and walk away",
          "List ten accounting ratios first"
        ],
        correctIndex: 0,
        explain:
          "Real-world hooks beat filing language every time."
      }
    ]
  },
  "how-it-works": {
    passThreshold: PASS,
    questions: [
      {
        kind: "order",
        id: "hiw-q1",
        prompt:
          "For {Company.name}, put the typical path from idea to customer in order.",
        steps: [
          "Designed (often with partner factories)",
          "Built and tested at scale",
          "Shipped to customers and partners",
          "Runs inside products you use"
        ],
        explain:
          "Operations is how strategy becomes something people can actually buy."
      },
      {
        kind: "scenario",
        id: "hiw-q2",
        prompt:
          "A key supplier for {Company.name} cannot ship for a quarter. What should worry you first?",
        choices: [
          "Production, availability, and margins until supply recovers",
          "Supply shocks never affect companies this size",
          "Competitors automatically exit the market",
          "The stock must fall exactly 10% that day"
        ],
        correctIndex: 0,
        explain:
          "Even strong operators feel supply concentration in sales and mix."
      },
      {
        kind: "multiple-choice",
        id: "hiw-q3",
        prompt: "Why trace how {Company.name} delivers technology worldwide?",
        choices: [
          "More steps can mean more cost and more delay risk",
          "Distribution only affects logo colours",
          "Customers never care how products arrive",
          "Operations never touch margins"
        ],
        correctIndex: 0,
        explain:
          "The machine behind the product decides whether promises ship on time."
      }
    ]
  },
  "why-they-stay": {
    passThreshold: PASS,
    questions: [
      {
        kind: "multiple-choice",
        id: "wts-q1",
        prompt: "What does a durable edge at {Company.name} usually look like?",
        choices: [
          "Customers stick because switching is slow, expensive, or risky",
          "A guarantee the stock doubles yearly",
          "Elimination of all regulation",
          "Zero need for future investment"
        ],
        correctIndex: 0,
        explain:
          "Trust, habit, and tools people already know are real moats."
      },
      {
        kind: "red-flag",
        id: "wts-q2",
        prompt:
          "Which signal would worry you most about {Company.name}'s competitive edge?",
        choices: [
          "Customers switching away easily with no friction",
          "Continued spend on new products and platforms",
          "Developers still building on the stack",
          "A brand customers still trust in the category"
        ],
        flagIndex: 0,
        explain:
          "If switching gets easy, pricing power and retention are the first casualties."
      },
      {
        kind: "fill-blank",
        id: "wts-q3",
        prompt:
          "Developers keeping tools on {Company.name} is a quiet form of customer ___ .",
        options: ["loyalty", "confusion", "indifference", "randomness"],
        correctIndex: 0,
        explain:
          "Habit in code outlasts one hot product cycle."
      }
    ]
  },
  competition: {
    passThreshold: PASS,
    questions: [
      {
        kind: "multiple-choice",
        id: "comp-q1",
        prompt: "Why map {Company.name}'s rivals before you get excited about the stock?",
        choices: [
          "Competitors and trends shape pricing, share, and strategic risk",
          "Only one company can exist per industry",
          "Rivals never affect margins",
          "Competition removes all regulation"
        ],
        correctIndex: 0,
        explain:
          "The battlefield matters as much as today's win."
      },
      {
        kind: "scenario",
        id: "comp-q2",
        prompt:
          "A trend lifts AI spending industry-wide. For {Company.name}, that is mostly…",
        choices: [
          "A tailwind — if they keep winning orders inside the boom",
          "A promise profits never dip",
          "Proof rivals disappear",
          "A reason to ignore competition"
        ],
        correctIndex: 0,
        explain:
          "Tailwinds help, but share and execution still decide who captures them."
      },
      {
        kind: "true-false",
        id: "comp-q3",
        prompt:
          "Export rules, rival chips, or slower AI spending could slow {Company.name} even if products stay strong.",
        correct: true,
        explain:
          "Headwinds hit orders and mood before the story fully resets."
      }
    ]
  }
};
