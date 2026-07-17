/**
 * Bonus Investigations — optional "detective cases" launched from the Investor
 * Checklist's Dig Deeper questions.
 *
 * Each investigation carries only the evidence needed to answer its specific
 * question, extracted from NVIDIA's 10-K Business section ("Our Company"
 * overview). Quotes preserve the company's wording (trimmed of examples and
 * repetition); every highlighted `phrase` is an exact substring of its sentence.
 *
 * XP is never awarded on click — only after the learner reviews the evidence and
 * passes the Analyst Challenge. Questions without a bespoke set fall back to
 * their parent checklist question's evidence.
 */

import {
  resolveHqDecodeEvidence,
  type HqDecodeEvidencePiece,
  type HqDecodeTermDef
} from "@/lib/business/businessIslandHqDecodeContent";
import {
  digDeeperKey,
  formatInvestorNotebookQuestion,
  INVESTOR_NOTEBOOK_QUESTIONS,
  type InvestorNotebookQuestionId
} from "@/lib/business/businessIslandInvestorNotebook";
import type { InvestorChallengeDef } from "@/lib/business/businessInvestorChallengeFlow";

/** Inline term for bonus evidence (bonus cases are standalone, not chained). */
function bonusTerm(
  id: string,
  phrase: string,
  title: string,
  explanation: string,
  recallKeywords: readonly string[]
): HqDecodeTermDef {
  return { id, phrase, title, explanation, recallKeywords };
}

/** Term builders — pass the exact `phrase` as it appears in each sentence. */
const T = {
  acceleratedComputing: (p: string) =>
    bonusTerm("accelerated-computing", p, "Accelerated Computing", "Using special chips to solve hard computing problems far faster than ordinary computers.", ["fast", "faster", "speed", "quick", "hard", "difficult", "problem", "powerful"]),
  fullStack: (p: string) =>
    bonusTerm("full-stack", p, "Full-Stack", "Building the whole chain — chips, software, systems and services — so customers get a complete platform.", ["whole", "everything", "complete", "chip", "software", "system", "platform", "stack"]),
  dataCenterScale: (p: string) =>
    bonusTerm("data-center-scale", p, "Data-Center-Scale", "Products built to power entire server rooms and cloud facilities — not just one laptop.", ["data cent", "server", "cloud", "big", "large", "huge", "scale", "room"]),
  computeNetworking: (p: string) =>
    bonusTerm("compute-networking", p, "Compute & Networking", "NVIDIA's data-center chips, AI systems and networking — its biggest business area.", ["data cent", "ai", "network", "server", "compute", "chip", "biggest"]),
  gpu: (p: string) =>
    bonusTerm("gpu", p, "GPU", "NVIDIA's specialised chip that does thousands of calculations at once — great for graphics and AI.", ["chip", "processor", "graphics", "gpu", "parallel", "ai", "fast", "game"]),
  cpu: (p: string) =>
    bonusTerm("cpu", p, "CPU", "The general-purpose 'main' processor of a computer.", ["processor", "chip", "main", "cpu", "general", "brain"]),
  dpu: (p: string) =>
    bonusTerm("dpu", p, "DPU", "A chip that handles data movement and networking so other chips can focus on computing.", ["data", "network", "chip", "dpu", "move", "offload", "processor"]),
  cuda: (p: string) =>
    bonusTerm("cuda", p, "CUDA", "NVIDIA's software that lets programmers use its chips for all kinds of computing.", ["software", "program", "code", "tool", "platform", "developer", "switch"]),
  parallelProcessing: (p: string) =>
    bonusTerm("parallel-processing", p, "Parallel Processing", "Doing thousands of small tasks at the same time instead of one after another.", ["same time", "at once", "many", "thousand", "parallel", "together", "fast"]),
  platformStrategy: (p: string) =>
    bonusTerm("platform-strategy", p, "Platform Strategy", "Selling many pieces — hardware, software and services — as one connected system.", ["platform", "whole", "together", "hardware", "software", "service", "system", "complete"]),
  unifiedArchitecture: (p: string) =>
    bonusTerm("unified-architecture", p, "Unified Architecture", "One core design reused across many products and markets.", ["one", "core", "same", "single", "architecture", "reuse", "unified"]),
  ecosystem: (p: string) =>
    bonusTerm("ecosystem", p, "Ecosystem", "The whole community of developers, partners and tools built around a product.", ["community", "developer", "partner", "tool", "network", "everyone", "together"]),
  installedBase: (p: string) =>
    bonusTerm("installed-base", p, "Installed Base", "All the customers already using a company's products right now.", ["already", "existing", "current", "customer", "using", "base", "user"]),
  csp: (p: string) =>
    bonusTerm("csp", p, "Cloud Service Provider (CSP)", "Big companies that rent out computing power over the internet (the major clouds).", ["cloud", "rent", "internet", "big", "provider", "service", "host"]),
  enterprise: (p: string) =>
    bonusTerm("enterprise", p, "Enterprise", "A regular business or large company (not a consumer).", ["business", "company", "firm", "corporate", "organisation", "organization", "large"]),
  generativeAI: (p: string) =>
    bonusTerm("generative-ai", p, "Generative AI", "AI that creates new things — text, images, code, audio or video.", ["create", "generate", "new", "content", "chatbot", "image", "text", "make"]),
  vertical: (p: string) =>
    bonusTerm("vertical", p, "Vertical (Industry)", "A specific industry a product is tailored for, like healthcare or automotive.", ["industry", "sector", "field", "healthcare", "automotive", "specific", "area"]),
  supplyChain: (p: string) =>
    bonusTerm("supply-chain", p, "Supply Chain", "The network of suppliers and factories that make and deliver a product.", ["supplier", "factory", "make", "deliver", "chain", "source", "logistics"]),
  foundry: (p: string) =>
    bonusTerm("foundry", p, "Foundry", "A factory that manufactures computer chips for other companies.", ["factory", "make", "manufacture", "chip", "produce", "fab", "plant"]),
  fabless: (p: string) =>
    bonusTerm("fabless", p, "Fabless", "Designing chips but paying other factories to actually build them.", ["design", "factory", "outsource", "no factory", "build", "without", "hire"]),
  supercomputer: (p: string) =>
    bonusTerm("supercomputer", p, "Supercomputer", "An extremely powerful computer used for the hardest scientific problems.", ["powerful", "big", "fast", "super", "research", "science", "compute"]),
  acquisition: (p: string) =>
    bonusTerm("acquisition", p, "Acquisition", "Buying another company to gain its technology or people.", ["buy", "bought", "purchase", "acquire", "takeover", "merge", "company"]),
  autonomousVehicle: (p: string) =>
    bonusTerm("autonomous-vehicle", p, "Self-Driving Cars", "Cars that use AI to drive themselves.", ["self driving", "self-driving", "car", "drive", "vehicle", "robot", "auto"]),
  rnd: (p: string) =>
    bonusTerm("rnd", p, "Research & Development (R&D)", "Money spent inventing and improving new technology.", ["research", "develop", "invent", "innovate", "spend", "invest", "new"]),
  professionalVisualization: (p: string) =>
    bonusTerm("professional-visualization", p, "Professional Visualization", "Powerful graphics for designers, architects and film creators.", ["design", "architect", "creator", "artist", "visual", "graphics", "professional"]),
  softwareStack: (p: string) =>
    bonusTerm("software-stack", p, "Software Stack", "All the programs and tools built to run on the hardware.", ["software", "program", "tool", "code", "stack", "engineer"]),
  powerConsumption: (p: string) =>
    bonusTerm("power-consumption", p, "Power Consumption", "How much electricity a system uses — lower is cheaper and greener to run.", ["power", "energy", "electricity", "efficient", "cost", "cheap", "less"])
} as const;

/**
 * Bespoke bonus evidence keyed by `questionId:index`, grounded in NVIDIA's
 * 10-K Business section "Our Company" overview.
 */
const BONUS_EVIDENCE_OVERRIDES: Record<string, readonly HqDecodeEvidencePiece[]> = {
  /* ❤️ Value Proposition */
  [digDeeperKey("explain-value-prop", 0)]: [
    {
      id: "bonus-vp-pain",
      sentences: [
        "Our accelerated computing platform can solve complex problems in significantly less time and with lower power consumption than alternative computational approaches.",
        "It can help solve problems that were previously deemed unsolvable."
      ],
      terms: [T.acceleratedComputing("accelerated computing"), T.powerConsumption("power consumption")],
      takeaways: [
        "Customers face problems too big, too slow, or too costly for ordinary computers.",
        "NVIDIA solves them faster and with less power — even problems once thought impossible."
      ]
    }
  ],
  [digDeeperKey("explain-value-prop", 1)]: [
    {
      id: "bonus-vp-choose",
      sentences: [
        "The programmable nature of our architecture allows us to support several multi-billion-dollar end markets with the same underlying technology."
      ],
      terms: [T.unifiedArchitecture("underlying technology")],
      takeaways: [
        "One unified platform serves many markets — rivals usually offer just one piece.",
        "That breadth and performance is why customers pick NVIDIA over competitors."
      ]
    },
    {
      id: "bonus-vp-choose-ecosystem",
      sentences: [
        "The large and growing number of developers and installed base across our platforms increases the value of our platform to our customers."
      ],
      terms: [T.ecosystem("developers"), T.installedBase("installed base")],
      takeaways: [
        "Everyone already builds on NVIDIA, so it keeps getting more useful.",
        "A rival must match that whole community — not just one chip."
      ]
    }
  ],
  [digDeeperKey("explain-value-prop", 2)]: [
    {
      id: "bonus-vp-disappear",
      sentences: [
        "The world's leading cloud service providers, or CSPs, and consumer internet companies use our data center-scale accelerated computing platforms.",
        "Enterprises and startups across a broad range of industries use our accelerated computing platforms to build new AI-enabled products and services."
      ],
      terms: [T.csp("cloud service providers"), T.acceleratedComputing("accelerated computing")],
      takeaways: [
        "The biggest cloud, internet and AI companies depend on NVIDIA to run.",
        "If NVIDIA vanished, huge parts of today's AI would grind to a halt."
      ]
    }
  ],
  [digDeeperKey("explain-value-prop", 3)]: [
    {
      id: "bonus-vp-dependence",
      sentences: [
        "The large and growing number of developers and installed base across our platforms strengthens our ecosystem and increases the value of our platform to our customers."
      ],
      terms: [T.ecosystem("ecosystem"), T.installedBase("installed base")],
      takeaways: [
        "Millions of developers build their work directly on NVIDIA's platform.",
        "Moving away means rewriting everything — so customers are deeply dependent."
      ]
    },
    {
      id: "bonus-vp-dependence-cuda",
      sentences: [
        "Our full-stack includes the foundational CUDA programming model that runs on all NVIDIA GPUs."
      ],
      terms: [T.cuda("CUDA"), T.gpu("NVIDIA GPUs")],
      takeaways: [
        "Developers write their software for CUDA, which only runs on NVIDIA chips.",
        "That skill and code lock customers in — a switch is slow and expensive."
      ]
    }
  ],
  [digDeeperKey("explain-value-prop", 4)]: [
    {
      id: "bonus-vp-genuine-need",
      sentences: [
        "It can help solve problems that were previously deemed unsolvable.",
        "GPU-powered AI solutions are being developed by thousands of enterprises to deliver products that would have been immensely difficult or even impossible with traditional coding."
      ],
      terms: [T.gpu("GPU-powered"), T.enterprise("enterprises")],
      takeaways: [
        "NVIDIA tackles real, hard problems that thousands of companies already have.",
        "It's meeting a genuine need — not just manufacturing hype."
      ]
    }
  ],

  /* 📦 Products & Services */
  [digDeeperKey("explain-products", 0)]: [
    {
      id: "bonus-prod-segments",
      sentences: [
        "Our data-center-scale offerings are comprised of compute and networking solutions that can scale to tens of thousands of GPU-accelerated servers.",
        "The GPU was initially used to enable the virtual worlds of video games and films."
      ],
      terms: [T.computeNetworking("compute and networking"), T.gpu("GPU")],
      takeaways: [
        "The business has two sides: data-center compute & networking, and graphics/gaming.",
        "The data-center side is the giant, room-scale computing business."
      ]
    }
  ],
  [digDeeperKey("explain-products", 1)]: [
    {
      id: "bonus-prod-main",
      sentences: [
        "Our full-stack includes the foundational CUDA programming model that runs on all NVIDIA GPUs.",
        "We introduced our first data center CPU, Grace, and a new processor class, the data processing unit, or DPU."
      ],
      terms: [T.gpu("NVIDIA GPUs"), T.cpu("CPU"), T.dpu("DPU")],
      takeaways: [
        "The main products are chips — GPUs, plus the Grace CPU and the DPU.",
        "NVIDIA also makes CUDA, the software that runs on those chips."
      ]
    }
  ],
  [digDeeperKey("explain-products", 2)]: [
    {
      id: "bonus-prod-both",
      sentences: [
        "NVIDIA has a platform strategy, bringing together hardware, systems, software, algorithms, libraries, and services to create unique value."
      ],
      terms: [T.platformStrategy("platform strategy"), T.softwareStack("software")],
      takeaways: [
        "Both — NVIDIA sells hardware and software plus services.",
        "It's a whole platform, not a single product."
      ]
    }
  ],
  [digDeeperKey("explain-products", 3)]: [
    {
      id: "bonus-prod-important",
      sentences: [
        "This type of data center architecture and scale is needed for the development and deployment of modern AI applications."
      ],
      terms: [T.dataCenterScale("data center architecture and scale")],
      takeaways: [
        "The data-center AI platform is the most important product today.",
        "It's the infrastructure modern AI can't run without."
      ]
    }
  ],
  [digDeeperKey("explain-products", 4)]: [
    {
      id: "bonus-prod-diverse",
      sentences: [
        "The programmable nature of our architecture allows us to support several multi-billion-dollar end markets with the same underlying technology."
      ],
      terms: [T.unifiedArchitecture("underlying technology")],
      takeaways: [
        "One core architecture powers many multi-billion-dollar markets.",
        "The portfolio is broad but efficient — diversified on a single platform."
      ]
    }
  ],

  /* 💰 How It Makes Money */
  [digDeeperKey("explain-makes-money", 0)]: [
    {
      id: "bonus-money-sources",
      sentences: [
        "NVIDIA has a platform strategy, bringing together hardware, systems, software, algorithms, libraries, and services.",
        "We support several multi-billion-dollar end markets with the same underlying technology."
      ],
      terms: [T.platformStrategy("platform strategy"), T.unifiedArchitecture("underlying technology")],
      takeaways: [
        "Revenue comes from selling hardware, software and services across several markets.",
        "The same technology is reused to earn from many end markets."
      ]
    }
  ],
  [digDeeperKey("explain-makes-money", 1)]: [
    {
      id: "bonus-money-biggest",
      sentences: [
        "The world's leading cloud service providers, or CSPs, and consumer internet companies use our data center-scale accelerated computing platforms."
      ],
      terms: [T.csp("cloud service providers"), T.dataCenterScale("data center-scale")],
      takeaways: [
        "The data-center business — selling to cloud giants — is the biggest earner.",
        "That's where the largest customers spend."
      ]
    }
  ],
  [digDeeperKey("explain-makes-money", 2)]: [
    {
      id: "bonus-money-diversified",
      sentences: [
        "The programmable nature of our architecture allows us to support several multi-billion-dollar end markets with the same underlying technology."
      ],
      terms: [T.unifiedArchitecture("underlying technology")],
      takeaways: [
        "Yes — revenue spans several multi-billion-dollar markets.",
        "One platform, many income streams."
      ]
    }
  ],
  [digDeeperKey("explain-makes-money", 3)]: [
    {
      id: "bonus-money-top-market",
      sentences: [
        "This type of data center architecture and scale is needed for the development and deployment of modern AI applications."
      ],
      terms: [T.dataCenterScale("data center architecture and scale")],
      takeaways: [
        "The Data Center / AI market contributes the most.",
        "It's essential infrastructure for modern AI, so demand is huge."
      ]
    }
  ],
  [digDeeperKey("explain-makes-money", 4)]: [
    {
      id: "bonus-money-growth-driver",
      sentences: [
        "With the advent of generative AI, we expect a broader set of PC users to choose NVIDIA GPUs for running generative AI applications locally on their PC."
      ],
      terms: [T.generativeAI("generative AI"), T.gpu("NVIDIA GPUs")],
      takeaways: [
        "Growth is driven by big new opportunities like generative AI.",
        "New AI use cases keep expanding who needs NVIDIA."
      ]
    }
  ],

  /* 👥 Customers */
  [digDeeperKey("explain-customers", 0)]: [
    {
      id: "bonus-cust-core",
      sentences: [
        "The world's leading cloud service providers, or CSPs, and consumer internet companies use our data center-scale accelerated computing platforms."
      ],
      terms: [T.csp("cloud service providers"), T.dataCenterScale("data center-scale")],
      takeaways: [
        "The core customers are the giant cloud and internet companies.",
        "They run NVIDIA platforms to serve billions of users."
      ]
    }
  ],
  [digDeeperKey("explain-customers", 1)]: [
    {
      id: "bonus-cust-b2b-b2c",
      sentences: [
        "Enterprises and startups across a broad range of industries use our accelerated computing platforms.",
        "Gamers choose NVIDIA GPUs to enjoy immersive, increasingly cinematic virtual worlds."
      ],
      terms: [T.enterprise("Enterprises"), T.gpu("NVIDIA GPUs")],
      takeaways: [
        "Both — big enterprises and startups, plus everyday consumers like gamers.",
        "NVIDIA sells to companies and individuals."
      ]
    }
  ],
  [digDeeperKey("explain-customers", 2)]: [
    {
      id: "bonus-cust-segments",
      sentences: [
        "Enterprises and startups across a broad range of industries use our accelerated computing platforms.",
        "Professional artists, architects and designers use NVIDIA partner products accelerated with our GPUs."
      ],
      terms: [T.enterprise("Enterprises"), T.professionalVisualization("Professional artists, architects and designers")],
      takeaways: [
        "Yes — many segments: clouds, enterprises, researchers, gamers and creative pros.",
        "That variety spreads NVIDIA's risk."
      ]
    }
  ],
  [digDeeperKey("explain-customers", 3)]: [
    {
      id: "bonus-cust-concentration",
      sentences: [
        "The world's leading cloud service providers and consumer internet companies use our platforms.",
        "Enterprises and startups across a broad range of industries also use them."
      ],
      terms: [T.csp("cloud service providers"), T.enterprise("Enterprises")],
      takeaways: [
        "The base is broad across industries, but a handful of huge cloud customers are especially important.",
        "So it's diversified, yet leans on a few giant buyers."
      ]
    }
  ],
  [digDeeperKey("explain-customers", 4)]: [
    {
      id: "bonus-cust-loyalty",
      sentences: [
        "The large and growing number of developers and installed base across our platforms strengthens our ecosystem and increases the value of our platform to our customers."
      ],
      terms: [T.ecosystem("ecosystem"), T.installedBase("installed base")],
      takeaways: [
        "Customers stick around because everything they build runs on NVIDIA's platform.",
        "The bigger the ecosystem, the harder it is to leave."
      ]
    }
  ],

  /* 🌍 Where It Operates */
  [digDeeperKey("explain-where-operates", 0)]: [
    {
      id: "bonus-where-countries",
      sentences: [
        "Headquartered in Santa Clara, California, NVIDIA was incorporated in California in April 1993.",
        "NVIDIA powers over 75% of the supercomputers on the global TOP500 list."
      ],
      terms: [T.supercomputer("supercomputers")],
      takeaways: [
        "NVIDIA is based in California but operates globally.",
        "Its tech runs the majority of the world's top supercomputers."
      ]
    }
  ],
  [digDeeperKey("explain-where-operates", 1)]: [
    {
      id: "bonus-where-industries",
      sentences: [
        "Our software stack accelerates workloads with vertical-specific optimizations to address industries ranging from healthcare and telecom to automotive and manufacturing."
      ],
      terms: [T.vertical("healthcare and telecom")],
      takeaways: [
        "NVIDIA serves many industries — healthcare, telecom, automotive, manufacturing and more.",
        "Its tech is general-purpose across sectors."
      ]
    }
  ],
  [digDeeperKey("explain-where-operates", 2)]: [
    {
      id: "bonus-where-regions",
      sentences: [
        "The world's leading cloud service providers and consumer internet companies use our data center-scale platforms.",
        "NVIDIA powers over 75% of the supercomputers on the global TOP500 list."
      ],
      terms: [T.csp("cloud service providers"), T.supercomputer("supercomputers")],
      takeaways: [
        "Its biggest customers are global cloud leaders, so major tech regions matter most.",
        "Demand is worldwide, led by where the big clouds build."
      ]
    }
  ],
  [digDeeperKey("explain-where-operates", 3)]: [
    {
      id: "bonus-where-expand",
      sentences: [
        "Generative AI is expanding the market for our workstation-class GPUs.",
        "We expect a broader set of PC users to choose NVIDIA GPUs for running generative AI applications locally."
      ],
      terms: [T.generativeAI("Generative AI"), T.gpu("NVIDIA GPUs")],
      takeaways: [
        "Yes — new AI use cases keep opening new markets.",
        "Generative AI is expanding demand from data centers to PCs and workstations."
      ]
    }
  ],

  /* 🚀 How It Has Evolved */
  [digDeeperKey("explain-evolution", 0)]: [
    {
      id: "bonus-evo-turning-points",
      sentences: [
        "Our invention of the GPU in 1999 sparked the growth of the PC gaming market.",
        "With our introduction of the CUDA programming model in 2006, we paved the way for the emergence of modern AI."
      ],
      terms: [T.gpu("GPU"), T.cuda("CUDA")],
      takeaways: [
        "Key turning points: inventing the GPU (1999) and launching CUDA (2006).",
        "Those set up both PC gaming and the AI era."
      ]
    }
  ],
  [digDeeperKey("explain-evolution", 1)]: [
    {
      id: "bonus-evo-innovations",
      sentences: [
        "With CUDA in 2006, we opened the parallel processing capabilities of our GPU to a broad range of compute-intensive applications.",
        "We introduced our first Tensor Core GPU in 2017, built for the new era of AI."
      ],
      terms: [T.cuda("CUDA"), T.parallelProcessing("parallel processing")],
      takeaways: [
        "CUDA and the Tensor Core GPU turned a graphics company into an AI company.",
        "They made NVIDIA chips ideal for AI."
      ]
    }
  ],
  [digDeeperKey("explain-evolution", 2)]: [
    {
      id: "bonus-evo-acquisitions",
      sentences: [
        "Our acquisition of Mellanox in 2020 enabled our platforms to be data center scale and led to a new processor class, the data processing unit, or DPU."
      ],
      terms: [T.acquisition("acquisition"), T.dpu("DPU")],
      takeaways: [
        "Buying Mellanox (2020) added networking and made NVIDIA data-center scale.",
        "It also created the DPU."
      ]
    }
  ],
  [digDeeperKey("explain-evolution", 3)]: [
    {
      id: "bonus-evo-adapt",
      sentences: [
        "The GPU was initially used to simulate human imagination; today it also simulates human intelligence.",
        "In 2023, we introduced our first data center CPU, Grace, built for giant-scale AI."
      ],
      terms: [T.gpu("GPU"), T.cpu("CPU")],
      takeaways: [
        "NVIDIA shifted its GPU from gaming to AI as the world changed.",
        "It keeps adding new chips (like the Grace CPU) for each new era."
      ]
    }
  ],

  /* 📈 Future Growth */
  [digDeeperKey("explain-future-growth", 0)]: [
    {
      id: "bonus-growth-runway",
      sentences: [
        "We support several multi-billion-dollar end markets with the same underlying technology.",
        "With generative AI, we expect a broader set of PC users to choose NVIDIA GPUs."
      ],
      terms: [T.generativeAI("generative AI"), T.gpu("NVIDIA GPUs")],
      takeaways: [
        "Yes — many multi-billion-dollar markets plus new AI demand mean a long runway.",
        "Generative AI keeps widening who needs NVIDIA."
      ]
    }
  ],
  [digDeeperKey("explain-future-growth", 1)]: [
    {
      id: "bonus-growth-markets",
      sentences: [
        "This form of AI can serve as the brain of computers, robots, and self-driving cars.",
        "Enterprises use our platforms to build new generative and agentic AI products and services."
      ],
      terms: [T.autonomousVehicle("self-driving cars"), T.generativeAI("generative")],
      takeaways: [
        "Huge opportunities: enterprise AI, robotics and self-driving cars.",
        "AI is spreading into every industry."
      ]
    }
  ],
  [digDeeperKey("explain-future-growth", 2)]: [
    {
      id: "bonus-growth-vs-industry",
      sentences: [
        "NVIDIA powers over 75% of the supercomputers on the global TOP500 list.",
        "NVIDIA computing supports more than 4,400 applications."
      ],
      terms: [T.supercomputer("supercomputers")],
      takeaways: [
        "NVIDIA already leads its field — powering most top supercomputers.",
        "Broad adoption suggests it's outgrowing rivals."
      ]
    }
  ],
  [digDeeperKey("explain-future-growth", 3)]: [
    {
      id: "bonus-growth-sustainable",
      sentences: [
        "We have invested over $58.2 billion in research and development since our inception.",
        "The large and growing number of developers and installed base strengthens our ecosystem."
      ],
      terms: [T.rnd("research and development"), T.ecosystem("ecosystem")],
      takeaways: [
        "Heavy R&D plus a growing developer ecosystem make growth durable.",
        "Each new user makes the platform more valuable."
      ]
    }
  ],
  [digDeeperKey("explain-future-growth", 4)]: [
    {
      id: "bonus-growth-new-industries",
      sentences: [
        "Our software stack includes vertical-specific optimizations to address industries ranging from healthcare and telecom to automotive and manufacturing."
      ],
      terms: [T.vertical("healthcare and telecom")],
      takeaways: [
        "Yes — NVIDIA tailors its platform for new industries.",
        "It keeps expanding into healthcare, automotive, manufacturing and beyond."
      ]
    }
  ],

  /* 🏆 Competitive Advantage */
  [digDeeperKey("explain-competitive-advantage", 0)]: [
    {
      id: "bonus-moat-advantage",
      sentences: [
        "We address diverse end markets with a unified underlying architecture leveraging our GPUs, networking and software stacks."
      ],
      terms: [T.unifiedArchitecture("unified underlying architecture"), T.gpu("GPUs")],
      takeaways: [
        "Its edge is one unified platform spanning chips, networking and software.",
        "Rivals usually sell just one piece."
      ]
    }
  ],
  [digDeeperKey("explain-competitive-advantage", 1)]: [
    {
      id: "bonus-moat-source",
      sentences: [
        "The large and growing number of developers and installed base across our platforms strengthens our ecosystem."
      ],
      terms: [T.ecosystem("ecosystem"), T.installedBase("installed base")],
      takeaways: [
        "The moat is its ecosystem — developers and installed base.",
        "More users make it more valuable, which attracts more users."
      ]
    }
  ],
  [digDeeperKey("explain-competitive-advantage", 2)]: [
    {
      id: "bonus-moat-copy",
      sentences: [
        "We have invested over $58.2 billion in research and development since our inception, yielding inventions that are essential to modern computing."
      ],
      terms: [T.rnd("research and development")],
      takeaways: [
        "Not easily — decades and $58 billion of R&D are hard to replicate.",
        "Copying the whole platform would take years."
      ]
    }
  ],
  [digDeeperKey("explain-competitive-advantage", 3)]: [
    {
      id: "bonus-moat-pricing",
      sentences: [
        "The large and growing number of developers and installed base increases the value of our platform to our customers."
      ],
      terms: [T.installedBase("installed base"), T.ecosystem("developers")],
      takeaways: [
        "Because its platform is more valuable and hard to replace, NVIDIA can charge premium prices.",
        "Lock-in supports pricing power."
      ]
    }
  ],
  [digDeeperKey("explain-competitive-advantage", 4)]: [
    {
      id: "bonus-moat-network",
      sentences: [
        "The large and growing number of developers and installed base across our platforms strengthens our ecosystem and increases the value of our platform to our customers."
      ],
      terms: [T.ecosystem("ecosystem"), T.installedBase("installed base")],
      takeaways: [
        "Yes — more developers attract more users, and vice versa.",
        "That's a classic network effect."
      ]
    }
  ],
  [digDeeperKey("explain-competitive-advantage", 5)]: [
    {
      id: "bonus-moat-switching",
      sentences: [
        "Our full-stack includes the foundational CUDA programming model that runs on all NVIDIA GPUs.",
        "The large developer base and installed base strengthen our ecosystem."
      ],
      terms: [T.cuda("CUDA"), T.installedBase("installed base")],
      takeaways: [
        "Switching means rewriting software built on CUDA — costly and slow.",
        "So customers tend to stay."
      ]
    }
  ],
  [digDeeperKey("explain-competitive-advantage", 6)]: [
    {
      id: "bonus-moat-protect",
      sentences: [
        "We drive fast, harmonized product and technology innovations across silicon, systems, networking, software and algorithms.",
        "More than half of our engineers work on software."
      ],
      terms: [T.softwareStack("software"), T.rnd("innovations")],
      takeaways: [
        "It stays ahead by out-innovating across the whole stack.",
        "Over half its engineers write software, deepening the platform lead."
      ]
    }
  ],
  [digDeeperKey("explain-competitive-advantage", 7)]: [
    {
      id: "bonus-moat-ip",
      sentences: [
        "Our $58.2 billion of research and development has yielded inventions that are essential to modern computing."
      ],
      terms: [T.rnd("research and development")],
      takeaways: [
        "Decades of R&D produced inventions central to modern computing.",
        "That intellectual property is a major asset."
      ]
    }
  ],
  [digDeeperKey("explain-competitive-advantage", 8)]: [
    {
      id: "bonus-moat-new-tech",
      sentences: [
        "We drive fast, yet harmonized, product and technology innovations in all dimensions of computing including silicon, systems, networking, software and algorithms."
      ],
      terms: [T.rnd("technology innovations")],
      takeaways: [
        "New tech is always a risk, but NVIDIA innovates across every layer to stay ahead.",
        "Its broad platform is harder to leapfrog than a single chip."
      ]
    }
  ],

  /* ⚙️ How It Operates */
  [digDeeperKey("explain-how-operates", 0)]: [
    {
      id: "bonus-ops-manufacture",
      sentences: [
        "We utilize a fabless and contracting manufacturing strategy.",
        "We use foundries such as TSMC and Samsung to produce our semiconductor wafers."
      ],
      terms: [T.fabless("fabless"), T.foundry("foundries")],
      takeaways: [
        "NVIDIA designs chips but hires factories (foundries) like TSMC to build them.",
        "It's 'fabless' — no chip factories of its own."
      ]
    }
  ],
  [digDeeperKey("explain-how-operates", 1)]: [
    {
      id: "bonus-ops-own-factories",
      sentences: [
        "We utilize a fabless and contracting manufacturing strategy, avoiding the costs and risks of owning manufacturing operations."
      ],
      terms: [T.fabless("fabless")],
      takeaways: [
        "No — it doesn't own factories.",
        "That keeps costs and risks lower."
      ]
    }
  ],
  [digDeeperKey("explain-how-operates", 2)]: [
    {
      id: "bonus-ops-suppliers",
      sentences: [
        "Our supply chain is mainly concentrated in the Asia-Pacific region.",
        "We use foundries such as TSMC and Samsung to produce our semiconductor wafers."
      ],
      terms: [T.supplyChain("supply chain"), T.foundry("foundries")],
      takeaways: [
        "Very dependent — it relies on a few Asian foundries, especially TSMC.",
        "That concentration is a key risk."
      ]
    }
  ],
  [digDeeperKey("explain-how-operates", 3)]: [
    {
      id: "bonus-ops-resilient",
      sentences: [
        "Our supply chain is mainly concentrated in the Asia-Pacific region."
      ],
      terms: [T.supplyChain("supply chain")],
      takeaways: [
        "It's efficient but concentrated in one region.",
        "Concentration can be a resilience weakness."
      ]
    }
  ],
  [digDeeperKey("explain-how-operates", 4)]: [
    {
      id: "bonus-ops-scalable",
      sentences: [
        "The programmable nature of our architecture allows us to support several multi-billion-dollar end markets with the same underlying technology.",
        "More than half of our engineers work on software."
      ],
      terms: [T.unifiedArchitecture("underlying technology"), T.softwareStack("software")],
      takeaways: [
        "Highly scalable — one platform serves many markets, and software scales cheaply.",
        "Being fabless lets it grow without building factories."
      ]
    }
  ],
  [digDeeperKey("explain-how-operates", 5)]: [
    {
      id: "bonus-ops-risks",
      sentences: [
        "Our supply chain is mainly concentrated in the Asia-Pacific region.",
        "We use foundries such as TSMC and Samsung to produce our semiconductor wafers."
      ],
      terms: [T.supplyChain("supply chain"), T.foundry("foundries")],
      takeaways: [
        "The biggest risk is supply-chain concentration in Asia and reliance on a few foundries.",
        "Any disruption there could hurt production."
      ]
    }
  ]
};

/** Evidence for a specific Bonus Investigation (bespoke or parent fallback). */
export function resolveBonusInvestigationEvidence(
  questionId: InvestorNotebookQuestionId,
  index: number
): readonly HqDecodeEvidencePiece[] {
  const override = BONUS_EVIDENCE_OVERRIDES[digDeeperKey(questionId, index)];
  return override ?? resolveHqDecodeEvidence(questionId);
}

export function hasBespokeBonusEvidence(
  questionId: InvestorNotebookQuestionId,
  index: number
): boolean {
  return Boolean(BONUS_EVIDENCE_OVERRIDES[digDeeperKey(questionId, index)]);
}

/** The Dig Deeper prompt for this investigation, company-filled. */
export function resolveBonusInvestigationPrompt(
  questionId: InvestorNotebookQuestionId,
  index: number,
  companyName: string
): string {
  const question = INVESTOR_NOTEBOOK_QUESTIONS.find((q) => q.id === questionId);
  const template = question?.digDeeperTemplates[index];
  return template
    ? formatInvestorNotebookQuestion(template, companyName)
    : "Explain your finding in your own words.";
}

/**
 * Lenient inline Analyst Challenge for a Bonus Investigation.
 * Keywords come from the investigation's own evidence terms.
 */
export function buildBonusInvestigationChallenge(
  questionId: InvestorNotebookQuestionId,
  index: number,
  companyName: string
): InvestorChallengeDef {
  const prompt = resolveBonusInvestigationPrompt(questionId, index, companyName);
  const evidence = resolveBonusInvestigationEvidence(questionId, index);
  const keywords = Array.from(
    new Set(
      evidence.flatMap((piece) =>
        piece.terms.flatMap((term) => term.recallKeywords)
      )
    )
  );

  return {
    // principleId is unused by the evaluator; cast to satisfy the type.
    principleId: "business-purpose",
    prompt,
    minWords: 3,
    conceptGroups: [{ label: "the key idea", keywords }]
  } as InvestorChallengeDef;
}
