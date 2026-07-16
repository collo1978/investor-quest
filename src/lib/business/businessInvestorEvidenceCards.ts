import type { CompanyId } from "@/data/companies";
import type { InvestorPrincipleId } from "@/lib/business/businessInvestorFramework";

/** Standard thumbs rating for every Business Island evidence card. */
export const BUSINESS_ISLAND_EVIDENCE_RATING = {
  strongEmoji: "👍",
  weakEmoji: "👎",
  strongAriaLabel: "I understand",
  weakAriaLabel: "Not yet"
} as const;

export type BusinessInvestorEvidenceCardDef = {
  id: string;
  principleId: InvestorPrincipleId;
  order: number;
  question: string;
  answer: string;
  /** Optional — fixed headline for identical A-section layout across all cards. */
  answerHeadline?: string;
  /** Optional — supporting copy under the headline. */
  answerBody?: string;
  bullets?: readonly string[];
  callout?: string;
  /** Shown on the rating card — specific to this evidence piece. */
  ratingPrompt: string;
  /**
   * Company Evolution timeline milestone ids unlocked/completed by this card.
   * One card may cover multiple milestones.
   */
  timelineMilestoneIds?: readonly string[];
};

const NVDA_BUSINESS_PURPOSE_CARDS: readonly BusinessInvestorEvidenceCardDef[] = [
  {
    id: "purpose-1",
    principleId: "business-purpose",
    order: 1,
    question: "What does NVIDIA actually do?",
    answer:
      'Think of NVIDIA as the company building the "brains" behind modern AI. It designs powerful computer chips and software that help computers do jobs that would normally take much longer, like training ChatGPT, running self-driving cars, creating realistic video games, and helping scientists make new discoveries.',
    answerHeadline:
      'Think of NVIDIA as the company building the "brains" behind modern AI.',
    answerBody:
      "It designs powerful computer chips and software that help computers do jobs that would normally take much longer, like training ChatGPT, running self-driving cars, creating realistic video games, and helping scientists make new discoveries.",
    ratingPrompt: "Do you understand what NVIDIA does?"
  },
  {
    id: "purpose-2",
    principleId: "business-purpose",
    order: 2,
    question: "What is NVIDIA's mission?",
    answer:
      "NVIDIA wants to make computers much smarter and much faster. Its goal is to help people and businesses solve problems that ordinary computers struggle with, making AI and advanced computing useful in everyday industries like healthcare, finance, manufacturing and transportation.",
    answerHeadline: "NVIDIA wants to make computers much smarter and much faster.",
    answerBody:
      "Its goal is to help people and businesses solve problems that ordinary computers struggle with, making AI and advanced computing useful in everyday industries like healthcare, finance, manufacturing and transportation.",
    ratingPrompt: "Do you understand NVIDIA's mission?"
  }
];

const NVDA_COMPANY_EVOLUTION_CARDS: readonly BusinessInvestorEvidenceCardDef[] = [
  {
    id: "evolution-1",
    principleId: "company-evolution",
    order: 1,
    question: "How did NVIDIA begin changing computing?",
    answer:
      "NVIDIA's first major turning point came in 1999, when it invented the GPU. The GPU helped redefine computer graphics and supported the growth of PC gaming. NVIDIA was not simply making another computer chip — it helped create a new category of computing technology.",
    answerHeadline:
      "NVIDIA invented the GPU — and helped create a new category of computing.",
    answerBody:
      "The GPU redefined computer graphics and powered the rise of PC gaming. NVIDIA was not simply making another computer chip. It opened an entirely new product category.",
    callout:
      "Investor Takeaway: Great companies can begin by creating an entirely new product category.",
    ratingPrompt: "Do you understand how NVIDIA began changing computing?",
    timelineMilestoneIds: ["gpu-1999"]
  },
  {
    id: "evolution-2",
    principleId: "company-evolution",
    order: 2,
    question: "How did CUDA transform NVIDIA?",
    answer:
      "In 2006, NVIDIA introduced the CUDA programming model. CUDA allowed developers to use GPUs for much more than graphics — scientific computing, data processing, and other demanding workloads. This transformed NVIDIA from mainly a gaming graphics company into a broader computing platform company, and helped pave the way for modern AI.",
    answerHeadline: "CUDA turned one product into a platform.",
    answerBody:
      "Developers could now use GPUs for scientific computing, data processing and other demanding workloads — far beyond games. NVIDIA shifted from a graphics specialist into a broader computing platform company, paving the way for modern AI.",
    callout:
      "Investor Takeaway: The biggest turning points often come when a company turns one product into a platform.",
    ratingPrompt: "Do you understand how CUDA transformed NVIDIA?",
    timelineMilestoneIds: ["cuda-2006"]
  },
  {
    id: "evolution-3",
    principleId: "company-evolution",
    order: 3,
    question: "What proved NVIDIA's technology could power modern AI?",
    answer:
      'In 2012, the AlexNet neural network was trained using NVIDIA GPUs and won the ImageNet image-recognition competition. NVIDIA describes this as the "Big Bang" moment of AI. It showed that GPUs were extremely effective for deep learning and helped establish NVIDIA as a major force in AI computing.',
    answerHeadline:
      "AlexNet on NVIDIA GPUs — the AI \"Big Bang.\"",
    answerBody:
      "Winning ImageNet proved GPUs were extraordinarily effective for deep learning. That moment unlocked a much larger future for NVIDIA's technology.",
    callout:
      "Investor Takeaway: One breakthrough can reveal a much larger future opportunity for a company's technology.",
    ratingPrompt: "Do you understand NVIDIA's AI breakthrough moment?",
    timelineMilestoneIds: ["ai-2012"]
  },
  {
    id: "evolution-4",
    principleId: "company-evolution",
    order: 4,
    question: "How did NVIDIA start building technology specifically for AI?",
    answer:
      "NVIDIA continued adapting its products for the new AI era. In 2017, it introduced its first Tensor Core GPU, designed specifically for AI workloads. In 2018, it introduced its first autonomous-driving system-on-chip. NVIDIA was no longer only adapting graphics technology — it was deliberately building products for AI and autonomous systems.",
    answerHeadline: "NVIDIA began designing chips specifically for AI.",
    answerBody:
      "In 2017 came the first Tensor Core GPU. In 2018, the first autonomous-driving system-on-chip followed. NVIDIA was no longer only adapting graphics tech — it was building for the AI era on purpose.",
    callout:
      "Investor Takeaway: Strong companies do not stand still. They redesign their technology for new opportunities.",
    ratingPrompt: "Do you understand how NVIDIA built specifically for AI?",
    timelineMilestoneIds: ["built-for-ai-2017"]
  },
  {
    id: "evolution-5",
    principleId: "company-evolution",
    order: 5,
    question: "How did NVIDIA expand beyond chips into the full computing platform?",
    answer:
      "In 2020, NVIDIA acquired Mellanox. This expanded NVIDIA into high-performance networking and allowed its computing platforms to operate at data-centre scale — a critical step toward becoming more than a chip company.",
    answerHeadline: "Mellanox brought NVIDIA networking — and data-centre scale.",
    answerBody:
      "High-performance networking let NVIDIA platforms operate as complete data-centre systems, not isolated chips. The company was expanding the platform around the GPU.",
    callout:
      "Investor Takeaway: Platform companies grow by surrounding their core technology with what customers need next.",
    ratingPrompt: "Do you understand how NVIDIA expanded the platform?",
    timelineMilestoneIds: ["expand-2020"]
  },
  {
    id: "evolution-6",
    principleId: "company-evolution",
    order: 6,
    question: "How did NVIDIA become a full-stack computing infrastructure company?",
    answer:
      "NVIDIA built complete software stacks for major industries and, in 2023, introduced Grace — its first data-centre CPU. Today NVIDIA describes itself as a full-stack computing infrastructure company combining GPUs, CPUs, networking, systems, software, AI libraries, APIs and services.",
    answerHeadline:
      "Today NVIDIA is a full-stack computing infrastructure company.",
    answerBody:
      "Grace, its first data-centre CPU, arrived in 2023. Combined with software stacks across industries, NVIDIA is no longer simply a graphics-chip company.",
    bullets: [
      "DRIVE — autonomous driving",
      "Clara — healthcare",
      "Omniverse — industrial digitalisation",
      "NVIDIA AI Enterprise — enterprise AI"
    ],
    callout:
      "Investor Takeaway: Investors should understand what a company has become, not only where it started.",
    ratingPrompt: "Do you understand NVIDIA as a full-stack platform?",
    timelineMilestoneIds: ["fullstack-today"]
  }
];

const NVDA_GLOBAL_PRESENCE_CARDS: readonly BusinessInvestorEvidenceCardDef[] = [
  {
    id: "presence-1",
    principleId: "global-presence",
    order: 1,
    question: "Who uses NVIDIA's products?",
    answer:
      "NVIDIA's customers include the world's biggest cloud companies, AI startups, researchers, gamers, designers and large businesses across many industries.",
    answerHeadline:
      "NVIDIA's customers include the world's biggest cloud companies and AI startups.",
    answerBody:
      "Researchers, gamers, designers and large businesses across many industries also rely on its products.",
    ratingPrompt: "Do you understand who uses NVIDIA's products?"
  },
  {
    id: "presence-2",
    principleId: "global-presence",
    order: 2,
    question: "Which industries rely on NVIDIA's technology?",
    answer:
      "Its technology is used in healthcare, finance, manufacturing, automotive, telecommunications, scientific research, gaming and many other industries that need powerful computing.",
    answerHeadline:
      "NVIDIA's technology spans healthcare, finance, manufacturing and more.",
    answerBody:
      "Automotive, telecommunications, scientific research, gaming and many other industries that need powerful computing also rely on it.",
    ratingPrompt: "Do you understand which industries rely on NVIDIA?"
  }
];

const NVDA_VALUE_PROPOSITION_CARDS: readonly BusinessInvestorEvidenceCardDef[] = [
  {
    id: "value-1",
    principleId: "value-proposition",
    order: 1,
    question: "What problem does NVIDIA solve?",
    answer:
      "NVIDIA helps computers handle incredibly difficult tasks much faster than traditional computers. Its technology powers things like artificial intelligence, scientific research, self-driving cars and advanced graphics that would otherwise take much longer to process.",
    answerHeadline:
      "NVIDIA helps computers handle incredibly difficult tasks much faster than traditional computers.",
    answerBody:
      "Its technology powers things like artificial intelligence, scientific research, self-driving cars and advanced graphics that would otherwise take much longer to process.",
    ratingPrompt: "Do you understand the problem NVIDIA solves?"
  },
  {
    id: "value-2",
    principleId: "value-proposition",
    order: 2,
    question: "Why do customers choose NVIDIA?",
    answer:
      "Customers choose NVIDIA because it doesn't just sell chips. It provides the chips, software and tools needed to build powerful AI systems, making it much easier for businesses to develop and run advanced applications.",
    answerHeadline: "Customers choose NVIDIA because it doesn't just sell chips.",
    answerBody:
      "It provides the chips, software and tools needed to build powerful AI systems, making it much easier for businesses to develop and run advanced applications.",
    ratingPrompt: "Do you understand why customers choose NVIDIA?"
  },
  {
    id: "value-3",
    principleId: "value-proposition",
    order: 3,
    question: "What makes NVIDIA's products so valuable?",
    answer:
      "NVIDIA's products save customers time and help them build better technology faster. By combining powerful hardware with software that works seamlessly together, customers can solve problems that would be difficult or impossible using ordinary computers.",
    answerHeadline: "NVIDIA's products save customers time and help them build better technology faster.",
    answerBody:
      "By combining powerful hardware with software that works seamlessly together, customers can solve problems that would be difficult or impossible using ordinary computers.",
    ratingPrompt: "Do you understand what makes NVIDIA's products valuable?"
  }
];

const NVDA_PRODUCT_PORTFOLIO_CARDS: readonly BusinessInvestorEvidenceCardDef[] = [
  {
    id: "portfolio-1",
    principleId: "product-portfolio",
    order: 1,
    question: "What products does NVIDIA sell?",
    answer:
      "NVIDIA is best known for its GPUs, but it also develops networking equipment, AI software, complete computing systems and platforms for industries like healthcare, gaming and autonomous driving.",
    answerHeadline: "NVIDIA is best known for its GPUs.",
    answerBody:
      "It also develops networking equipment, AI software, complete computing systems and platforms for industries like healthcare, gaming and autonomous driving.",
    ratingPrompt: "Do you understand what products NVIDIA sells?"
  },
  {
    id: "portfolio-2",
    principleId: "product-portfolio",
    order: 2,
    question: "Does NVIDIA sell more than computer chips?",
    answer:
      "Yes. NVIDIA has grown far beyond selling chips. Today it offers complete AI platforms that combine hardware, software, networking and developer tools into one integrated solution.",
    answerHeadline: "Yes — NVIDIA has grown far beyond selling chips.",
    answerBody:
      "Today it offers complete AI platforms that combine hardware, software, networking and developer tools into one integrated solution.",
    ratingPrompt: "Do you understand NVIDIA's full product range?"
  },
  {
    id: "portfolio-3",
    principleId: "product-portfolio",
    order: 3,
    question: "How do NVIDIA's products work together?",
    answer:
      "Instead of selling individual products, NVIDIA designs many of its products to work as one complete system. This makes it easier for customers to build powerful AI infrastructure while keeping everything compatible.",
    answerHeadline:
      "NVIDIA designs many of its products to work as one complete system.",
    answerBody:
      "This makes it easier for customers to build powerful AI infrastructure while keeping everything compatible.",
    ratingPrompt: "Do you understand how NVIDIA's products work together?"
  }
];

const NVDA_INNOVATION_CARDS: readonly BusinessInvestorEvidenceCardDef[] = [
  {
    id: "innovation-1",
    principleId: "innovation",
    order: 1,
    question: "Why is innovation so important to NVIDIA?",
    answer:
      "Innovation has been at the centre of NVIDIA since the company was founded. Many of its biggest successes came from creating entirely new technologies rather than simply improving existing ones.",
    answerHeadline:
      "Innovation has been at the centre of NVIDIA since the company was founded.",
    answerBody:
      "Many of its biggest successes came from creating entirely new technologies rather than simply improving existing ones.",
    ratingPrompt: "Do you understand why innovation matters to NVIDIA?"
  },
  {
    id: "innovation-2",
    principleId: "innovation",
    order: 2,
    question: "How much does NVIDIA invest in innovation?",
    answer:
      "NVIDIA has invested tens of billions of dollars into research and development over its history. This continuous investment has helped it remain one of the world's leading technology companies.",
    answerHeadline:
      "NVIDIA has invested tens of billions of dollars into research and development.",
    answerBody:
      "This continuous investment has helped it remain one of the world's leading technology companies.",
    ratingPrompt: "Do you understand NVIDIA's investment in innovation?"
  },
  {
    id: "innovation-3",
    principleId: "innovation",
    order: 3,
    question: "How does innovation keep NVIDIA ahead?",
    answer:
      "By constantly developing new chips, software and AI platforms, NVIDIA stays ahead of changing technology and gives customers reasons to continue building on its ecosystem.",
    answerHeadline:
      "NVIDIA constantly develops new chips, software and AI platforms.",
    answerBody:
      "This keeps it ahead of changing technology and gives customers reasons to continue building on its ecosystem.",
    ratingPrompt: "Do you understand how innovation keeps NVIDIA ahead?"
  }
];

const NVDA_CUSTOMER_BASE_CARDS: readonly BusinessInvestorEvidenceCardDef[] = [
  {
    id: "customers-1",
    principleId: "customer-base",
    order: 1,
    question: "Who are NVIDIA's biggest customers?",
    answer:
      "NVIDIA's biggest customers include some of the world's largest cloud companies, internet platforms and technology businesses. These companies use NVIDIA's technology to power AI services, cloud computing and massive data centres.",
    answerHeadline:
      "NVIDIA's biggest customers include some of the world's largest cloud companies, internet platforms and technology businesses.",
    answerBody:
      "These companies use NVIDIA's technology to power AI services, cloud computing and massive data centres.",
    ratingPrompt: "Do you understand who NVIDIA's biggest customers are?"
  },
  {
    id: "customers-2",
    principleId: "customer-base",
    order: 2,
    question: "Does NVIDIA only sell to big tech companies?",
    answer:
      "No. While large technology companies are major customers, NVIDIA also serves researchers, healthcare companies, financial institutions, manufacturers, car companies, startups, designers and gamers.",
    answerHeadline: "No — NVIDIA serves far more than big tech alone.",
    answerBody:
      "While large technology companies are major customers, NVIDIA also serves researchers, healthcare companies, financial institutions, manufacturers, car companies, startups, designers and gamers.",
    ratingPrompt: "Do you understand the breadth of NVIDIA's customer base?"
  },
  {
    id: "customers-3",
    principleId: "customer-base",
    order: 3,
    question: "Why is having lots of different customers important?",
    answer:
      "Selling to many different industries reduces risk. If demand slows in one market, NVIDIA still has many other customers and industries driving growth.",
    answerHeadline: "Selling to many different industries reduces risk.",
    answerBody:
      "If demand slows in one market, NVIDIA still has many other customers and industries driving growth.",
    ratingPrompt: "Do you understand why customer diversity matters?"
  }
];

const NVDA_END_MARKETS_CARDS: readonly BusinessInvestorEvidenceCardDef[] = [
  {
    id: "markets-1",
    principleId: "end-markets",
    order: 1,
    question: "Which markets does NVIDIA operate in?",
    answer:
      "NVIDIA operates across many markets including AI, cloud computing, gaming, autonomous vehicles, healthcare, scientific research and professional design.",
    answerHeadline:
      "NVIDIA operates across AI, cloud computing, gaming, autonomous vehicles and more.",
    answerBody:
      "Its markets also include healthcare, scientific research and professional design.",
    ratingPrompt: "Do you understand which markets NVIDIA operates in?"
  },
  {
    id: "markets-2",
    principleId: "end-markets",
    order: 2,
    question: "Which market is driving NVIDIA's biggest growth today?",
    answer:
      "Artificial intelligence and data centres are currently the biggest drivers of NVIDIA's growth. Businesses around the world are investing heavily in AI infrastructure powered by NVIDIA technology.",
    answerHeadline:
      "Artificial intelligence and data centres are currently the biggest drivers of NVIDIA's growth.",
    answerBody:
      "Businesses around the world are investing heavily in AI infrastructure powered by NVIDIA technology.",
    ratingPrompt: "Do you understand what is driving NVIDIA's growth today?"
  },
  {
    id: "markets-3",
    principleId: "end-markets",
    order: 3,
    question: "Why does serving many different markets matter?",
    answer:
      "It means NVIDIA isn't dependent on one single industry. As new technologies emerge, the company already has products that can be used across many different sectors.",
    answerHeadline: "NVIDIA isn't dependent on one single industry.",
    answerBody:
      "As new technologies emerge, the company already has products that can be used across many different sectors.",
    ratingPrompt: "Do you understand why serving many markets matters?"
  }
];

const NVDA_GEOGRAPHIC_REACH_CARDS: readonly BusinessInvestorEvidenceCardDef[] = [
  {
    id: "geography-1",
    principleId: "geographic-reach",
    order: 1,
    question: "Does NVIDIA sell its products around the world?",
    answer:
      "Yes. NVIDIA's products are used by businesses, researchers and consumers across many countries around the world.",
    answerHeadline: "Yes — NVIDIA's products are used across many countries.",
    answerBody:
      "Businesses, researchers and consumers around the world rely on its technology.",
    ratingPrompt: "Do you understand NVIDIA's global sales reach?"
  },
  {
    id: "geography-2",
    principleId: "geographic-reach",
    order: 2,
    question: "Is NVIDIA helping industries beyond the United States?",
    answer:
      "Absolutely. Its AI platforms are being used globally in healthcare, finance, manufacturing, automotive, telecommunications and scientific research.",
    answerHeadline: "NVIDIA's AI platforms are being used globally.",
    answerBody:
      "Industries worldwide — including healthcare, finance, manufacturing, automotive, telecommunications and scientific research — rely on its technology.",
    ratingPrompt: "Do you understand NVIDIA's global industry impact?"
  },
  {
    id: "geography-3",
    principleId: "geographic-reach",
    order: 3,
    question: "Why is global reach important for investors?",
    answer:
      "A global customer base gives NVIDIA more opportunities to grow and helps reduce the risk of relying too heavily on one region or economy.",
    answerHeadline:
      "A global customer base gives NVIDIA more opportunities to grow.",
    answerBody:
      "It also helps reduce the risk of relying too heavily on one region or economy.",
    ratingPrompt: "Do you understand why global reach matters to investors?"
  }
];

const NVDA_REVENUE_MODEL_CARDS: readonly BusinessInvestorEvidenceCardDef[] = [
  {
    id: "revenue-1",
    principleId: "revenue-model",
    order: 1,
    question: "How does NVIDIA make money?",
    answer:
      "NVIDIA makes money by selling powerful computer chips, networking equipment and AI software. Its biggest customers buy these products to build AI systems, data centres, gaming computers and other advanced technology.",
    answerHeadline:
      "NVIDIA makes money by selling powerful computer chips, networking equipment and AI software.",
    answerBody:
      "Its biggest customers buy these products to build AI systems, data centres, gaming computers and other advanced technology.",
    ratingPrompt: "Do you understand how NVIDIA makes money?"
  },
  {
    id: "revenue-2",
    principleId: "revenue-model",
    order: 2,
    question: "What is NVIDIA's biggest source of revenue?",
    answer:
      "Today, most of NVIDIA's revenue comes from its Data Center business. As companies invest heavily in artificial intelligence, demand for NVIDIA's AI chips and computing platforms has grown rapidly.",
    answerHeadline:
      "Today, most of NVIDIA's revenue comes from its Data Center business.",
    answerBody:
      "As companies invest heavily in artificial intelligence, demand for NVIDIA's AI chips and computing platforms has grown rapidly.",
    ratingPrompt: "Do you understand NVIDIA's biggest revenue source?"
  },
  {
    id: "revenue-3",
    principleId: "revenue-model",
    order: 3,
    question: "Why is NVIDIA's business model attractive?",
    answer:
      "NVIDIA doesn't rely on just one product. It earns money from hardware, software and complete AI platforms, giving it multiple ways to grow as technology continues to evolve.",
    answerHeadline: "NVIDIA doesn't rely on just one product.",
    answerBody:
      "It earns money from hardware, software and complete AI platforms, giving it multiple ways to grow as technology continues to evolve.",
    ratingPrompt: "Do you understand why NVIDIA's business model is attractive?"
  }
];

const NVDA_BUSINESS_STRUCTURE_CARDS: readonly BusinessInvestorEvidenceCardDef[] = [
  {
    id: "structure-1",
    principleId: "business-structure",
    order: 1,
    question: "How is NVIDIA organised?",
    answer:
      "NVIDIA reports its business through two main segments: Compute & Networking and Graphics. These groups help investors understand which parts of the business are generating growth.",
    answerHeadline:
      "NVIDIA reports its business through two main segments: Compute & Networking and Graphics.",
    answerBody:
      "These groups help investors understand which parts of the business are generating growth.",
    ratingPrompt: "Do you understand how NVIDIA is organised?"
  },
  {
    id: "structure-2",
    principleId: "business-structure",
    order: 2,
    question: "Why does NVIDIA separate the business into different segments?",
    answer:
      "Each segment serves different customers and markets. Reporting them separately makes it easier for investors to see which areas are performing well and where future growth is coming from.",
    answerHeadline: "Each segment serves different customers and markets.",
    answerBody:
      "Reporting them separately makes it easier for investors to see which areas are performing well and where future growth is coming from.",
    ratingPrompt: "Do you understand why NVIDIA reports separate segments?"
  },
  {
    id: "structure-3",
    principleId: "business-structure",
    order: 3,
    question: "Why is NVIDIA's business structure important?",
    answer:
      "A clear business structure helps investors understand the company more easily. Instead of looking at NVIDIA as one giant business, you can see how each major part contributes to its overall success.",
    answerHeadline:
      "A clear business structure helps investors understand the company more easily.",
    answerBody:
      "Instead of looking at NVIDIA as one giant business, you can see how each major part contributes to its overall success.",
    ratingPrompt: "Do you understand why business structure matters?"
  }
];

const NVDA_COMPETITIVE_ADVANTAGE_CARDS: readonly BusinessInvestorEvidenceCardDef[] = [
  {
    id: "advantage-1",
    principleId: "competitive-advantage",
    order: 1,
    question: "What gives NVIDIA an advantage over competitors?",
    answer:
      "NVIDIA offers much more than computer chips. It combines powerful hardware, software, networking and AI tools into one complete platform. This makes it easier for customers to build advanced AI systems without needing products from lots of different companies.",
    answerHeadline: "NVIDIA offers much more than computer chips.",
    answerBody:
      "It combines powerful hardware, software, networking and AI tools into one complete platform. This makes it easier for customers to build advanced AI systems without needing products from lots of different companies.",
    ratingPrompt: "Do you understand NVIDIA's competitive advantage?"
  },
  {
    id: "advantage-2",
    principleId: "competitive-advantage",
    order: 2,
    question: "Why is CUDA so important?",
    answer:
      "CUDA is NVIDIA's software platform that developers use to build AI and computing applications. Because millions of developers already use CUDA, many customers prefer to stay within NVIDIA's ecosystem rather than start again with another company's technology.",
    answerHeadline: "CUDA is NVIDIA's software platform for AI and computing.",
    answerBody:
      "Because millions of developers already use CUDA, many customers prefer to stay within NVIDIA's ecosystem rather than start again with another company's technology.",
    ratingPrompt: "Do you understand why CUDA matters?"
  },
  {
    id: "advantage-3",
    principleId: "competitive-advantage",
    order: 3,
    question: "Why is NVIDIA difficult to compete with?",
    answer:
      "Competitors may be able to build similar chips, but matching NVIDIA's software, developer community, AI tools and years of experience is much harder. This gives NVIDIA a strong competitive advantage.",
    answerHeadline:
      "Competitors may build similar chips, but matching NVIDIA's full ecosystem is much harder.",
    answerBody:
      "Software, developer community, AI tools and years of experience give NVIDIA a strong competitive advantage.",
    ratingPrompt: "Do you understand why NVIDIA is difficult to compete with?"
  }
];

const NVDA_MARKET_POSITION_CARDS: readonly BusinessInvestorEvidenceCardDef[] = [
  {
    id: "position-1",
    principleId: "market-position",
    order: 1,
    question: "Where does NVIDIA rank in its industry?",
    answer:
      "NVIDIA is one of the world's leading companies in AI computing and graphics technology. Its products power many of the world's largest AI systems and data centres.",
    answerHeadline:
      "NVIDIA is one of the world's leading companies in AI computing and graphics technology.",
    answerBody:
      "Its products power many of the world's largest AI systems and data centres.",
    ratingPrompt: "Do you understand NVIDIA's industry ranking?"
  },
  {
    id: "position-2",
    principleId: "market-position",
    order: 2,
    question: "Who does NVIDIA compete against?",
    answer:
      "NVIDIA competes with companies like AMD, Intel and other technology businesses developing AI chips and computing platforms. Competition is strong, but NVIDIA currently holds a leading position in many AI markets.",
    answerHeadline:
      "NVIDIA competes with companies like AMD, Intel and other AI chip makers.",
    answerBody:
      "Competition is strong, but NVIDIA currently holds a leading position in many AI markets.",
    ratingPrompt: "Do you understand who NVIDIA competes against?"
  },
  {
    id: "position-3",
    principleId: "market-position",
    order: 3,
    question: "Why does being a market leader matter?",
    answer:
      "Leading companies often attract more customers, developers and business partners. This creates momentum that can make it even harder for competitors to catch up.",
    answerHeadline: "Leading companies often attract more customers, developers and partners.",
    answerBody:
      "This creates momentum that can make it even harder for competitors to catch up.",
    ratingPrompt: "Do you understand why market leadership matters?"
  }
];

const NVDA_COMPETITIVE_STRATEGY_CARDS: readonly BusinessInvestorEvidenceCardDef[] = [
  {
    id: "strategy-1",
    principleId: "competitive-strategy",
    order: 1,
    question: "How does NVIDIA plan to stay ahead?",
    answer:
      "NVIDIA continues investing heavily in new technology, software and AI platforms. Instead of focusing on one product, it keeps expanding into new industries and new opportunities.",
    answerHeadline:
      "NVIDIA continues investing heavily in new technology, software and AI platforms.",
    answerBody:
      "Instead of focusing on one product, it keeps expanding into new industries and new opportunities.",
    ratingPrompt: "Do you understand how NVIDIA plans to stay ahead?"
  },
  {
    id: "strategy-2",
    principleId: "competitive-strategy",
    order: 2,
    question: "How does NVIDIA keep customers coming back?",
    answer:
      "Customers often continue using NVIDIA because its products work well together and many of their existing systems are already built on NVIDIA's technology. Switching to another platform can take time and cost money.",
    answerHeadline:
      "Customers stay because NVIDIA's products work well together.",
    answerBody:
      "Many existing systems are already built on NVIDIA's technology — switching to another platform can take time and cost money.",
    ratingPrompt: "Do you understand how NVIDIA keeps customers?"
  },
  {
    id: "strategy-3",
    principleId: "competitive-strategy",
    order: 3,
    question: "Why is NVIDIA investing beyond computer chips?",
    answer:
      "NVIDIA wants to become the company powering the entire AI ecosystem. By offering hardware, software, networking and AI platforms together, it creates more opportunities for future growth and strengthens its competitive position.",
    answerHeadline: "NVIDIA wants to become the company powering the entire AI ecosystem.",
    answerBody:
      "By offering hardware, software, networking and AI platforms together, it creates more opportunities for future growth and strengthens its competitive position.",
    ratingPrompt: "Do you understand NVIDIA's strategy beyond chips?"
  }
];

/** Company-specific evidence cards — extend as more principles ship. */
export const BUSINESS_INVESTOR_EVIDENCE_BY_COMPANY: Partial<
  Record<CompanyId, Partial<Record<InvestorPrincipleId, readonly BusinessInvestorEvidenceCardDef[]>>>
> = {
  nvda: {
    "business-purpose": NVDA_BUSINESS_PURPOSE_CARDS,
    "company-evolution": NVDA_COMPANY_EVOLUTION_CARDS,
    "global-presence": NVDA_GLOBAL_PRESENCE_CARDS,
    "value-proposition": NVDA_VALUE_PROPOSITION_CARDS,
    "product-portfolio": NVDA_PRODUCT_PORTFOLIO_CARDS,
    "innovation": NVDA_INNOVATION_CARDS,
    "customer-base": NVDA_CUSTOMER_BASE_CARDS,
    "end-markets": NVDA_END_MARKETS_CARDS,
    "geographic-reach": NVDA_GEOGRAPHIC_REACH_CARDS,
    "revenue-model": NVDA_REVENUE_MODEL_CARDS,
    "business-structure": NVDA_BUSINESS_STRUCTURE_CARDS,
    "competitive-advantage": NVDA_COMPETITIVE_ADVANTAGE_CARDS,
    "market-position": NVDA_MARKET_POSITION_CARDS,
    "competitive-strategy": NVDA_COMPETITIVE_STRATEGY_CARDS
  }
};

export function resolveInvestorEvidenceCards(
  companyId: CompanyId,
  principleId: InvestorPrincipleId
): readonly BusinessInvestorEvidenceCardDef[] {
  const cards = BUSINESS_INVESTOR_EVIDENCE_BY_COMPANY[companyId]?.[principleId] ?? [];
  return [...cards].sort((a, b) => a.order - b.order);
}

export function resolveNextInvestorEvidenceCard(
  companyId: CompanyId,
  principleId: InvestorPrincipleId,
  ratedCardIds: ReadonlySet<string>
): BusinessInvestorEvidenceCardDef | null {
  const cards = resolveInvestorEvidenceCards(companyId, principleId);
  return cards.find((card) => !ratedCardIds.has(card.id)) ?? null;
}

/** Quest slug that launches a principle's evidence path. */
export const PRINCIPLE_EVIDENCE_QUEST_SLUG: Partial<
  Record<InvestorPrincipleId, string>
> = {
  "business-purpose": "what-they-do",
  "company-evolution": "what-they-do",
  "global-presence": "what-they-do",
  "value-proposition": "why-buying",
  "product-portfolio": "why-buying",
  "innovation": "why-buying",
  "customer-base": "everyday-life",
  "end-markets": "everyday-life",
  "geographic-reach": "everyday-life",
  "revenue-model": "how-it-works",
  "business-structure": "how-it-works",
  "competitive-advantage": "competition",
  "market-position": "competition",
  "competitive-strategy": "competition"
};

export function questSlugForPrincipleEvidence(
  principleId: InvestorPrincipleId
): string | null {
  return PRINCIPLE_EVIDENCE_QUEST_SLUG[principleId] ?? null;
}
