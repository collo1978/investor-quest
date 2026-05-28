import type { QuestTemplate } from "@/data/quests/types";
import { FINANCIALS_QUEST_QUIZZES } from "@/data/quests/financialsQuestQuizzes";

/**
 * Financials pillar. `{Company.name}` on card questions; filled at instantiate.
 */
export const FINANCIALS_QUEST_TEMPLATES: readonly QuestTemplate[] = [
  {
    slug: "growth",
    type: "revenue",
    pillarId: "financials",
    title: "Growth",
    objective:
      "See how fast {Company.name} is growing, and where the growth is coming from.",
    description:
      "Trace {Company.name}'s revenue trajectory, the product mix behind it, and the geographic split that powers (or limits) further upside.",
    investorQuestion: "How fast is {Company.name} growing?",
    plainEnglishAnswer: null,
    whyItMatters:
      "Growth is the engine. The pace and source of revenue growth tells you whether the thesis is on track or quietly stalling.",
    secSection: {
      form: "10-K",
      section: "Item 7. MD&A + Segment Footnotes",
      hint: "Combine MD&A growth commentary with the segment / geographic revenue tables."
    },
    aiTask:
      "Summarize {Company.name}'s revenue growth over the last 3 years in plain English: total growth rate, product-mix split, and geographic split.",
    artifactType: "scorecard",
    rewardXp: 140,
    unlockRequirements: { pillar: "financials" },
    completionState: { kind: "quiz", passPct: 0.66 },
    difficulty: "intro",
    visualStyle: "card",
    estimatedTime: 4,
    tags: ["revenue", "growth", "geography"],
    quizConfig: FINANCIALS_QUEST_QUIZZES.growth,
    cards: [
      {
        id: "card-1",
        investorQuestion: "What is {Company.name}'s 3-year revenue growth?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Revenue growth shows whether demand for {Company.name}'s offer is expanding."
      },
      {
        id: "card-2",
        investorQuestion: "How is {Company.name}'s revenue split by product?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Helps you see where growth is really coming from and whether it is sustainable."
      },
      {
        id: "card-3",
        investorQuestion: "How is {Company.name}'s revenue split by geography?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Geographic mix shows where {Company.name} wins, and where it may be exposed."
      }
    ]
  },
  {
    slug: "profitability",
    type: "valuation",
    pillarId: "financials",
    title: "Profitability",
    objective:
      "Check whether {Company.name} actually turns revenue into profit, and whether that profit is growing per share.",
    description:
      "Look at the trend in {Company.name}'s margins and earnings per share to judge the quality of its profits.",
    investorQuestion: "Is {Company.name} profitable?",
    plainEnglishAnswer: null,
    whyItMatters:
      "Revenue alone doesn't pay shareholders. Margins and EPS show whether growth is actually creating value.",
    secSection: {
      form: "10-K",
      section: "Item 8. Income Statement",
      hint: "Compare gross / operating margin and diluted EPS year over year."
    },
    aiTask:
      "Explain {Company.name}'s margin and EPS trend in plain English, direction, magnitude, and the biggest drivers.",
    artifactType: "scorecard",
    rewardXp: 160,
    unlockRequirements: {
      pillar: "financials",
      questSlugs: ["growth"]
    },
    completionState: { kind: "quiz", passPct: 0.66 },
    difficulty: "core",
    visualStyle: "panel",
    estimatedTime: 4,
    tags: ["margins", "eps", "profitability"],
    quizConfig: FINANCIALS_QUEST_QUIZZES.profitability,
    cards: [
      {
        id: "card-1",
        investorQuestion: "Are {Company.name}'s profit margins improving or shrinking?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Margin expansion often signals pricing power or operating efficiency."
      },
      {
        id: "card-2",
        investorQuestion: "Is {Company.name}'s earnings per share growing?",
        plainEnglishAnswer: null,
        whyItMatters:
          "EPS growth reflects how much profit belongs to each shareholder."
      }
    ]
  },
  {
    slug: "expenses",
    type: "risk",
    pillarId: "financials",
    title: "Expenses",
    objective:
      "See whether {Company.name}'s spending is disciplined, and whether it is investing in the future.",
    description:
      "Walk through {Company.name}'s operating expense trend and the split between keep-the-lights-on spend vs. Growth-focused investment.",
    investorQuestion: "How efficiently is {Company.name} operating?",
    plainEnglishAnswer: null,
    whyItMatters:
      "Two companies with the same revenue can be very different businesses depending on how their costs behave.",
    secSection: {
      form: "10-K",
      section: "Item 7. MD&A (Operating Expenses)",
      hint: "Pair MD&A commentary with the operating expense lines on the income statement."
    },
    aiTask:
      "Explain {Company.name}'s operating expense trend in plain English, plus how much of it is investment in future growth (R&D, capex).",
    artifactType: "scorecard",
    rewardXp: 160,
    unlockRequirements: {
      pillar: "financials",
      questSlugs: ["profitability"]
    },
    completionState: { kind: "quiz", passPct: 0.66 },
    difficulty: "core",
    visualStyle: "panel",
    estimatedTime: 4,
    tags: ["expenses", "opex", "rd", "capex"],
    quizConfig: FINANCIALS_QUEST_QUIZZES.expenses,
    cards: [
      {
        id: "card-1",
        investorQuestion: "How are {Company.name}'s operating expenses changing?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Rising expenses without revenue growth may signal inefficiency."
      },
      {
        id: "card-2",
        investorQuestion: "Is {Company.name} spending to grow the business?",
        plainEnglishAnswer: null,
        whyItMatters: "Strategic investment today can drive future growth."
      }
    ]
  },
  {
    slug: "cash",
    type: "valuation",
    pillarId: "financials",
    title: "Cash",
    objective:
      "Confirm whether {Company.name} actually generates cash, and where that cash ends up.",
    description:
      "Trace {Company.name}'s operating cash flow trend and how management is choosing to deploy the resulting cash.",
    investorQuestion: "Is {Company.name} generating real cash?",
    plainEnglishAnswer: null,
    whyItMatters:
      "Cash flow is harder to manipulate than earnings. It is the most honest signal of whether the business is genuinely healthy.",
    secSection: {
      form: "10-K",
      section: "Item 8. Cash Flow Statement",
      hint: "Combine operating cash flow with financing activities to see how cash is deployed."
    },
    aiTask:
      "Explain {Company.name}'s operating cash flow trend in plain English, and where the cash is going (buybacks, dividends, reinvestment, M&A).",
    artifactType: "scorecard",
    rewardXp: 180,
    unlockRequirements: {
      pillar: "financials",
      questSlugs: ["expenses"]
    },
    completionState: { kind: "quiz", passPct: 0.66 },
    difficulty: "core",
    visualStyle: "panel",
    estimatedTime: 4,
    tags: ["cash-flow", "fcf", "capital-allocation"],
    quizConfig: FINANCIALS_QUEST_QUIZZES.cash,
    cards: [
      {
        id: "card-1",
        investorQuestion: "Is {Company.name}'s operating cash flow increasing?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Strong operating cash flow shows the business generates real cash from operations."
      },
      {
        id: "card-2",
        investorQuestion: "How is {Company.name} using its cash?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Shows whether cash is reinvested into growth or returned to shareholders."
      }
    ]
  },
  {
    slug: "financial-strength",
    type: "risk",
    pillarId: "financials",
    title: "Financial Strength",
    objective:
      "Decide whether {Company.name}'s balance sheet is a fortress or a flag.",
    description:
      "Compare {Company.name}'s cash and investments against its debt and other financial obligations.",
    investorQuestion: "How strong is {Company.name} financially?",
    plainEnglishAnswer: null,
    whyItMatters:
      "A strong balance sheet lets a company survive bad years and act when opportunities appear. A weak one forces panic moves.",
    secSection: {
      form: "10-K",
      section: "Item 8. Balance Sheet + Notes",
      hint: "Pair the balance sheet with footnotes on debt, leases, and commitments."
    },
    aiTask:
      "Explain {Company.name}'s balance sheet strength in plain English: cash vs. Debt, plus the biggest other obligations to watch.",
    artifactType: "scorecard",
    rewardXp: 200,
    unlockRequirements: {
      pillar: "financials",
      questSlugs: ["cash"]
    },
    completionState: { kind: "quiz", passPct: 0.66 },
    difficulty: "deep",
    visualStyle: "panel",
    estimatedTime: 5,
    tags: ["balance-sheet", "debt", "liquidity"],
    quizConfig: FINANCIALS_QUEST_QUIZZES["financial-strength"],
    cards: [
      {
        id: "card-1",
        investorQuestion: "Does {Company.name} have more cash or debt?",
        plainEnglishAnswer: null,
        whyItMatters:
          "A strong balance sheet helps {Company.name} survive downturns and invest in growth."
      },
      {
        id: "card-2",
        investorQuestion: "What are {Company.name}'s biggest financial obligations?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Large obligations can limit flexibility and increase risk."
      }
    ]
  }
] as const;