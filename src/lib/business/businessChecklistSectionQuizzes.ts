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
        prompt: "How does {Company.name} make most of its money today?",
        choices: [
          "By selling chips, networking equipment and AI software — mostly through its Data Center business",
          "By running a chain of retail coffee shops",
          "By licensing its logo on third-party gadgets",
          "By selling passenger airline tickets"
        ],
        correctIndex: 0,
        explain:
          "NVIDIA earns from hardware, software and AI platforms — with data centres as the biggest revenue engine right now."
      },
      {
        kind: "multiple-choice",
        id: "bm-q2-drivers",
        prompt: "What is currently driving {Company.name}'s biggest growth?",
        choices: [
          "Artificial intelligence and massive investment in AI data centre infrastructure",
          "Paper notebook sales to schools",
          "Declining demand for all technology products",
          "A single product with no other revenue streams"
        ],
        correctIndex: 0,
        explain:
          "Global AI build-out is the main growth driver — especially demand for GPUs in data centres."
      },
      {
        kind: "multiple-choice",
        id: "bm-q3-structure",
        prompt: "What are {Company.name}'s two main business segments?",
        choices: [
          "Compute & Networking and Graphics",
          "Retail stores and restaurants",
          "Only gaming and nothing else",
          "Cloud email and file storage"
        ],
        correctIndex: 0,
        explain:
          "NVIDIA reports through Compute & Networking and Graphics so investors can see where growth comes from."
      },
      {
        kind: "multiple-choice",
        id: "bm-q4-combo",
        prompt: "Why is {Company.name}'s business model attractive to investors?",
        choices: [
          "It earns from hardware, software and AI platforms — not just one product",
          "It relies on a single customer in one country",
          "It has no connection to AI or data centres",
          "It never invests in new technology"
        ],
        correctIndex: 0,
        explain:
          "Multiple revenue layers — chips, software and platforms — create more ways to grow over time."
      },
      {
        kind: "multiple-choice",
        id: "bm-q5-section",
        prompt: "Which statement best summarises {Company.name}'s business model?",
        choices: [
          "It sells accelerated computing products and platforms, led by AI data centre demand, across two reported segments",
          "It is mainly a consumer email and cloud-storage company",
          "It makes money only from one chip sold in retail stores",
          "Investors cannot learn how it makes money from public reports"
        ],
        correctIndex: 0,
        explain:
          "The Business Model section answers: how does NVIDIA make money, what drives growth, and how the business is organised."
      }
    ]
  },
  "competitive-position": {
    passThreshold: PASS,
    questions: [
      {
        kind: "multiple-choice",
        id: "cp-q1-advantage",
        prompt: "What makes {Company.name} difficult for competitors to copy?",
        choices: [
          "Its full platform — hardware, CUDA software, developer ecosystem and AI tools together",
          "Only having a bigger office building than rivals",
          "A lower stock price than competitors",
          "More social media posts than other chip companies"
        ],
        correctIndex: 0,
        explain:
          "Chips alone are not enough — CUDA, developers and the full AI stack are much harder to replicate."
      },
      {
        kind: "multiple-choice",
        id: "cp-q2-position",
        prompt: "Which statement best describes {Company.name}'s position in the AI industry?",
        choices: [
          "A leading company whose products power many of the world's largest AI systems and data centres",
          "A small startup with no major customers",
          "A company that only sells to hobby gamers",
          "A business with no real competitors"
        ],
        correctIndex: 0,
        explain:
          "NVIDIA holds a leading position in AI computing despite strong competition from AMD, Intel and others."
      },
      {
        kind: "multiple-choice",
        id: "cp-q3-strategy",
        prompt: "How is {Company.name} trying to stay ahead of competitors?",
        choices: [
          "By investing heavily in new technology and expanding its full AI platform across industries",
          "By stopping all research and development",
          "By selling only one product forever",
          "By avoiding software and focusing only on chips"
        ],
        correctIndex: 0,
        explain:
          "NVIDIA's strategy is continuous investment in hardware, software and AI platforms — not standing still."
      },
      {
        kind: "multiple-choice",
        id: "cp-q4-combo",
        prompt: "Why do many customers continue choosing {Company.name} over competitors?",
        choices: [
          "Its products work well together and switching platforms is costly and time-consuming",
          "Customers are legally required to use only one brand",
          "Competitors offer identical products at lower quality",
          "NVIDIA has no competition in any market"
        ],
        correctIndex: 0,
        explain:
          "Ecosystem lock-in and integration make staying on NVIDIA's platform the practical choice for many buyers."
      },
      {
        kind: "multiple-choice",
        id: "cp-q5-section",
        prompt: "Which statement best summarises {Company.name}'s competitive position?",
        choices: [
          "A market leader with a hard-to-copy full-stack AI platform, strong rivals, and a strategy to keep expanding the ecosystem",
          "A company with no competitive advantages and no market share",
          "A business that competes only in gaming and nowhere else",
          "A firm investors cannot judge against competitors"
        ],
        correctIndex: 0,
        explain:
          "Competitive Position answers: why is NVIDIA hard to beat, where does it stand, and can it stay ahead?"
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
