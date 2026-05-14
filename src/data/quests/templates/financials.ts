import type { QuestTemplate } from "@/data/quests/types";

/**
 * Financials pillar — 5 beginner-friendly sections covering "how the money
 * works" of {Company.name}. Mirrors the Business pillar's multi-card shape so
 * the same engine renders both:
 *
 *   growth              → How fast is the business growing?
 *   profitability       → Is the company profitable?
 *   expenses            → How efficiently is the company operating?
 *   cash                → Is the business generating real cash?
 *   financial-strength  → How strong is the company financially?
 *
 * Island hit targets (`FinancialsPageClient`) follow the artwork: left
 * column top→bottom Growth, Profitability, Expenses; right column Cash
 * (top) and Financial Strength (bottom).
 * Each quest's `plainEnglishAnswer` is `null` here. Company-specific answers
 * and quiz configs are layered on by `src/data/quests/content/<company>.ts`.
 *
 * All slugs are stable. Primary URL pattern: `/financials/<slug>` (see
 * `src/app/financials/[section]/page.tsx`). Legacy `/quest?...` still works.
 */
export const FINANCIALS_QUEST_TEMPLATES: readonly QuestTemplate[] = [
  {
    slug: "growth",
    type: "revenue",
    pillarId: "financials",
    title: "Growth",
    objective:
      "See how fast {Company.name} is growing — and where the growth is coming from.",
    description:
      "Trace {Company.name}'s revenue trajectory, the product mix behind it, and the geographic split that powers (or limits) further upside.",
    investorQuestion: "How fast is the business growing?",
    plainEnglishAnswer: null,
    whyItMatters:
      "Growth is the engine. The pace and source of revenue growth tells you whether the thesis is on track or quietly stalling.",
    secSection: {
      form: "10-K",
      section: "Item 7 — MD&A + Segment Footnotes",
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
    cards: [
      {
        id: "card-1",
        investorQuestion: "What is the 3-year revenue growth?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Revenue growth shows whether demand for the company's products or services is expanding."
      },
      {
        id: "card-2",
        investorQuestion: "What is the breakdown of revenue for their products?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Helps investors see where growth is really coming from and whether it is sustainable."
      },
      {
        id: "card-3",
        investorQuestion: "What is the breakdown of geographic revenue?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Helps investors see where growth is really coming from and whether it is sustainable."
      }
    ]
  },
  {
    slug: "profitability",
    type: "valuation",
    pillarId: "financials",
    title: "Profitability",
    objective:
      "Check whether {Company.name} actually turns revenue into profit — and whether that profit is growing per share.",
    description:
      "Look at the trend in {Company.name}'s margins and earnings per share to judge the quality of its profits.",
    investorQuestion: "Is the company profitable?",
    plainEnglishAnswer: null,
    whyItMatters:
      "Revenue alone doesn't pay shareholders. Margins and EPS show whether growth is actually creating value.",
    secSection: {
      form: "10-K",
      section: "Item 8 — Income Statement",
      hint: "Compare gross / operating margin and diluted EPS year over year."
    },
    aiTask:
      "Explain {Company.name}'s margin and EPS trend in plain English — direction, magnitude, and the biggest drivers.",
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
    cards: [
      {
        id: "card-1",
        investorQuestion: "Are profit margins improving or shrinking?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Margin expansion often signals pricing power or operating efficiency."
      },
      {
        id: "card-2",
        investorQuestion: "Is earnings per share growing?",
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
      "See whether {Company.name}'s spending is disciplined — and whether it is investing in the future.",
    description:
      "Walk through {Company.name}'s operating expense trend and the split between keep-the-lights-on spend vs. growth-focused investment.",
    investorQuestion: "How efficiently is the company operating?",
    plainEnglishAnswer: null,
    whyItMatters:
      "Two companies with the same revenue can be very different businesses depending on how their costs behave.",
    secSection: {
      form: "10-K",
      section: "Item 7 — MD&A (Operating Expenses)",
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
    cards: [
      {
        id: "card-1",
        investorQuestion: "How are operating expenses changing?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Rising expenses without revenue growth may signal inefficiency."
      },
      {
        id: "card-2",
        investorQuestion: "Is the company spending to grow the business?",
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
      "Confirm whether {Company.name} actually generates cash — and where that cash ends up.",
    description:
      "Trace {Company.name}'s operating cash flow trend and how management is choosing to deploy the resulting cash.",
    investorQuestion: "Is the business generating real cash?",
    plainEnglishAnswer: null,
    whyItMatters:
      "Cash flow is harder to manipulate than earnings. It is the most honest signal of whether the business is genuinely healthy.",
    secSection: {
      form: "10-K",
      section: "Item 8 — Cash Flow Statement",
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
    cards: [
      {
        id: "card-1",
        investorQuestion: "Is operating cash flow increasing?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Strong operating cash flow shows the business generates real cash from operations."
      },
      {
        id: "card-2",
        investorQuestion: "How is cash being used?",
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
    investorQuestion: "How strong is the company financially?",
    plainEnglishAnswer: null,
    whyItMatters:
      "A strong balance sheet lets a company survive bad years and act when opportunities appear. A weak one forces panic moves.",
    secSection: {
      form: "10-K",
      section: "Item 8 — Balance Sheet + Notes",
      hint: "Pair the balance sheet with footnotes on debt, leases, and commitments."
    },
    aiTask:
      "Explain {Company.name}'s balance sheet strength in plain English: cash vs. debt, plus the biggest other obligations to watch.",
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
    cards: [
      {
        id: "card-1",
        investorQuestion: "Does the company have more cash or debt?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Companies with strong balance sheets can survive downturns and invest in growth."
      },
      {
        id: "card-2",
        investorQuestion: "What financial obligations does the company have?",
        plainEnglishAnswer: null,
        whyItMatters:
          "Large obligations can limit flexibility and increase risk."
      }
    ]
  }
] as const;
