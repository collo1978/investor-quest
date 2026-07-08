import type { QuizConfig } from "@/data/quests/types";
import type { BusinessChecklistSectionId } from "@/lib/business/businessInvestorFramework";

const PASS = 0.66 as const;

/** Five-question section checkpoint — one per principle + combo + section synthesis. */
export const BUSINESS_CHECKLIST_SECTION_QUIZZES: Record<
  BusinessChecklistSectionId,
  QuizConfig
> = {
  "company-overview": {
    passThreshold: PASS,
    questions: [
      {
        kind: "multiple-choice",
        id: "co-q1-purpose",
        prompt: "Which description best captures {Company.name}'s core business today?",
        choices: [
          "Operates cloud email and file storage for everyday consumers",
          "Designs chips and software that accelerate AI, gaming, and heavy computing",
          "Builds general-purpose laptop CPUs sold mainly through retail stores",
          "Licenses its brand on third-party gadgets without creating technology"
        ],
        correctIndex: 1,
        explain:
          "NVIDIA's edge is accelerated computing — chips plus software for demanding workloads, not generic PCs or consumer cloud apps."
      },
      {
        kind: "multiple-choice",
        id: "co-q2-evolution",
        prompt: "What best explains how {Company.name} became central to modern AI?",
        choices: [
          "It left hardware behind and became a pure subscription software company",
          "GPUs built for gaming turned out to be ideal for training large AI models",
          "It became an AI leader by acquiring the world's largest cloud provider",
          "Growth came mainly from launching a popular consumer chatbot app"
        ],
        correctIndex: 1,
        explain:
          "The same parallel-processing power that made games fast also powers AI training — that pivot was organic, not a sudden software-only rebrand.",
        trueFalseStatement:
          "GPUs built for gaming turned out to be ideal for training large AI models.",
        trueFalseCorrect: true
      },
      {
        kind: "multiple-choice",
        id: "co-q3-presence",
        prompt: "Who actually depends on {Company.name}'s products today?",
        choices: [
          "Almost only hobby gamers upgrading home graphics cards each year",
          "Cloud providers, AI startups, researchers, gamers, and large enterprises",
          "Mostly other chip firms that license designs but never deploy them",
          "Primarily governments running classified supercomputers with no private sector use"
        ],
        correctIndex: 1,
        explain:
          "Customers span hyperscale cloud, AI builders, research labs, gaming, and big companies — not one narrow niche.",
        trueFalseStatement:
          "{Company.name} sells products to cloud providers, AI startups, researchers, gamers, and large businesses.",
        trueFalseCorrect: true
      },
      {
        kind: "multiple-choice",
        id: "co-q4-combo",
        prompt:
          "What most distinguishes {Company.name} from a typical chip-only supplier?",
        choices: [
          "It competes mainly on being the cheapest silicon with no software layer",
          "It sells one flagship chip and avoids developer tools or platforms",
          "It combines chips, software, and AI platforms into one integrated stack",
          "It outsources all R&D and focuses only on owning fabrication plants"
        ],
        correctIndex: 2,
        explain:
          "The full-stack model — hardware, CUDA/software, and AI tools together — is harder for rivals to copy than selling chips alone.",
        trueFalseStatement:
          "{Company.name} combines chips, software, and AI platforms into one integrated stack.",
        trueFalseCorrect: true
      },
      {
        kind: "multiple-choice",
        id: "co-q5-section",
        prompt: "Which statement best describes {Company.name} in one sentence?",
        choices: [
          "{Company.name} is mainly a consumer email and cloud-storage company.",
          "{Company.name} designs accelerated computing chips and software used in AI, gaming, and data centres.",
          "{Company.name} makes only one chip and avoids software or developer platforms.",
          "{Company.name} earns most of its revenue from selling smartphones in retail stores."
        ],
        correctIndex: 1,
        explain:
          "A solid overview is one clear picture: what the business does, how it reached today's role, and who relies on it.",
        trueFalseStatement:
          "{Company.name} designs accelerated computing chips and software used in AI, gaming, and data centres.",
        trueFalseCorrect: true
      }
    ]
  },
  "products-services": {
    passThreshold: PASS,
    questions: [
      {
        kind: "multiple-choice",
        id: "ps-q1-value",
        prompt: "What problem does {Company.name} solve for customers?",
        choices: [
          "Helps computers handle incredibly difficult tasks much faster than traditional computers",
          "Only makes paper notebooks for schools",
          "Runs a chain of coffee shops",
          "Prints posters for movie theatres"
        ],
        correctIndex: 0,
        explain:
          "NVIDIA's value starts with solving hard computing problems at speed."
      },
      {
        kind: "multiple-choice",
        id: "ps-q2-portfolio",
        prompt: "What does {Company.name} sell beyond its best-known GPUs?",
        choices: [
          "Networking equipment, AI software, complete computing systems and industry platforms",
          "Only one chip with no software",
          "Groceries and household goods",
          "Passenger airline tickets"
        ],
        correctIndex: 0,
        explain:
          "A broad portfolio spreads risk and opens more growth paths."
      },
      {
        kind: "multiple-choice",
        id: "ps-q3-innovation",
        prompt: "How does {Company.name} stay ahead through innovation?",
        choices: [
          "Constant R&D on new chips, software and AI platforms that keep its ecosystem ahead",
          "By never launching new products",
          "By copying rivals once a year",
          "By avoiding research entirely"
        ],
        correctIndex: 0,
        explain:
          "Continuous innovation protects long-term competitiveness in fast-moving tech."
      },
      {
        kind: "multiple-choice",
        id: "ps-q4-combo",
        prompt:
          "Why does {Company.name} combine hardware, software and networking into one platform?",
        choices: [
          "Customers can build powerful AI systems faster with compatible parts working together",
          "It makes products harder for customers to use",
          "Investors never care about product integration",
          "Only one product can ever be sold at a time"
        ],
        correctIndex: 0,
        explain:
          "Integrated platforms are harder for rivals to match and easier for customers to adopt."
      },
      {
        kind: "multiple-choice",
        id: "ps-q5-section",
        prompt:
          "What does the Products & Services section help you answer about {Company.name}?",
        choices: [
          "What it sells, why customers choose it and how it keeps improving",
          "Only how many buildings it owns",
          "Nothing useful for investing",
          "The exact dividend date every year"
        ],
        correctIndex: 0,
        explain:
          "This section answers: what is NVIDIA selling, and why is it better than everyone else's?"
      }
    ]
  },
  "customers-markets": {
    passThreshold: PASS,
    questions: [
      {
        kind: "multiple-choice",
        id: "cm-q1-customers",
        prompt: "Who are {Company.name}'s biggest customers?",
        choices: [
          "Some of the world's largest cloud companies, internet platforms and technology businesses",
          "Only hobby gamers upgrading home graphics cards each year",
          "Mostly small local shops with no enterprise buyers",
          "Only governments running classified supercomputers"
        ],
        correctIndex: 0,
        explain:
          "Hyperscale cloud and big tech are major buyers — but they are not NVIDIA's only customers."
      },
      {
        kind: "multiple-choice",
        id: "cm-q2-markets",
        prompt: "Which market is driving {Company.name}'s biggest growth today?",
        choices: [
          "Artificial intelligence and data centres",
          "Paper notebooks for schools",
          "Passenger airline tickets",
          "Coffee shop franchises"
        ],
        correctIndex: 0,
        explain:
          "Global AI infrastructure investment is the main growth engine right now."
      },
      {
        kind: "multiple-choice",
        id: "cm-q3-geography",
        prompt: "Why is global reach important for investors?",
        choices: [
          "A global customer base creates more growth opportunities and reduces reliance on one region",
          "Geography only matters for tourism companies",
          "All sales always come from one city",
          "Maps replace financial statements"
        ],
        correctIndex: 0,
        explain:
          "Spreading demand across regions cushions a business when one economy slows."
      },
      {
        kind: "multiple-choice",
        id: "cm-q4-combo",
        prompt: "Does {Company.name} only sell to big tech companies?",
        choices: [
          "No — it also serves researchers, healthcare, finance, manufacturers, car companies, startups, designers and gamers",
          "Yes — only three cloud companies are allowed to buy its products",
          "Yes — it never sells outside the United States",
          "No — it only sells to individual consumers in retail stores"
        ],
        correctIndex: 0,
        explain:
          "A diverse customer base across many industries lowers concentration risk."
      },
      {
        kind: "multiple-choice",
        id: "cm-q5-section",
        prompt:
          "What does the Customers & Markets section help you answer about {Company.name}?",
        choices: [
          "Who actually buys its products, and where is the business growing?",
          "Only how many office buildings it owns",
          "Nothing useful for investing",
          "The exact dividend date every year"
        ],
        correctIndex: 0,
        explain:
          "This section builds on Company Overview and Products & Services — who buys it, and where growth comes from."
      }
    ]
  },
  "business-model": {
    passThreshold: PASS,
    questions: [
      {
        kind: "multiple-choice",
        id: "bm-q1-revenue",
        prompt: "What is a revenue model?",
        choices: [
          "How the company turns its products into money over time",
          "A model airplane collection",
          "Only the company's logo design",
          "How many emails employees send"
        ],
        correctIndex: 0,
        explain: "Revenue model = the pattern of how cash comes in."
      },
      {
        kind: "multiple-choice",
        id: "bm-q2-drivers",
        prompt: "What are revenue drivers for {Company.name}?",
        choices: [
          "The main forces that make sales grow or shrink",
          "Only the weather forecast",
          "Drivers who deliver packages",
          "Stock price daily moves"
        ],
        correctIndex: 0,
        explain: "Drivers explain why revenue rises or falls."
      },
      {
        kind: "multiple-choice",
        id: "bm-q3-structure",
        prompt: "Why look at business structure?",
        choices: [
          "It shows how the company is organised to deliver products profitably",
          "Structure means office floor plans only",
          "Investors never need org charts",
          "Structure replaces all products"
        ],
        correctIndex: 0,
        explain: "Structure affects costs, speed and scalability."
      },
      {
        kind: "multiple-choice",
        id: "bm-q4-combo",
        prompt:
          "If {Company.name} earns mostly from one revenue stream, an investor should…",
        choices: [
          "Watch whether that stream stays healthy — diversification reduces risk",
          "Ignore revenue entirely",
          "Assume growth never slows",
          "Only read headlines"
        ],
        correctIndex: 0,
        explain: "One stream can be powerful but fragile."
      },
      {
        kind: "multiple-choice",
        id: "bm-q5-section",
        prompt: "The Business Model section helps you answer…",
        choices: [
          "How {Company.name} makes money and what pushes revenue up or down",
          "Only the CEO's age",
          "Nothing about profits",
          "Which colour the annual report uses"
        ],
        correctIndex: 0,
        explain: "You cannot judge a business without understanding its money engine."
      }
    ]
  },
  "competitive-position": {
    passThreshold: PASS,
    questions: [
      {
        kind: "multiple-choice",
        id: "cp-q1-advantage",
        prompt: "What is a competitive advantage?",
        choices: [
          "Something that helps a company win against rivals over time",
          "A bigger office building only",
          "Lower stock price than peers",
          "More social media posts"
        ],
        correctIndex: 0,
        explain: "Advantages protect profits from competition."
      },
      {
        kind: "multiple-choice",
        id: "cp-q2-position",
        prompt: "Market position describes…",
        choices: [
          "Where {Company.name} stands versus rivals in its industry",
          "Only the company's street address",
          "Positions on a sports team",
          "Random market noise daily"
        ],
        correctIndex: 0,
        explain: "Leaders and challengers face different risks and opportunities."
      },
      {
        kind: "multiple-choice",
        id: "cp-q3-strategy",
        prompt: "Competitive strategy is…",
        choices: [
          "How the company chooses to compete and grow its edge",
          "A secret never shared with investors",
          "Only advertising slogans",
          "The same for every company"
        ],
        correctIndex: 0,
        explain: "Strategy shows management's plan to stay ahead."
      },
      {
        kind: "multiple-choice",
        id: "cp-q4-combo",
        prompt: "Strong advantage plus weak strategy most likely means…",
        choices: [
          "The edge may erode if rivals catch up or management missteps",
          "Guaranteed dominance forever",
          "Investors can ignore competition",
          "Strategy never matters"
        ],
        correctIndex: 0,
        explain: "Even strong moats need smart execution."
      },
      {
        kind: "multiple-choice",
        id: "cp-q5-section",
        prompt: "Competitive Position helps an investor judge…",
        choices: [
          "Whether {Company.name} can defend its lead against rivals",
          "Only logo design contests",
          "Nothing about long-term profits",
          "Only short-term hype"
        ],
        correctIndex: 0,
        explain: "Competition determines how durable profits really are."
      }
    ]
  },
  operations: {
    passThreshold: PASS,
    questions: [
      {
        kind: "multiple-choice",
        id: "op-q1-supply",
        prompt: "Why study {Company.name}'s supply chain?",
        choices: [
          "Disruptions in supply can halt products and hurt sales",
          "Supply chains never affect tech companies",
          "Only farmers have supply chains",
          "Investors ignore production entirely"
        ],
        correctIndex: 0,
        explain: "Making and delivering products depends on reliable supply."
      },
      {
        kind: "multiple-choice",
        id: "op-q2-sales",
        prompt: "Sales & distribution channels matter because…",
        choices: [
          "They determine how products reach customers efficiently",
          "Products sell themselves with no channels",
          "Only retail stores exist",
          "Channels mean TV stations only"
        ],
        correctIndex: 0,
        explain: "Great products still need paths to buyers."
      },
      {
        kind: "multiple-choice",
        id: "op-q3-partners",
        prompt: "Partnerships & ecosystem help {Company.name} by…",
        choices: [
          "Expanding reach and strengthening the platform around its products",
          "Eliminating all competitors instantly",
          "Replacing all products with ads",
          "Guaranteeing zero costs"
        ],
        correctIndex: 0,
        explain: "Ecosystems can lock in customers and developers."
      },
      {
        kind: "multiple-choice",
        id: "op-q4-combo",
        prompt:
          "If supply is tight but demand is hot, an investor should watch for…",
        choices: [
          "Whether the company can scale production without major delays",
          "Automatic profit doubling",
          "No operational risk",
          "Only marketing spend"
        ],
        correctIndex: 0,
        explain: "Demand only converts to revenue if operations can deliver."
      },
      {
        kind: "multiple-choice",
        id: "op-q5-section",
        prompt: "The Operations section helps you understand…",
        choices: [
          "How {Company.name} actually delivers products and scales day to day",
          "Only office decor choices",
          "Nothing about execution risk",
          "Only stock chart patterns"
        ],
        correctIndex: 0,
        explain: "Operations turn strategy into real products customers receive."
      }
    ]
  }
};

export function resolveChecklistSectionQuizConfig(
  sectionId: BusinessChecklistSectionId
): QuizConfig {
  return BUSINESS_CHECKLIST_SECTION_QUIZZES[sectionId];
}
