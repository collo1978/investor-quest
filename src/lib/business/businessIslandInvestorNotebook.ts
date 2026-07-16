/**
 * Investor Checklist — mastery framework (not topic completion).
 * Green tick = learner can explain the main question confidently.
 */

export type InvestorNotebookQuestionId =
  | "explain-what-does"
  | "explain-value-prop"
  | "explain-products"
  | "explain-makes-money"
  | "explain-customers"
  | "explain-where-operates"
  | "explain-evolution"
  | "explain-future-growth"
  | "explain-competitive-advantage"
  | "explain-how-operates";

export type InvestorNotebookQuestionDef = {
  id: InvestorNotebookQuestionId;
  order: number;
  /** Emoji accent matching the framework cards. */
  icon: string;
  /**
   * Main mastery question — use `{company}` / `{companyPossessive}`.
   */
  questionTemplate: string;
  /**
   * Why investors care — always visible under the main question.
   * Supports `{company}` / `{companyPossessive}`.
   */
  whyInvestorsCare: string;
  /**
   * Optional Dig Deeper Investor Challenges (+XP).
   * Empty = mastery question alone (e.g. explain-what-does).
   */
  digDeeperTemplates: readonly string[];
};

export const INVESTOR_NOTEBOOK_QUESTIONS: readonly InvestorNotebookQuestionDef[] =
  [
    {
      id: "explain-what-does",
      order: 1,
      icon: "🏢",
      questionTemplate: "Can I explain what {company} does in my own words?",
      whyInvestorsCare:
        "If you can't explain the business simply, you probably shouldn't invest in it.",
      digDeeperTemplates: []
    },
    {
      id: "explain-value-prop",
      order: 2,
      icon: "❤️",
      questionTemplate: "Can I explain {companyPossessive} value proposition?",
      whyInvestorsCare:
        "Companies that solve important customer problems are more likely to build loyal customers and grow over time.",
      digDeeperTemplates: [
        "What customer pain points does {company} solve?",
        "Why do customers choose {company} over competitors?",
        "If {company} disappeared tomorrow, what impact would that have on its customers?",
        "How dependent are customers on {companyPossessive} products and services?",
        "Does {company} solve a genuine need or create demand?"
      ]
    },
    {
      id: "explain-products",
      order: 3,
      icon: "📦",
      questionTemplate:
        "Can I explain what products and services {company} sells?",
      whyInvestorsCare:
        "Understanding what the company sells helps you judge how diversified, innovative and resilient the business is.",
      digDeeperTemplates: [
        "What are {companyPossessive} core business segments?",
        "What are {companyPossessive} main products?",
        "Does {company} sell products, services or both?",
        "Which products are most important?",
        "How diversified is {companyPossessive} product portfolio?"
      ]
    },
    {
      id: "explain-makes-money",
      order: 4,
      icon: "💰",
      questionTemplate: "Can I explain how {company} makes money?",
      whyInvestorsCare:
        "Investors need to know where revenue comes from and whether those income streams are sustainable.",
      digDeeperTemplates: [
        "Where does {companyPossessive} revenue come from?",
        "Which business segments generate the most revenue?",
        "Is {companyPossessive} revenue diversified?",
        "Which markets contribute the most revenue?",
        "Is {companyPossessive} growth driven by existing products or new opportunities?"
      ]
    },
    {
      id: "explain-customers",
      order: 5,
      icon: "👥",
      questionTemplate: "Can I explain who {companyPossessive} customers are?",
      whyInvestorsCare:
        "Great businesses understand their customers. Knowing who pays the company helps you understand its risks and opportunities.",
      digDeeperTemplates: [
        "Who is {companyPossessive} core customer?",
        "Does {company} serve businesses, consumers or both?",
        "Does {company} serve multiple customer segments?",
        "Is {companyPossessive} customer base diversified or concentrated?",
        "How loyal are {companyPossessive} customers?"
      ]
    },
    {
      id: "explain-where-operates",
      order: 6,
      icon: "🌍",
      questionTemplate: "Can I explain where {company} operates?",
      whyInvestorsCare:
        "Different markets create different growth opportunities, competitive pressures and geopolitical risks.",
      digDeeperTemplates: [
        "Which countries does {company} operate in?",
        "Which industries does {company} serve?",
        "Which geographic regions are most important?",
        "Does {company} have opportunities to expand into new markets?"
      ]
    },
    {
      id: "explain-evolution",
      order: 7,
      icon: "🚀",
      questionTemplate: "Can I explain how {company} has evolved over time?",
      whyInvestorsCare:
        "Great businesses adapt. A strong history of innovation often indicates the ability to succeed in the future.",
      digDeeperTemplates: [
        "What were {companyPossessive} biggest turning points?",
        "Which innovations transformed the business?",
        "Which acquisitions changed {company}?",
        "How has {company} adapted to industry change?"
      ]
    },
    {
      id: "explain-future-growth",
      order: 8,
      icon: "📈",
      questionTemplate:
        "Can I explain where {companyPossessive} future growth will come from?",
      whyInvestorsCare:
        "Future growth is one of the biggest drivers of long-term shareholder returns.",
      digDeeperTemplates: [
        "Does {company} have a long growth runway?",
        "Which future markets offer the greatest opportunity?",
        "Is {company} growing faster than its industry?",
        "Is {companyPossessive} growth sustainable?",
        "Can {company} expand into new industries?"
      ]
    },
    {
      id: "explain-competitive-advantage",
      order: 9,
      icon: "🏆",
      questionTemplate:
        "Can I explain why {company} has a competitive advantage?",
      whyInvestorsCare:
        "Companies with durable competitive advantages can often earn higher profits and stay ahead of competitors for longer.",
      digDeeperTemplates: [
        "What is {companyPossessive} competitive advantage?",
        "What is the source of {companyPossessive} moat?",
        "Can competitors easily copy {company}?",
        "Does {company} have pricing power?",
        "Does {company} benefit from network effects?",
        "Does {company} have switching costs?",
        "How does {company} protect its competitive advantage?",
        "Does {company} have valuable patents or intellectual property?",
        "Could new technology weaken {companyPossessive} advantage?"
      ]
    },
    {
      id: "explain-how-operates",
      order: 10,
      icon: "⚙️",
      questionTemplate: "Can I explain how {company} operates its business?",
      whyInvestorsCare:
        "Understanding how the business operates helps reveal its efficiency, scalability and operational risks.",
      digDeeperTemplates: [
        "How does {company} manufacture its products?",
        "Does {company} own its manufacturing facilities?",
        "How dependent is {company} on suppliers?",
        "Is {companyPossessive} supply chain resilient?",
        "How scalable is {companyPossessive} business model?",
        "What are {companyPossessive} biggest operational risks?"
      ]
    }
  ] as const;

export function formatInvestorNotebookQuestion(
  template: string,
  companyName: string
): string {
  const possessive = `${companyName}'s`;
  return template
    .replaceAll("{companyPossessive}", possessive)
    .replaceAll("{company}", companyName);
}

export function digDeeperKey(
  questionId: InvestorNotebookQuestionId,
  index: number
): string {
  return `${questionId}:${index}`;
}

export const INVESTOR_NOTEBOOK_INTRO =
  "These are the 10 essential questions every investor should answer before investing in a business";
