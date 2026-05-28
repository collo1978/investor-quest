import type { QuizConfig } from "@/data/quests/types";

/** Management pillar, leadership, pay, capital, governance for {Company.name}. */

const PASS = 0.6 as const;

export const MANAGEMENT_QUEST_QUIZZES: Record<
  "mgmt-1" | "mgmt-quiz" | "mgmt-2" | "mgmt-governance" | "mgmt-financial-strength" | "management-summary",
  QuizConfig
> = {
  "mgmt-1": {
    passThreshold: PASS,
    questions: [
      {
        kind: "multiple-choice",
        id: "mgmt1-q1",
        prompt:
          "For {Company.name}, where do investors usually start when judging who is running the company?",
        choices: [
          "The annual proxy (DEF 14A) for officers, pay, and governance",
          "Random social posts about the CEO",
          "Yesterday's stock chart",
          "Logo redesign history"
        ],
        correctIndex: 0,
        explain:
          "The proxy is the standard map for leadership at {Company.name}, tenure, pay, and board oversight."
      },
      {
        kind: "true-false",
        id: "mgmt1-q2",
        prompt:
          "For {Company.name}, a long-tenured CEO is context, not proof that shareholder risk is low.",
        correct: true,
        explain:
          "Pair tenure at {Company.name} with outcomes, board refresh, and whether incentives still fit the strategy."
      },
      {
        kind: "fill-blank",
        id: "mgmt1-q3",
        prompt:
          "The honest test of leadership at {Company.name} is whether strategy matches ___ outcomes over time.",
        options: ["headline", "actual", "viral", "rumor"],
        correctIndex: 1,
        explain:
          "Promises are cheap, delivery in revenue, margins, cash, and per-share value is what counts for {Company.name}."
      },
      {
        kind: "multiple-choice",
        id: "mgmt1-q4",
        prompt:
          "Why weigh pay design and operating results together for {Company.name}, not résumés alone?",
        choices: [
          "You need to connect leaders to delivery, not just storytelling",
          "Résumés fully predict future stock returns",
          "Pay never relates to performance",
          "Investors should ignore management entirely"
        ],
        correctIndex: 0,
        explain:
          "If you cannot link the team at {Company.name} to outcomes, you are guessing on execution risk."
      }
    ]
  },
  "mgmt-quiz": {
    passThreshold: PASS,
    questions: [
      {
        kind: "scenario",
        id: "mgmtq-q1",
        prompt:
          "At {Company.name}, EPS misses guidance but the CEO bonus still pays above target. What fits best?",
        choices: [
          "Targets may have been too easy or the board used too much discretion",
          "Bonuses never relate to performance",
          "EPS is irrelevant to every plan",
          "Investors should ignore pay entirely"
        ],
        correctIndex: 0,
        explain:
          "Pay at {Company.name} should tighten when results miss, repeated 'pay for miss' is a governance flag."
      },
      {
        kind: "red-flag",
        id: "mgmtq-q2",
        prompt:
          "Which pay pattern at {Company.name} should make you skeptical first?",
        choices: [
          "Total pay rising while returns to owners fade",
          "Heavy long-term equity with multi-year vesting",
          "Clawbacks tied to restatements",
          "Meaningful stock ownership guidelines"
        ],
        flagIndex: 0,
        explain:
          "Incentives at {Company.name} should track long-term value, persistent divergence deserves scrutiny."
      },
      {
        kind: "true-false",
        id: "mgmtq-q3",
        prompt:
          "For {Company.name}, performance-based stock can still reward management if metrics are easy to beat.",
        correct: true,
        explain:
          "Read the metrics behind pay at {Company.name}, labels matter less than difficulty and alignment."
      },
      {
        kind: "order",
        id: "mgmtq-q4",
        prompt:
          "Put these in the order a sharp investor usually reviews executive pay at {Company.name}.",
        steps: [
          "Read the summary pay table in the proxy",
          "Compare pay to multi-year operating performance",
          "Check ownership and selling patterns",
          "Study incentive metrics and target difficulty"
        ],
        explain:
          "Facts first, outcomes second, then whether skin in the game at {Company.name} matches the story."
      }
    ]
  },
  "mgmt-2": {
    passThreshold: PASS,
    questions: [
      {
        kind: "multiple-choice",
        id: "mgmt2-q1",
        prompt:
          "For {Company.name}, what usually signals disciplined capital allocation over time?",
        choices: [
          "Reinvest where returns are high; return excess cash when they are not",
          "Acquire rivals at any price for headlines",
          "Max leverage to fund dividends no matter what",
          "Cut all capex every year regardless of demand"
        ],
        correctIndex: 0,
        explain:
          "Great operators at {Company.name} fund the best projects, then hand back cash they cannot deploy well."
      },
      {
        kind: "odd-one-out",
        id: "mgmt2-q2",
        prompt:
          "Which is NOT a typical way {Company.name} returns cash to owners?",
        choices: ["Dividends", "Share buybacks", "Operating lease accounting", "Special dividends"],
        oddIndex: 2,
        explain:
          "Leases are structure, dividends and buybacks at {Company.name} are deliberate return tools."
      },
      {
        kind: "true-false",
        id: "mgmt2-q3",
        prompt:
          "For {Company.name}, stock-based compensation can eat into the benefit of share buybacks.",
        correct: true,
        explain:
          "If dilution is large at {Company.name}, net share count may barely move despite big repurchase headlines."
      },
      {
        kind: "multiple-choice",
        id: "mgmt2-q4",
        prompt:
          "Why compare buybacks at {Company.name} to free cash flow and valuation, not headlines alone?",
        choices: [
          "Repurchases only create value when funded sustainably at a sensible price",
          "Any buyback always doubles the stock",
          "Cash return replaces reading the business",
          "Dividends are the only legitimate return tool"
        ],
        correctIndex: 0,
        explain:
          "Capital return at {Company.name} is a judgment call, quality of cash and price paid matter."
      }
    ]
  },
  "mgmt-governance": {
    passThreshold: PASS,
    questions: [
      {
        kind: "multiple-choice",
        id: "mgmgov-q1",
        prompt:
          "For {Company.name}, which board committee usually owns financial reporting quality?",
        choices: [
          "Compensation committee",
          "Audit committee",
          "Nominating committee",
          "Brand committee"
        ],
        correctIndex: 1,
        explain:
          "The audit committee at {Company.name} oversees audits, controls, and reporting risk."
      },
      {
        kind: "bull-bear",
        id: "mgmgov-q2",
        prompt:
          "At {Company.name}, the CEO is also board chair with no lead independent director. Bull or bear for minority oversight?",
        correct: "bear",
        explain:
          "Combined roles can work, but at {Company.name} you want a strong independent counterweight when they are not split."
      },
      {
        kind: "swipe-cards",
        id: "mgmgov-q3",
        prompt: "For {Company.name}, swipe: healthy governance signal or warning sign?",
        cards: [
          { text: "Majority-independent board with annual evaluations", verdict: "good" },
          { text: "Opaque related-party deals with vague pricing", verdict: "warning" },
          { text: "Clawbacks tied to misconduct and restatements", verdict: "good" }
        ],
        explain:
          "Independence and accountability help {Company.name}, opaque conflicts hurt minority owners."
      },
      {
        kind: "true-false",
        id: "mgmgov-q4",
        prompt:
          "Related-party transactions at {Company.name} are always illegal.",
        correct: false,
        explain:
          "They happen often, the risk for {Company.name} is unfair pricing or weak disclosure, not existence alone."
      }
    ]
  },
  "mgmt-financial-strength": {
    passThreshold: PASS,
    questions: [
      {
        kind: "multiple-choice",
        id: "mgmtfs-q1",
        prompt:
          "For {Company.name}, which metric is a useful first-pass check on leverage?",
        choices: [
          "Net debt / EBITDA with maturity context",
          "Social media follower count",
          "Retail store count in one country",
          "Patent count alone"
        ],
        correctIndex: 0,
        explain:
          "Leverage at {Company.name} matters with maturity walls and cash conversion, not one ratio in isolation."
      },
      {
        kind: "risk-meter",
        id: "mgmtfs-q2",
        prompt:
          "For {Company.name}: rising net debt, flat earnings, large maturities in 18 months. Rate balance-sheet risk.",
        scaleMax: 5,
        correctLevel: 4,
        levelLabels: ["Very low", "Low", "Medium", "High", "Very high"],
        explain:
          "Clustered maturities plus rising leverage into weak earnings is usually elevated risk for {Company.name}."
      },
      {
        kind: "true-false",
        id: "mgmtfs-q3",
        prompt:
          "{Company.name} can show positive net income while still facing a liquidity squeeze.",
        correct: true,
        explain:
          "Earnings are not cash, working capital and capex can absorb liquidity quickly at {Company.name}."
      },
      {
        kind: "scenario",
        id: "mgmtfs-q4",
        prompt:
          "Revenue at {Company.name} drops 20% for two quarters. Which response signals financial strength?",
        choices: [
          "Protect liquidity and trim discretionary spend while guarding critical R&D",
          "Max leverage to keep every program unchanged",
          "Pause all public disclosures",
          "Launch large unrelated acquisitions"
        ],
        correctIndex: 0,
        explain:
          "Strength at {Company.name} is flexible costs, buffers, and sane financing, not denial."
      }
    ]
  },
  "management-summary": {
    passThreshold: PASS,
    questions: [
      {
        kind: "multiple-choice",
        id: "mgmtsum-q1",
        prompt:
          "For {Company.name}, which signal best supports trusting management with your capital?",
        choices: [
          "Incentives and capital discipline aligned with long-term owners",
          "Pay tied only to short-term stock pops",
          "A charismatic story with no disclosed metrics",
          "Unexplained CFO turnover with no explanation"
        ],
        correctIndex: 0,
        explain:
          "Alignment, governance, and delivery at {Company.name} beat storytelling alone."
      },
      {
        kind: "true-false",
        id: "mgmtsum-q2",
        prompt:
          "You can judge {Company.name}'s management without linking pay, governance, and multi-year results.",
        correct: false,
        explain:
          "For {Company.name}, leadership is a package, team, incentives, capital choices, and board oversight."
      },
      {
        kind: "multiple-choice",
        id: "mgmtsum-q3",
        prompt:
          "Why read the proxy for {Company.name} after you understand the business and financials?",
        choices: [
          "Management decides how strategy turns into cash returns and risk",
          "Proxies replace income statements",
          "Governance only matters for banks",
          "CEOs never influence capital allocation"
        ],
        correctIndex: 0,
        explain:
          "The team at {Company.name} connects operating reality to how owners are treated over time."
      }
    ]
  }
};