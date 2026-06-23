import type { QuizConfig } from "@/data/quests/types";

/** Financials pillar, company-first prompts; tokens filled at instantiate. */

const PASS = 0.66 as const;

export const FINANCIALS_QUEST_QUIZZES: Record<
  "growth" | "profitability" | "expenses" | "cash" | "financial-strength",
  QuizConfig
> = {
  growth: {
    passThreshold: PASS,
    questions: [
      {
        kind: "multiple-choice",
        id: "fin-growth-q1",
        prompt:
          "For {Company.name}, what should you verify before trusting a revenue growth story?",
        choices: [
          "Whether growth is broad, sustainable, and backed by the right mix",
          "Whether the stock went up last month",
          "How many analysts raised targets",
          "Whether the CEO was on a podcast"
        ],
        correctIndex: 0,
        explain:
          "At {Company.name}, growth quality beats a single headline, check product, region, and profit follow-through."
      },
      {
        kind: "true-false",
        id: "fin-growth-q2",
        prompt:
          "For {Company.name}, heavy reliance on one product or region can hide risk until that slice slows.",
        correct: true,
        explain:
          "Concentration at {Company.name} is fine until the engine that drives most sales hiccups."
      },
      {
        kind: "fill-blank",
        id: "fin-growth-q3",
        prompt:
          "Before reacting to {Company.name}'s share price, revenue ___ matters more than the daily chart.",
        options: ["mix", "noise", "colour", "headlines"],
        correctIndex: 0,
        explain:
          "Revenue logic on {Company.name} comes before valuation — otherwise you are guessing."
      }
    ]
  },
  profitability: {
    passThreshold: PASS,
    questions: [
      {
        kind: "multiple-choice",
        id: "fin-profit-q1",
        prompt:
          "For {Company.name}, why do investors compare gross and operating margins, not just revenue?",
        choices: [
          "Margins show how much of each dollar the business keeps after costs",
          "Revenue alone guarantees cash tomorrow",
          "Margins matter only for accountants",
          "Higher sales always mean higher profit per share"
        ],
        correctIndex: 0,
        explain:
          "Profitability at {Company.name} is about quality of earnings, what sticks after the cost stack."
      },
      {
        kind: "true-false",
        id: "fin-profit-q2",
        prompt:
          "At {Company.name}, earnings per share can rise even when net income is flat if the share count shrinks.",
        correct: true,
        explain:
          "Always ask whether EPS growth at {Company.name} is operating strength or financial engineering."
      },
      {
        kind: "fill-blank",
        id: "fin-profit-q3",
        prompt:
          "When a higher-margin line grows faster at {Company.name}, company-wide gross margin often ___ .",
        options: ["collapses", "drifts up", "disappears", "becomes irrelevant"],
        correctIndex: 1,
        explain:
          "Mix shift toward better economics is a quiet driver of margin expansion at {Company.name}."
      }
    ]
  },
  expenses: {
    passThreshold: PASS,
    questions: [
      {
        kind: "scenario",
        id: "fin-expense-q1",
        prompt:
          "R&D at {Company.name} rises faster than revenue for two years. What is the smartest first question?",
        choices: [
          "Is the spend tied to named bets (products, capacity) or vague overhead creep?",
          "Ignore it, innovation always pays off instantly",
          "Assume the stock must double",
          "Demand zero R&D forever"
        ],
        correctIndex: 0,
        explain:
          "At {Company.name}, higher R&D can be investment or bloat, tie dollars to strategy you can point to."
      },
      {
        kind: "multiple-choice",
        id: "fin-expense-q2",
        prompt:
          "For {Company.name}, which bucket is usually about building tomorrow's products?",
        choices: [
          "Research & development",
          "Audit fees only",
          "Logo redesign",
          "Routine dividend payments"
        ],
        correctIndex: 0,
        explain:
          "R&D at {Company.name} is forward-looking; SG&A runs today; capex builds physical capacity."
      },
      {
        kind: "true-false",
        id: "fin-expense-q3",
        prompt:
          "Operating expenses at {Company.name} can grow with revenue and still be healthy if margins hold.",
        correct: true,
        explain:
          "Scale businesses grow opex with volume, the test for {Company.name} is margin and return on spend."
      }
    ]
  },
  cash: {
    passThreshold: PASS,
    questions: [
      {
        kind: "multiple-choice",
        id: "fin-cash-q1",
        prompt:
          "For {Company.name}, why do investors weigh operating cash flow alongside reported profit?",
        choices: [
          "Cash shows what the business actually collected and can deploy",
          "Cash flow always equals the stock price",
          "Only banks report cash",
          "Cash ignores working capital entirely"
        ],
        correctIndex: 0,
        explain:
          "At {Company.name}, earnings can look fine while cash is tight, timing of receivables, inventory, and capex matters."
      },
      {
        kind: "odd-one-out",
        id: "fin-cash-q2",
        prompt:
          "Three are typical ways {Company.name} might use cash. Pick the odd one out.",
        choices: [
          "Share buybacks",
          "Dividends and reinvestment in the core",
          "R&D and capex for the franchise",
          "Unrelated side bets with no strategic link"
        ],
        oddIndex: 3,
        explain:
          "Capital allocation at {Company.name} should map to the business, not random ventures off thesis."
      },
      {
        kind: "scenario",
        id: "fin-cash-q3",
        prompt:
          "Operating cash at {Company.name} trails net income for two quarters. What deserves your next click?",
        choices: [
          "Trace receivables, inventory, and capex timing before trusting the headline profit",
          "Assume fraud and stop researching",
          "Ignore cash — only EPS matters",
          "Buy more shares immediately"
        ],
        correctIndex: 0,
        explain:
          "For {Company.name}, cash tells you whether reported earnings convert into fuel for growth or returns."
      }
    ]
  },
  "financial-strength": {
    passThreshold: PASS,
    questions: [
      {
        kind: "multiple-choice",
        id: "fin-strength-q1",
        prompt:
          "For {Company.name}, what is a practical first-pass read on balance-sheet risk?",
        choices: [
          "Net debt vs. Earnings power and when debt matures",
          "Number of patents filed",
          "CEO tenure alone",
          "Store count in one country"
        ],
        correctIndex: 0,
        explain:
          "Leverage at {Company.name} only hurts when earnings cannot support it or maturities cluster badly."
      },
      {
        kind: "true-false",
        id: "fin-strength-q2",
        prompt:
          "{Company.name} can report profit while still facing a near-term liquidity squeeze.",
        correct: true,
        explain:
          "Profit is not cash, working capital and capex can drain liquidity at {Company.name} even with positive net income."
      },
      {
        kind: "scenario",
        id: "fin-strength-q3",
        prompt:
          "Revenue at {Company.name} drops 20% for two quarters. Which response best signals balance-sheet strength?",
        choices: [
          "Protect liquidity and cut discretionary spend while guarding critical investment",
          "Borrow aggressively to keep every cosmetic program",
          "Stop filing financial statements",
          "Double unrelated acquisitions"
        ],
        correctIndex: 0,
        explain:
          "Strength at {Company.name} shows up in buffers, flexible costs, and sane financing, not denial."
      }
    ]
  }
};