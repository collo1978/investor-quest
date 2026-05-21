/**
 * Center-map final challenge — 12 questions (3 per pillar).
 * Mixed formats + difficulty bands (4 easy / 6 medium / 2 hard).
 * Pass threshold 70%; 90%+ surfaces “High Conviction Rookie” in the UI.
 */
import type { QuizConfig } from "@/data/quests/types";

export const TEN_K_ROOKIE_CHALLENGE_XP = 1000;

export const TEN_K_ROOKIE_FINAL_QUIZ: QuizConfig = {
  passThreshold: 0.7,
  questions: [
    // --- Business (3): easy + medium + medium ---
    {
      id: "tk-b-1",
      kind: "true-false",
      prompt:
        "Item 1 — Business in a 10-K is mostly the auditor’s opinion on whether the stock is fairly priced.",
      correct: false,
      explain:
        "Item 1 is management’s narrative: model, customers, products, and competition. Auditors weigh in elsewhere (financial statements + internal controls)."
    },
    {
      id: "tk-b-2",
      kind: "multiple-choice",
      prompt: "On a first pass of a new name, what should Item 1 help you answer fastest?",
      choices: [
        "Exact next-quarter EPS to two decimals",
        "What the company sells, to whom, and how it makes money",
        "Which insiders sold shares last Tuesday",
        "The auditor’s favorite footnote"
      ],
      correctIndex: 1,
      explain:
        "Item 1 is your map of the operating reality — revenue logic, customers, and why the offer wins before you dive into risks and financial statements."
    },
    {
      id: "tk-b-3",
      kind: "scenario",
      prompt:
        "Scenario: a rival launches a cheaper clone of the flagship product. What is the *first* Item 1 lens you use to judge how scary it is?",
      choices: [
        "Ignore it until the 10-Q mentions it",
        "Check switching costs, distribution, brand, and ecosystem lock-in described in the business model",
        "Assume price always wins",
        "Only read the risk factors section"
      ],
      correctIndex: 1,
      explain:
        "Item 1 should already hint at why customers stay — distribution, habit, ecosystem, service, or performance advantages that blunt pure price cuts."
    },

    // --- Forces (3): easy + medium + medium ---
    {
      id: "tk-f-1",
      kind: "red-flag",
      prompt: "Spot the red flag in a competitive story (pick the warning sign).",
      choices: [
        "Customers can leave in a weekend with no switching cost",
        "A diversified supplier base with multiple qualified vendors",
        "Recurring revenue with multi-year contracts",
        "Patents or trade secrets that are actively defended"
      ],
      flagIndex: 0,
      explain:
        "Low switching costs + commodity-like offers mean rivals can steal share quickly — pricing power is fragile."
    },
    {
      id: "tk-f-2",
      kind: "order",
      prompt: "Put these in the order a sharp investor usually stacks them.",
      steps: [
        "Name the players who capture value (customers, rivals, suppliers)",
        "Map switching costs and substitutes",
        "Translate forces into unit economics and cash flow risk",
        "Skim marketing slogans for fun"
      ],
      explain:
        "Forces → economics: who has leverage, how easy it is to switch, then what that implies for margins and reinvestment needs."
    },
    {
      id: "tk-f-3",
      kind: "multiple-choice",
      prompt: "Which force is *most* about the threat of new companies entering and copying the playbook?",
      choices: [
        "Bargaining power of buyers",
        "Threat of new entrants",
        "Intensity of rivalry among existing competitors",
        "Bargaining power of suppliers"
      ],
      correctIndex: 1,
      explain:
        "New entrants threaten when capital requirements are low, differentiation is weak, and scale advantages are easy to replicate."
    },

    // --- Financials (3): easy + medium + hard ---
    {
      id: "tk-fi-1",
      kind: "true-false",
      prompt:
        "A company can show growing revenue while free cash flow is negative because of heavy reinvestment or working capital swings.",
      correct: true,
      explain:
        "Revenue is not cash timing. Capex, inventory, receivables, and deal activity can all pull FCF below net income for stretches."
    },
    {
      id: "tk-fi-2",
      kind: "scenario",
      prompt:
        "Scenario: gross margin slips 1 point, but operating margin expands. What *most* deserves your next click in the filing?",
      choices: [
        "Assume the business is deteriorating and stop reading",
        "Trace whether opex leverage, mix shift, or one-time items explain the operating margin move",
        "Only celebrate revenue beat",
        "Ignore MD&A and read the cover page again"
      ],
      correctIndex: 1,
      explain:
        "Margins are a stack. Gross tells pricing/cost of goods; operating adds operating discipline — reconcile the bridge instead of reacting to one line."
    },
    {
      id: "tk-fi-3",
      kind: "bull-bear",
      prompt:
        "Investor read: leverage ticks up to fund buybacks while organic revenue is slowing. Net debt/EBITDA still looks comfortable.",
      correct: "bear",
      caption: "What matters more right now?",
      labels: { bull: "Mostly fine", bear: "Caution" },
      explain:
        "Comfortable leverage *today* can turn fast if EBITDA softens. Pair capital returns with the trajectory of the core business, not just static ratios."
    },

    // --- Management (3): easy + medium + hard ---
    {
      id: "tk-m-1",
      kind: "multiple-choice",
      prompt: "A DEF 14A proxy statement is primarily for…",
      choices: [
        "Quarterly product launch timelines",
        "Executive comp, board structure, and shareholder votes",
        "Detailed segment revenue tables",
        "Audited cash flow statement only"
      ],
      correctIndex: 1,
      explain:
        "Proxies are the governance cockpit — pay design, independence, related-party items, and what shareholders are being asked to approve."
    },
    {
      id: "tk-m-2",
      kind: "multiple-choice",
      prompt:
        "When reading a proxy incentive table, what should you verify first?",
      choices: [
        "Whether the CEO photo is recent",
        "How pay ties to metrics owners care about (TSR, EBITDA, FCF, etc.)",
        "The font size of the footnotes",
        "How many pages the filing has"
      ],
      correctIndex: 1,
      explain:
        "Incentives should line up with the long-term economics you care about as an owner — start with what triggers payout, not the formatting."
    },
    {
      id: "tk-m-3",
      kind: "scenario",
      prompt:
        "Founder-led company with dual-class shares: faster execution, but minority holders have limited votes on major decisions. What is the most *professional* way to carry that risk?",
      choices: [
        "Ignore votes entirely because the brand is iconic",
        "Price a governance discount and track visible capital discipline + alignment metrics",
        "Assume regulators will normalize the share structure next quarter",
        "Only watch headline revenue beats"
      ],
      correctIndex: 1,
      explain:
        "Dual-class can be fine or awful — the investor job is to tie economic outcomes to incentives you can observe (dilution, related-party deals, M&A discipline), not to pretend votes equal protection."
    }
  ]
};
