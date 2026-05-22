import type { QuizConfig } from "@/data/quests/types";

const PASS = 0.66 as const;

/** Default mastery quizzes for Business pillar quests (all tickers). */
export const BUSINESS_QUEST_QUIZZES: Record<
  "snapshot" | "revenue" | "operations" | "advantage" | "industry",
  QuizConfig
> = {
  snapshot: {
    passThreshold: PASS,
    questions: [
      {
        kind: "multiple-choice",
        id: "snapshot-q1",
        prompt:
          "After reading the cards, what is the best first question about any company?",
        choices: [
          "What does it actually sell and to whom?",
          "What was the stock price yesterday?",
          "How many employees tweeted today?",
          "Which colour is the logo?"
        ],
        correctIndex: 0,
        explain:
          "You cannot judge growth or risk until you can explain the business in plain English."
      },
      {
        kind: "true-false",
        id: "snapshot-q2",
        prompt:
          "A company that solves a real customer problem is usually easier to understand than one with a vague pitch.",
        correct: true,
        explain:
          "Clear customer pain and solutions make the business model easier to evaluate."
      },
      {
        kind: "fill-blank",
        id: "snapshot-q3",
        prompt:
          "Market size and leadership position help you judge whether the company has ___ and staying power.",
        options: ["hype only", "scale", "no customers", "zero products"],
        correctIndex: 1,
        explain:
          "Scale and leadership often bring brand, distribution, and trust advantages."
      }
    ]
  },
  revenue: {
    passThreshold: PASS,
    questions: [
      {
        kind: "odd-one-out",
        id: "revenue-q1",
        prompt:
          "Three of these are typical ways investors split revenue. Pick the odd one out.",
        choices: [
          "By product or service line",
          "By geographic region",
          "By customer type",
          "By moon phase"
        ],
        oddIndex: 3,
        explain:
          "Revenue mix is usually traced by what they sell, where they sell, and who pays."
      },
      {
        kind: "multiple-choice",
        id: "revenue-q2",
        prompt:
          "Why does relying on one product or region increase risk?",
        choices: [
          "It always guarantees higher profits",
          "A slowdown in that slice can hit the whole business",
          "It removes the need for customers",
          "It means the company has no competition"
        ],
        correctIndex: 1,
        explain:
          "Concentration means one weak line or market can drag down total results."
      },
      {
        kind: "true-false",
        id: "revenue-q3",
        prompt:
          "Knowing who pays (consumers vs businesses vs governments) helps judge how stable demand might be.",
        correct: true,
        explain:
          "Customer type shapes pricing power, cycles, and how predictable sales are."
      }
    ]
  },
  operations: {
    passThreshold: PASS,
    questions: [
      {
        kind: "order",
        id: "operations-q1",
        prompt:
          "Put a typical path from making a product to reaching a customer in order.",
        steps: [
          "Product is designed and built (often with partners)",
          "Supply chain and logistics move inventory",
          "Channels deliver to customers (stores, online, partners)",
          "Customer buys and may get service or updates"
        ],
        explain:
          "Operations is the chain that turns plans into products in buyers' hands."
      },
      {
        kind: "multiple-choice",
        id: "operations-q2",
        prompt:
          "Why do investors care about how products reach customers?",
        choices: [
          "Channels only affect logo design",
          "Distribution affects cost, speed, and competitive reach",
          "Customers never care how they buy",
          "Operations never touch margins"
        ],
        correctIndex: 1,
        explain:
          "Hard-to-reach or expensive distribution can cap growth and profits."
      },
      {
        kind: "true-false",
        id: "operations-q3",
        prompt:
          "Workforce and leadership quality can affect whether a company executes its strategy.",
        correct: true,
        explain:
          "Strong teams help a company ship, scale, and adapt when markets shift."
      }
    ]
  },
  advantage: {
    passThreshold: PASS,
    questions: [
      {
        kind: "multiple-choice",
        id: "advantage-q1",
        prompt:
          "What is R&D usually meant to support?",
        choices: [
          "Only short-term stock moves",
          "New products, features, or processes over time",
          "Eliminating all competition instantly",
          "Hiding financial statements"
        ],
        correctIndex: 1,
        explain:
          "R&D spending is about staying relevant and competitive in future markets."
      },
      {
        kind: "true-false",
        id: "advantage-q2",
        prompt:
          "Brand, patents, and ecosystem lock-in can make it harder for rivals to copy a business.",
        correct: true,
        explain:
          "Durable advantages protect pricing power and long-term returns."
      },
      {
        kind: "fill-blank",
        id: "advantage-q3",
        prompt:
          "If rivals can copy a product easily, the company may have a weaker ___ .",
        options: ["moat", "weather report", "logo font", "holiday"],
        correctIndex: 0,
        explain:
          "A moat is anything that makes the business hard to replicate."
      }
    ]
  },
  industry: {
    passThreshold: PASS,
    questions: [
      {
        kind: "multiple-choice",
        id: "industry-q1",
        prompt:
          "Why map main competitors before buying a stock?",
        choices: [
          "Competitors never affect pricing or growth",
          "Rivals shape pricing pressure and strategic moves",
          "Only one company can exist per industry",
          "Competition removes all regulation"
        ],
        correctIndex: 1,
        explain:
          "Competitive intensity affects margins and how hard it is to win share."
      },
      {
        kind: "true-false",
        id: "industry-q2",
        prompt:
          "A great company can still struggle if the whole industry is shrinking or over-regulated.",
        correct: true,
        explain:
          "Industry context is half the thesis — tailwinds and headwinds matter."
      },
      {
        kind: "red-flag",
        id: "industry-q3",
        prompt: "Which signal would be a warning sign about industry risk?",
        choices: [
          "Many rivals fighting on price",
          "Clear rules that everyone understands",
          "Stable demand with few substitutes",
          "Customers switching freely for fun"
        ],
        flagIndex: 0,
        explain:
          "Price wars and crowded markets often squeeze profits for everyone."
      }
    ]
  }
};
