import type { QuestTemplate } from "@/data/quests/types";

const MGMT_QUIZ_PASS = 0.6 as const;

/**
 * Management pillar — five island sections. Each quest uses stacked gold
 * sub-cards (Mark as Read per card) plus a section quiz; the quiz panel
 * unlocks only after every sub-card is read (`QuestDetailScreen`). XP is
 * awarded only when the quiz is passed (`completionState.kind: "quiz"`).
 */
export const MANAGEMENT_QUEST_TEMPLATES: readonly QuestTemplate[] = [
  {
    slug: "mgmt-1",
    type: "snapshot",
    pillarId: "management",
    title: "Board & Leadership",
    objective:
      "Meet the people in charge and decide whether you would trust them with your capital.",
    description:
      "Read the leadership bench: who runs {Company.name}, how long they have been there, and what they have actually delivered.",
    investorQuestion:
      "Meet the people in charge and see if you'd trust them with your money.",
    plainEnglishAnswer: null,
    whyItMatters:
      "Leadership quality is a leading indicator of execution, culture, and how incentives will play out over time.",
    secSection: {
      form: "DEF 14A",
      section: "Executive Officers + Corporate Governance",
      hint: "Use the proxy for named executives, bios, and tenure tables."
    },
    aiTask:
      "Summarize {Company.name}'s named executive officers, tenure, and the last three years of major operating outcomes they oversaw.",
    artifactType: "note",
    rewardXp: 160,
    unlockRequirements: { pillar: "management" },
    completionState: { kind: "quiz", passPct: MGMT_QUIZ_PASS },
    difficulty: "core",
    visualStyle: "panel",
    estimatedTime: 14,
    tags: ["board", "leadership", "tenure"],
    cards: [
      {
        id: "card-1",
        investorQuestion:
          "Who are the key executives and what experience do they have?",
        plainEnglishAnswer:
          "Start with the DEF 14A: it lists the CEO, CFO, and other named executive officers with short bios — prior employers, scope of responsibility, and relevant industry experience.\n\nCompare that to what the business actually needs right now (turnaround vs. scale vs. capital returns). Experienced operators are not a guarantee — but thin benches and constant churn are yellow flags.",
        whyItMatters: "Experienced leaders = fewer mistakes."
      },
      {
        id: "card-2",
        investorQuestion: "How long have executives been with the company?",
        plainEnglishAnswer:
          "Proxy and 10-K bios usually show tenure in-role and sometimes total years at the company.\n\nLong tenure can mean deep institutional knowledge and steadier execution; rapid turnover in the CFO or COO seat can signal internal issues, strategy whiplash, or a board losing confidence.",
        whyItMatters:
          "Stability is good. Constant changes = warning sign."
      },
      {
        id: "card-3",
        investorQuestion: "What has management achieved so far?",
        plainEnglishAnswer:
          "Look for evidence, not slogans: revenue growth, margin trajectory, cash generation, market share, product cadence, and capital returned to owners.\n\nThen compare outcomes to what leadership said they would prioritise 2–3 years ago. The gap between narrative and delivery is where thesis risk hides.",
        whyItMatters: "Results matter more than promises."
      }
    ],
    quizConfig: {
      passThreshold: MGMT_QUIZ_PASS,
      questions: [
        {
          kind: "multiple-choice",
          id: "mgmt1-q1",
          prompt:
            "Which filing is usually the first place to find named executive officers, bios, and pay tables?",
          choices: ["8-K", "Form 4", "DEF 14A (Proxy)", "13F"],
          correctIndex: 2,
          explain:
            "The annual proxy (DEF 14A) is the standard home for executive leadership disclosure and compensation tables."
        },
        {
          kind: "true-false",
          id: "mgmt1-q2",
          prompt:
            "Long CEO tenure always means lower risk for shareholders.",
          correct: false,
          explain:
            "Tenure is context, not proof. Long tenure can be excellence — or entrenchment. Pair tenure with outcomes and incentives."
        },
        {
          kind: "fill-blank",
          id: "mgmt1-q3",
          prompt:
            "When judging leadership, the most useful test is whether stated strategy matches ___ outcomes.",
          options: ["random", "actual", "headline", "social"],
          correctIndex: 1,
          explain:
            "Execution is measured against real operating and financial outcomes — not vibes."
        },
        {
          kind: "confidence",
          id: "mgmt1-q4",
          prompt:
            "How confident are you that you could name the CEO/CFO and one concrete outcome they delivered in the last three years?",
          scaleMax: 5,
          scaleLabels: { low: "Not yet", high: "Very confident" },
          explain:
            "If you cannot connect leadership to outcomes, you are flying blind on execution risk."
        }
      ]
    }
  },
  {
    slug: "mgmt-quiz",
    type: "snapshot",
    pillarId: "management",
    title: "Executive Compensation",
    objective:
      "See how leaders are paid — and whether incentives line up with long-term shareholder outcomes.",
    description:
      "Walk through ownership, pay vs. performance, pay design, and the metrics that drive annual bonuses.",
    investorQuestion:
      "See how they get paid — and if they win when you win.",
    plainEnglishAnswer: null,
    whyItMatters:
      "Compensation is the board's loudest statement about what management should optimise for.",
    secSection: {
      form: "DEF 14A",
      section: "Compensation Discussion & Analysis (CD&A)",
      hint: "Use summary comp tables, grant footnotes, and performance metrics for annual incentives."
    },
    aiTask:
      "Explain {Company.name}'s pay philosophy: equity ownership, performance tests for cash bonuses, and any clawback or holding policies.",
    artifactType: "scorecard",
    rewardXp: 180,
    unlockRequirements: { pillar: "management", questSlugs: ["mgmt-1"] },
    completionState: { kind: "quiz", passPct: MGMT_QUIZ_PASS },
    difficulty: "core",
    visualStyle: "panel",
    estimatedTime: 16,
    tags: ["compensation", "proxy", "incentives"],
    cards: [
      {
        id: "card-1",
        investorQuestion: "Do executives own company stock?",
        plainEnglishAnswer:
          "Check Form 4 activity and the ownership table in the proxy: do executives hold material stock and buy on the open market, or mostly receive grants they sell routinely?\n\nMeaningful ownership aligns incentives; perpetual net-selling can be a red flag (not always — but it is worth asking why).",
        whyItMatters: "If they own shares, they win or lose with you."
      },
      {
        id: "card-2",
        investorQuestion: "How does executive pay compare to performance?",
        plainEnglishAnswer:
          "Compare total pay (cash + equity) to TSR, operating income growth, and return metrics across a 3–5 year window.\n\nPay rising while returns deteriorate is a classic governance tension: boards should tighten targets, reduce leverage to outcomes, or reset leadership.",
        whyItMatters: "Bad results + high pay = red flag."
      },
      {
        id: "card-3",
        investorQuestion: "How is executive pay structured?",
        plainEnglishAnswer:
          "Most large-cap programs mix base salary, annual bonus, and long-term equity (RSUs/PSUs/options).\n\nLook for weighting toward long-term equity, holding periods, and performance vesting — structures that reward sustained compounding, not short-term spikes.",
        whyItMatters:
          "Good pay rewards long-term success, not quick wins."
      },
      {
        id: "card-4",
        investorQuestion: "What performance targets determine bonuses?",
        plainEnglishAnswer:
          "CD&A usually lists the metrics for annual incentives (revenue, EPS, cash flow, ESG milestones, etc.) and how targets are set vs. prior year.\n\nTargets reveal what the board wants management to optimise — sometimes that is growth at any cost; sometimes returns, cash conversion, or safety.",
        whyItMatters: "Shows what they actually care about."
      }
    ],
    quizConfig: {
      passThreshold: MGMT_QUIZ_PASS,
      questions: [
        {
          kind: "scenario",
          id: "mgmtq-q1",
          prompt:
            "EPS misses guidance, but the CEO bonus still pays out above target. Which interpretation fits best?",
          choices: [
            "Targets were likely too easy or discretion favoured management",
            "This is always meaningless noise",
            "EPS never matters for incentives",
            "Bonuses are legally random"
          ],
          correctIndex: 0,
          explain:
            "Incentives should tighten when performance misses; repeated 'pay for miss' is a governance concern."
        },
        {
          kind: "red-flag",
          id: "mgmtq-q2",
          prompt: "Which pay pattern is most often a governance red flag?",
          choices: [
            "Heavy long-term equity with multi-year vesting",
            "Rising total pay while returns to shareholders deteriorate",
            "Clawback policies tied to restatements",
            "Meaningful stock ownership requirements"
          ],
          flagIndex: 1,
          explain:
            "Pay should track long-term value creation; persistent divergence deserves scrutiny."
        },
        {
          kind: "true-false",
          id: "mgmtq-q3",
          prompt:
            "Performance-based equity (PSUs) can still reward management if the chosen metrics are easy to beat.",
          correct: true,
          explain:
            "The quality of metrics matters as much as the label 'performance-based'."
        },
        {
          kind: "order",
          id: "mgmtq-q4",
          prompt:
            "Order these steps as an investor reviewing executive pay (first → last).",
          steps: [
            "Read the summary pay table",
            "Compare pay to 3–5 year performance",
            "Check equity ownership and sales patterns",
            "Read incentive metrics and target difficulty"
          ],
          explain:
            "Start with facts (tables), then outcomes, then incentives and mechanics."
        }
      ]
    }
  },
  {
    slug: "mgmt-2",
    type: "snapshot",
    pillarId: "management",
    title: "Capital Allocation",
    objective:
      "Trace how {Company.name} reinvests, returns cash, and finances itself.",
    description:
      "Decide whether cash is being deployed into durable advantages — or dissipated.",
    investorQuestion:
      "See how they use the company's money — smart moves or costly mistakes.",
    plainEnglishAnswer: null,
    whyItMatters:
      "Capital allocation is the CEO's main job after setting strategy; it directly drives per-share value.",
    secSection: {
      form: "10-K",
      section: "MD&A + Cash Flow Statement + Liquidity",
      hint: "Use cash flow statement, capex footnotes, and MD&A capital return discussion."
    },
    aiTask:
      "Summarise {Company.name}'s last three years: operating cash deployment, M&A, capex intensity, dividends, buybacks, and net debt trajectory.",
    artifactType: "memo",
    rewardXp: 200,
    unlockRequirements: { pillar: "management", questSlugs: ["mgmt-1"] },
    completionState: { kind: "quiz", passPct: MGMT_QUIZ_PASS },
    difficulty: "core",
    visualStyle: "panel",
    estimatedTime: 14,
    tags: ["capital-allocation", "buybacks", "dividends"],
    cards: [
      {
        id: "card-1",
        investorQuestion: "How does the company use its profits?",
        plainEnglishAnswer:
          "Follow operating cash flow: reinvestment (capex, R&D), acquisitions, debt paydown, dividends, and buybacks.\n\nHealthy companies usually fund reinvestment first, then return excess cash while keeping leverage sensible — the mix depends on maturity and opportunity set.",
        whyItMatters:
          "Smart spending grows your investment. Bad spending wastes it."
      },
      {
        id: "card-2",
        investorQuestion: "Is management returning cash to shareholders?",
        plainEnglishAnswer:
          "Check dividends (growth, payout ratio) and buybacks (net of SBC dilution). Buybacks at high valuations can destroy value; buybacks when the business is cheap and fundamentals are sound can be attractive.\n\nThe key is whether returns are funded by durable cash generation — not one-time asset sales or leverage ramps.",
        whyItMatters:
          "Dividends/buybacks = sharing the profits with you."
      }
    ],
    quizConfig: {
      passThreshold: MGMT_QUIZ_PASS,
      questions: [
        {
          kind: "multiple-choice",
          id: "mgmt2-q1",
          prompt:
            "Which combination best signals disciplined capital allocation over time?",
          choices: [
            "High ROIC reinvestment + returning excess cash",
            "Empire-building M&A at any price",
            "Leverage spikes to fund dividends",
            "Capex cuts every year regardless of demand"
          ],
          correctIndex: 0,
          explain:
            "Discipline is reinvest where returns are high, return cash when reinvestment opportunities shrink."
        },
        {
          kind: "odd-one-out",
          id: "mgmt2-q2",
          prompt: "Pick the odd one out — three are common cash-return tools.",
          choices: ["Dividends", "Buybacks", "Operating leases", "Special dividends"],
          oddIndex: 2,
          explain:
            "Operating leases are an operating structure, not a cash return mechanism like dividends/buybacks."
        },
        {
          kind: "true-false",
          id: "mgmt2-q3",
          prompt:
            "Stock-based compensation dilution can make buybacks partially self-defeating.",
          correct: true,
          explain:
            "If dilution eats a large share of repurchases, net share count may barely move."
        },
        {
          kind: "fill-blank",
          id: "mgmt2-q4",
          prompt:
            "When free cash flow is strong, the board's main allocation decision is reinvest vs. ___ cash.",
          options: ["hide", "return", "ignore", "inflate"],
          correctIndex: 1,
          explain:
            "Excess cash should be returned unless reinvestment offers better incremental returns."
        }
      ]
    }
  },
  {
    slug: "mgmt-governance",
    type: "snapshot",
    pillarId: "management",
    title: "Governance & Control",
    objective:
      "Assess whether independent oversight and controls protect minority shareholders.",
    description:
      "Review board structure, committees, related-party risk, and what happens in leadership transitions.",
    investorQuestion:
      "Check if anyone is keeping management in check and protecting investors.",
    plainEnglishAnswer: null,
    whyItMatters:
      "Governance failures show up slowly — then suddenly — in restatements, write-downs, and broken trust.",
    secSection: {
      form: "DEF 14A",
      section: "Corporate Governance + Certain Relationships",
      hint: "Proxy: independence standards, committee charters, related-party transactions."
    },
    aiTask:
      "Summarise {Company.name}'s board independence, committee oversight, related-party disclosures, and change-in-control / severance policies that could affect incentives.",
    artifactType: "note",
    rewardXp: 170,
    unlockRequirements: { pillar: "management", questSlugs: ["mgmt-1"] },
    completionState: { kind: "quiz", passPct: MGMT_QUIZ_PASS },
    difficulty: "core",
    visualStyle: "panel",
    estimatedTime: 16,
    tags: ["governance", "board", "controls"],
    cards: [
      {
        id: "card-1",
        investorQuestion: "Who sits on the board and are they independent?",
        plainEnglishAnswer:
          "The proxy lists directors, independence determinations, and any non-independent relationships.\n\nA majority-independent board is baseline for large caps; look for lead independent director structures when the chair is also CEO.",
        whyItMatters:
          "Independent boards help prevent management from acting against shareholder interests."
      },
      {
        id: "card-2",
        investorQuestion: "What committees oversee management decisions?",
        plainEnglishAnswer:
          "Audit, compensation, and nominating/governance committees are the usual triad.\n\nStrong charters include financial literacy on audit, independent comp committee members, and refreshment practices on nominating.",
        whyItMatters:
          "Board committees ensure accountability in financial reporting and executive compensation."
      },
      {
        id: "card-3",
        investorQuestion:
          "Are there related-party transactions or conflicts of interest?",
        plainEnglishAnswer:
          "Read 'Certain Relationships' and transaction footnotes: related-party deals, consulting arrangements, family ties, or cross-ownership can create conflicts.\n\nNot all related-party deals are bad — but they must be priced at arm's length and disclosed clearly.",
        whyItMatters:
          "Conflicts of interest can signal weak governance or misuse of company resources."
      },
      {
        id: "card-4",
        investorQuestion:
          "What happens if executives leave or the company is acquired?",
        plainEnglishAnswer:
          "Review employment agreements and change-in-control provisions: severance multiples, accelerated equity, and golden parachutes.\n\nLarge payouts can protect talent — or reward failure — depending on structure and performance tests.",
        whyItMatters:
          "Large severance packages can create misaligned incentives or governance concerns."
      }
    ],
    quizConfig: {
      passThreshold: MGMT_QUIZ_PASS,
      questions: [
        {
          kind: "multiple-choice",
          id: "mgmgov-q1",
          prompt:
            "Which committee is primarily responsible for overseeing financial reporting quality?",
          choices: [
            "Compensation committee",
            "Audit committee",
            "Nominating committee",
            "Technology committee"
          ],
          correctIndex: 1,
          explain:
            "The audit committee oversees audits, internal controls, and financial reporting risk."
        },
        {
          kind: "bull-bear",
          id: "mgmgov-q2",
          prompt:
            "A CEO is also board chair with no lead independent director. Bull or bear for governance quality?",
          correct: "bear",
          explain:
            "Combined chair/CEO roles can work — but absent a strong lead independent director, minority oversight can be weaker."
        },
        {
          kind: "swipe-cards",
          id: "mgmgov-q3",
          prompt: "Swipe each statement: good governance sign vs. warning sign.",
          cards: [
            {
              text: "Majority-independent board with annual evaluations",
              verdict: "good"
            },
            {
              text: "Opaque related-party transactions with vague pricing",
              verdict: "warning"
            },
            {
              text: "Clawback policy tied to misconduct and restatements",
              verdict: "good"
            }
          ],
          explain:
            "Independence + evaluation + clear accountability mechanisms are positives; opacity around conflicts is a warning."
        },
        {
          kind: "true-false",
          id: "mgmgov-q4",
          prompt:
            "Related-party transactions are always illegal for public companies.",
          correct: false,
          explain:
            "They are common but must be disclosed and fair; the risk is unfair pricing or poor oversight."
        }
      ]
    }
  },
  {
    slug: "mgmt-financial-strength",
    type: "snapshot",
    pillarId: "management",
    title: "Financial Strength",
    objective:
      "Decide whether {Company.name} can withstand stress without diluting you or breaking covenants.",
    description:
      "Stress-test liquidity, leverage, cash conversion, and refinancing risk.",
    investorQuestion:
      "Check if the company is financially strong and can handle tough times.",
    plainEnglishAnswer: null,
    whyItMatters:
      "Balance sheet resilience determines whether good strategy survives bad luck.",
    secSection: {
      form: "10-K",
      section: "Liquidity + Indebtedness + Risk Factors",
      hint: "Use MD&A liquidity, debt footnotes, and maturity schedule tables."
    },
    aiTask:
      "Summarise {Company.name}'s liquidity sources, net leverage trend, interest coverage, and major maturities over the next 24 months.",
    artifactType: "scorecard",
    rewardXp: 190,
    unlockRequirements: { pillar: "management", questSlugs: ["mgmt-1"] },
    completionState: { kind: "quiz", passPct: MGMT_QUIZ_PASS },
    difficulty: "core",
    visualStyle: "panel",
    estimatedTime: 15,
    tags: ["liquidity", "leverage", "resilience"],
    cards: [
      {
        id: "card-1",
        investorQuestion: "How much cash does the company have on hand?",
        plainEnglishAnswer:
          "Check cash and equivalents plus short-term investments, and compare to current liabilities and near-term capex plans.\n\nContext matters: some businesses run lean by design; others need buffers for cyclicality or working capital swings.",
        whyItMatters:
          "Cash on hand is the first line of defence in a shock."
      },
      {
        id: "card-2",
        investorQuestion: "How much debt does the company owe?",
        plainEnglishAnswer:
          "Review gross vs. net debt, fixed vs. floating exposure, and covenant summaries if disclosed.\n\nRising net debt into slowing earnings is a classic stress pattern — especially if maturities cluster in a short window.",
        whyItMatters: "Too much debt can force bad choices in a downturn."
      },
      {
        id: "card-3",
        investorQuestion: "Can the business fund itself from operations?",
        plainEnglishAnswer:
          "Look at free cash flow consistency, working capital intensity, and whether maintenance capex is well understood.\n\nIf the company relies on external financing for routine operations, stress scenarios bite faster.",
        whyItMatters:
          "Self-funding operations reduce dependence on lenders and markets."
      }
    ],
    quizConfig: {
      passThreshold: MGMT_QUIZ_PASS,
      questions: [
        {
          kind: "multiple-choice",
          id: "mgmtfs-q1",
          prompt:
            "Which metric is most useful as a first-pass solvency / leverage lens for most investors?",
          choices: [
            "Instagram followers",
            "Net debt / EBITDA (or gross debt / EBITDA)",
            "Store count only",
            "Patent count only"
          ],
          correctIndex: 1,
          explain:
            "Leverage multiples contextualise debt against earnings power — always pair with maturity walls and cash conversion."
        },
        {
          kind: "risk-meter",
          id: "mgmtfs-q2",
          prompt:
            "Rate the balance-sheet risk implied by: rising net debt, flat earnings, and a large maturity wall in 18 months.",
          scaleMax: 5,
          correctLevel: 4,
          levelLabels: ["Very low", "Low", "Medium", "High", "Very high"],
          explain:
            "Clustered maturities plus rising leverage into weak earnings is typically elevated risk."
        },
        {
          kind: "true-false",
          id: "mgmtfs-q3",
          prompt:
            "A company can show positive net income while still facing a liquidity crunch.",
          correct: true,
          explain:
            "Earnings are not cash; working capital and capex can absorb cash even when accounting income looks fine."
        },
        {
          kind: "scenario",
          id: "mgmtfs-q4",
          prompt:
            "Revenue drops 20% for two quarters. Which response best indicates financial strength?",
          choices: [
            "Cut discretionary costs and preserve liquidity while protecting critical R&D",
            "Max leverage to maintain a dividend at any cost",
            "Pause all disclosures",
            "Double acquisitions to distract investors"
          ],
          correctIndex: 0,
          explain:
            "Strength shows up in flexible cost structure, liquidity buffers, and disciplined financing choices."
        }
      ]
    }
  }
] as const;
