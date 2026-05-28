/**
 * Center-map final challenge — 12 questions (3 per pillar).
 * ~75% company-specific ({Company.name}); ~25% filing / investor lenses.
 * Tokens filled in FinalChallengeClient via fillQuizConfigTokens.
 */
import type { QuizConfig } from "@/data/quests/types";

export const TEN_K_ROOKIE_CHALLENGE_XP = 1000;

export const TEN_K_ROOKIE_FINAL_QUIZ: QuizConfig = {
  passThreshold: 0.7,
  questions: [
    // --- Business (3) ---
    {
      id: "tk-b-1",
      kind: "multiple-choice",
      prompt:
        "For {Company.name}, what should Item 1 in the 10-K help you explain first?",
      choices: [
        "What it sells, to whom, and how it makes money",
        "Exact next-quarter EPS to two decimals",
        "Only insider sales last Tuesday",
        "Footnote font choices"
      ],
      correctIndex: 0,
      explain:
        "Item 1 is {Company.name}'s operating map — model before risks and numbers."
    },
    {
      id: "tk-b-2",
      kind: "scenario",
      prompt:
        "A rival launches a cheaper clone of {Company.name}'s flagship offer. What is the first Item 1 lens?",
      choices: [
        "Switching costs, distribution, brand, and ecosystem in the business model",
        "Ignore until the 10-Q mentions it",
        "Assume price always wins forever",
        "Skip Item 1 and only read risk factors"
      ],
      correctIndex: 0,
      explain:
        "Item 1 for {Company.name} should already hint at why customers stay beyond price alone."
    },
    {
      id: "tk-b-3",
      kind: "true-false",
      prompt:
        "Item 1 describes {Company.name}'s business — not whether the auditor thinks the stock is fairly priced.",
      correct: true,
      explain:
        "Auditors weigh in on financial statements elsewhere; Item 1 is management's story of the model."
    },

    // --- Forces (3) ---
    {
      id: "tk-f-1",
      kind: "red-flag",
      prompt:
        "Which competitive story should worry you most about {Company.name}?",
      choices: [
        "Customers can leave quickly with almost no switching cost",
        "A diversified supplier base with multiple qualified vendors",
        "Recurring revenue with multi-year contracts",
        "Defensible patents actively enforced"
      ],
      flagIndex: 0,
      explain:
        "Low switching costs at {Company.name} mean rivals can steal share fast — pricing power stays fragile."
    },
    {
      id: "tk-f-2",
      kind: "scenario",
      prompt:
        "Regulators tighten rules on {Company.name}'s platform fees. What is the realistic investor concern?",
      choices: [
        "High-margin platform economics could compress without a product miss",
        "Regulation never affects large companies",
        "Revenue must triple automatically",
        "R&D becomes illegal"
      ],
      correctIndex: 0,
      explain:
        "External rules can change take-rates and economics at {Company.name} even when execution is solid."
    },
    {
      id: "tk-f-3",
      kind: "multiple-choice",
      prompt:
        "For {Company.name}, why separate product rivals from regulators?",
      choices: [
        "Rivals fight for demand; regulation can change the rules of the game",
        "They are the same risk bucket",
        "Only product quality matters",
        "Macro never affects global companies"
      ],
      correctIndex: 0,
      explain:
        "Competition and regulation hit {Company.name} through different channels — model them separately."
    },

    // --- Financials (3) ---
    {
      id: "tk-fi-1",
      kind: "true-false",
      prompt:
        "{Company.name} can grow revenue while free cash flow is negative for a stretch.",
      correct: true,
      explain:
        "Revenue is not cash timing — capex, inventory, and working capital can absorb cash at {Company.name}."
    },
    {
      id: "tk-fi-2",
      kind: "scenario",
      prompt:
        "Gross margin at {Company.name} slips 1 point but operating margin expands. What deserves your next click?",
      choices: [
        "Trace whether opex leverage, mix shift, or one-times explain operating margin",
        "Assume the business is failing and stop",
        "Only celebrate a revenue beat",
        "Skip MD&A entirely"
      ],
      correctIndex: 0,
      explain:
        "Margins are a stack for {Company.name} — reconcile gross vs. operating moves instead of one line."
    },
    {
      id: "tk-fi-3",
      kind: "bull-bear",
      prompt:
        "{Company.name} adds leverage to fund buybacks while organic revenue slows. Net debt/EBITDA still looks fine today.",
      correct: "bear",
      caption: "What matters more right now?",
      labels: { bull: "Mostly fine", bear: "Caution" },
      explain:
        "Comfortable leverage at {Company.name} can turn fast if EBITDA softens — pair returns with core business trajectory."
    },

    // --- Management (3) ---
    {
      id: "tk-m-1",
      kind: "multiple-choice",
      prompt:
        "For {Company.name}, a DEF 14A proxy is primarily for…",
      choices: [
        "Executive pay, board structure, and shareholder votes",
        "Quarterly product launch timelines only",
        "Segment revenue tables only",
        "Audited cash flow statement only"
      ],
      correctIndex: 0,
      explain:
        "The proxy is the governance cockpit for {Company.name} — pay, independence, and owner votes."
    },
    {
      id: "tk-m-2",
      kind: "scenario",
      prompt:
        "At {Company.name}, EPS misses guidance but the CEO bonus still pays above target. What fits best?",
      choices: [
        "Targets may have been too easy or the board used too much discretion",
        "Bonuses never relate to performance",
        "EPS is irrelevant to every plan",
        "Ignore pay entirely"
      ],
      correctIndex: 0,
      explain:
        "Pay at {Company.name} should tighten when results miss — repeated 'pay for miss' is a governance concern."
    },
    {
      id: "tk-m-3",
      kind: "multiple-choice",
      prompt:
        "Why read incentives at {Company.name} after you understand the business and financials?",
      choices: [
        "Management connects strategy to cash returns and risk",
        "Proxies replace income statements",
        "Governance only matters for banks",
        "CEOs never influence capital allocation"
      ],
      correctIndex: 0,
      explain:
        "The team at {Company.name} decides how operating reality turns into owner outcomes over time."
    }
  ]
};
