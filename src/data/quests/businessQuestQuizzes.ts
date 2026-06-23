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
        kind: "multiple-choice",
        id: "hiw-q1",
        prompt: "How does {Company.name} reach customers around the world?",
        choices: [
          "Through a large network of partners that sell, distribute, and support its products",
          "Only through company-owned stores in every country",
          "By shipping products directly to every household",
          "Through banks that manage product orders"
        ],
        correctIndex: 0,
        explain:
          "Partners help {Company.name} reach more customers across industries and countries than it could on its own."
      },
      {
        kind: "true-false",
        id: "hiw-q2",
        prompt:
          "{Company.name} employs engineers and technology experts who work closely with customers to help them use its products.",
        correct: true,
        explain:
          "Hands-on support helps customers get the most value from {Company.name}'s technology."
      },
      {
        kind: "fill-blank",
        id: "hiw-q3",
        prompt:
          "Complete the sentence:\nThe more developers who use {Company.name}'s platform, the ______ its ecosystem becomes.",
        options: ["Stronger", "Smaller", "Slower", "Quieter"],
        correctIndex: 0,
        explain:
          "Tools, training, and educational programs help developers build on {Company.name} — and a stronger ecosystem attracts more users."
      }
    ]
  },
  "why-they-stay": {
    passThreshold: PASS,
    questions: [
      {
        kind: "multiple-choice",
        id: "wts-q1",
        prompt: "Does {Company.name} manufacture its own chips?",
        choices: [
          "No — it designs chips and other companies manufacture them",
          "Yes — it owns all chip factories worldwide",
          "Yes — every chip is built only in the United States",
          "No — it only sells software, not chips"
        ],
        correctIndex: 0,
        explain:
          "{Company.name} designs its chips and relies on specialist manufacturers to produce them."
      },
      {
        kind: "true-false",
        id: "wts-q2",
        prompt:
          "{Company.name}'s supply chain spans multiple countries, with many suppliers in the Asia-Pacific region.",
        correct: true,
        explain:
          "A global supply chain helps {Company.name} access leading manufacturing companies."
      },
      {
        kind: "fill-blank",
        id: "wts-q3",
        prompt:
          "Complete the sentence:\nEven great products depend on a strong supply ___ .",
        options: ["chain", "color", "logo", "slogan"],
        correctIndex: 0,
        explain:
          "Investors watch who makes the products — and what happens if suppliers run into problems."
      }
    ]
  },
  competition: {
    passThreshold: PASS,
    questions: [
      {
        kind: "multiple-choice",
        id: "comp-q1",
        prompt: "Why is this industry difficult to compete in?",
        choices: [
          "Technology changes quickly and companies must keep improving",
          "Technology never changes",
          "Only one company is allowed to sell products",
          "Customers never want new products"
        ],
        correctIndex: 0,
        explain:
          "Fast-moving tech means companies must constantly improve to stay ahead."
      },
      {
        kind: "true-false",
        id: "comp-q2",
        prompt:
          "Customers look for products that perform well, are reasonably priced, and have strong software support.",
        correct: true,
        explain:
          "Companies that meet these needs are more likely to win customers."
      },
      {
        kind: "fill-blank",
        id: "comp-q3",
        prompt:
          "Complete the sentence:\nNew competitors may offer cheaper or faster products — so {Company.name} must keep ______ to stay competitive.",
        options: ["innovating", "advertising only", "closing factories", "raising prices only"],
        correctIndex: 0,
        explain:
          "Even strong leaders must keep innovating when new challengers enter the market."
      }
    ]
  },
  "who-competes": {
    passThreshold: PASS,
    questions: [
      {
        kind: "multiple-choice",
        id: "wc-q1",
        prompt: "Which chip companies compete with {Company.name}?",
        choices: [
          "AMD, Intel, and Huawei",
          "Only grocery store brands",
          "Banks and insurance companies",
          "Streaming video services"
        ],
        correctIndex: 0,
        explain:
          "These companies develop chips and processors used for AI and advanced computing."
      },
      {
        kind: "true-false",
        id: "wc-q2",
        prompt:
          "Many big tech companies are developing their own AI chips and computing systems.",
        correct: true,
        explain:
          "Companies like Amazon, Microsoft, and Google are building their own AI computing platforms."
      },
      {
        kind: "fill-blank",
        id: "wc-q3",
        prompt:
          "Complete the sentence:\nUnderstanding the competition helps investors judge whether a company can protect its ______ position.",
        options: ["market", "logo", "headline", "slogan"],
        correctIndex: 0,
        explain:
          "Knowing the rivals helps you see whether a company can defend its place in the industry."
      }
    ]
  }
};
