import type { QuestTemplate } from "@/data/quests/types";
import { MANAGEMENT_QUEST_QUIZZES } from "@/data/quests/managementQuestQuizzes";

const MGMT_QUIZ_PASS = 0.6 as const;

/**
 * Management pillar, five island sections. Each quest uses stacked gold
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
      "Who runs {Company.name}, and would you trust them with your money?",
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
          "Who are {Company.name}'s key executives, and what experience do they bring?",
        plainEnglishAnswer:
          "The proxy lists the CEO, CFO, and other top officers with short bios, where they worked and what they ran before.\n\nMatch that résumé to what the company needs now: turnaround, scale, or returning cash.\n\nA thin bench or musical chairs in the C-suite is a yellow flag even when titles sound impressive.",
        whyItMatters: "The people in charge set what actually gets done."
      },
      {
        id: "card-2",
        investorQuestion: "How long have {Company.name}'s executives been in role?",
        plainEnglishAnswer:
          "Proxy bios show how long leaders have been in the job, sometimes decades at the same company.\n\nLong runs can mean steady execution or a team that's gone stale.\n\nIf the CFO keeps changing with no clear story, dig deeper, that's louder than normal middle-manager turnover.",
        whyItMatters:
          "Stable leadership is comforting; mystery churn is not."
      },
      {
        id: "card-3",
        investorQuestion: "What has {Company.name}'s management delivered so far?",
        plainEnglishAnswer:
          "Skip the slogans, check revenue, margins, cash, product launches, and money returned to shareholders.\n\nThen compare those results to what leadership said they'd focus on two or three years ago.\n\nThe gap between talk and numbers is where thesis risk hides.",
        whyItMatters: "Promises are cheap; delivered numbers are not."
      }
    ],
    quizConfig: MANAGEMENT_QUEST_QUIZZES["mgmt-1"]
  },
  {
    slug: "mgmt-quiz",
    type: "snapshot",
    pillarId: "management",
    title: "Executive Compensation",
    objective:
      "See how leaders are paid, and whether incentives line up with long-term shareholder outcomes.",
    description:
      "Walk through ownership, pay vs. Performance, pay design, and the metrics that drive annual bonuses.",
    investorQuestion:
      "How does {Company.name}'s leadership get paid, and do they win when you win?",
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
        investorQuestion: "Do {Company.name}'s executives own meaningful stock?",
        plainEnglishAnswer:
          "Check Form 4 activity and the ownership table in the proxy: do executives hold material stock and buy on the open market, or mostly receive grants they sell routinely?\n\nMeaningful ownership aligns incentives; perpetual net-selling can be a red flag (not always, but it is worth asking why).",
        whyItMatters: "If they own shares, they win or lose with you."
      },
      {
        id: "card-2",
        investorQuestion: "How does pay at {Company.name} compare to performance?",
        plainEnglishAnswer:
          "Compare total pay (cash + equity) to TSR, operating income growth, and return metrics across a 3. 5 year window.\n\nPay rising while returns deteriorate is a classic governance tension: boards should tighten targets, reduce leverage to outcomes, or reset leadership.",
        whyItMatters: "Bad results + high pay = red flag."
      },
      {
        id: "card-3",
        investorQuestion: "How is executive pay structured at {Company.name}?",
        plainEnglishAnswer:
          "Most large-cap programs mix base salary, annual bonus, and long-term equity (RSUs/PSUs/options).\n\nLook for weighting toward long-term equity, holding periods, and performance vesting, structures that reward sustained compounding, not short-term spikes.",
        whyItMatters:
          "Good pay rewards long-term success, not quick wins."
      },
      {
        id: "card-4",
        investorQuestion: "What targets determine bonuses at {Company.name}?",
        plainEnglishAnswer:
          "CD&A usually lists the metrics for annual incentives (revenue, EPS, cash flow, ESG milestones, etc.) and how targets are set vs. Prior year.\n\nTargets reveal what the board wants management to optimise, sometimes that is growth at any cost; sometimes returns, cash conversion, or safety.",
        whyItMatters: "Shows what they actually care about."
      }
    ],
    quizConfig: MANAGEMENT_QUEST_QUIZZES["mgmt-quiz"]
  },
  {
    slug: "mgmt-2",
    type: "snapshot",
    pillarId: "management",
    title: "Capital Allocation",
    objective:
      "Trace how {Company.name} reinvests, returns cash, and finances itself.",
    description:
      "Decide whether cash is being deployed into durable advantages, or dissipated.",
    investorQuestion:
      "How does {Company.name} use its cash, smart moves or costly mistakes?",
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
        investorQuestion: "How does {Company.name} use its profits?",
        plainEnglishAnswer:
          "Follow operating cash flow: reinvestment (capex, R&D), acquisitions, debt paydown, dividends, and buybacks.\n\nHealthy companies usually fund reinvestment first, then return excess cash while keeping leverage sensible, the mix depends on maturity and opportunity set.",
        whyItMatters:
          "Smart spending grows your investment. Bad spending wastes it."
      },
      {
        id: "card-2",
        investorQuestion: "Is {Company.name} returning cash to shareholders?",
        plainEnglishAnswer:
          "Check dividends (growth, payout ratio) and buybacks (net of SBC dilution). Buybacks at high valuations can destroy value; buybacks when the business is cheap and fundamentals are sound can be attractive.\n\nThe key is whether returns are funded by durable cash generation, not one-time asset sales or leverage ramps.",
        whyItMatters:
          "Dividends/buybacks = sharing the profits with you."
      }
    ],
    quizConfig: MANAGEMENT_QUEST_QUIZZES["mgmt-2"]
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
      "Governance failures show up slowly, then suddenly, in restatements, write-downs, and broken trust.",
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
        investorQuestion: "Who sits on {Company.name}'s board, and are they independent?",
        plainEnglishAnswer:
          "The proxy lists directors, independence determinations, and any non-independent relationships.\n\nA majority-independent board is baseline for large caps; look for lead independent director structures when the chair is also CEO.",
        whyItMatters:
          "Independent boards help prevent management from acting against shareholder interests."
      },
      {
        id: "card-2",
        investorQuestion: "What committees oversee {Company.name}'s management?",
        plainEnglishAnswer:
          "Audit, compensation, and nominating/governance committees are the usual triad.\n\nStrong charters include financial literacy on audit, independent comp committee members, and refreshment practices on nominating.",
        whyItMatters:
          "Board committees ensure accountability in financial reporting and executive compensation."
      },
      {
        id: "card-3",
        investorQuestion:
          "Are there related-party deals or conflicts at {Company.name}?",
        plainEnglishAnswer:
          "Read 'Certain Relationships' and transaction footnotes: related-party deals, consulting arrangements, family ties, or cross-ownership can create conflicts.\n\nNot all related-party deals are bad, but they must be priced at arm's length and disclosed clearly.",
        whyItMatters:
          "Conflicts of interest can signal weak governance or misuse of company resources."
      },
      {
        id: "card-4",
        investorQuestion:
          "What happens if {Company.name}'s leaders leave or the company is sold?",
        plainEnglishAnswer:
          "Review employment agreements and change-in-control provisions: severance multiples, accelerated equity, and golden parachutes.\n\nLarge payouts can protect talent, or reward failure, depending on structure and performance tests.",
        whyItMatters:
          "Large severance packages can create misaligned incentives or governance concerns."
      }
    ],
    quizConfig: MANAGEMENT_QUEST_QUIZZES["mgmt-governance"]
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
      "Can {Company.name}'s balance sheet handle tough times?",
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
        investorQuestion: "How much debt does {Company.name} owe?",
        plainEnglishAnswer:
          "Review gross vs. Net debt, fixed vs. Floating exposure, and covenant summaries if disclosed.\n\nRising net debt into slowing earnings is a classic stress pattern, especially if maturities cluster in a short window.",
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
    quizConfig: MANAGEMENT_QUEST_QUIZZES["mgmt-financial-strength"]
  },
  {
    slug: "management-summary",
    type: "snapshot",
    pillarId: "management",
    title: "Management Summary",
    objective:
      "Synthesize leadership, incentives, capital discipline, and governance into one section quiz.",
    description:
      "Recap what you learned across the Management pillar before moving on.",
    investorQuestion:
      "Do you trust {Company.name}'s management team with your capital?",
    plainEnglishAnswer: null,
    whyItMatters:
      "Conviction comes from connecting people, incentives, capital, and oversight. Not from reading one section in isolation.",
    secSection: {
      form: "DEF 14A",
      section: "Corporate Governance",
      hint: "Synthesize themes from the proxy and 10-K MD&A."
    },
    aiTask:
      "Summarize {Company.name}'s management story in plain English: leadership, pay alignment, capital discipline, and governance.",
    artifactType: "note",
    rewardXp: 120,
    unlockRequirements: { pillar: "management", questSlugs: ["mgmt-1"] },
    completionState: { kind: "quiz", passPct: MGMT_QUIZ_PASS },
    difficulty: "core",
    visualStyle: "panel",
    estimatedTime: 10,
    tags: ["summary", "management"],
    displayOrder: 50,
    cards: [
      {
        id: "card-1",
        investorQuestion:
          "What is your one-sentence verdict on {Company.name}'s management?",
        plainEnglishAnswer:
          "Pull together the board bench, pay alignment, capital track record, and governance protections into a single yes/no/maybe with one reason.",
        whyItMatters: "Investing is ultimately a bet on people and incentives."
      }
    ],
    quizConfig: MANAGEMENT_QUEST_QUIZZES["management-summary"]
  }
] as const;