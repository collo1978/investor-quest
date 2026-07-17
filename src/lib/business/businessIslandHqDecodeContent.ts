/**
 * Business Island Decode — multi-evidence missions extracted from NVIDIA's
 * 10-K Business section, one evidence set per Investor Checklist question.
 *
 * Rules for evidence quotes:
 * - Preserve the company's wording; trim examples, repetition and marketing.
 * - 1–3 short sentences per Evidence File; one idea each.
 * - `phrase` values must be exact (case-sensitive) substrings of a sentence.
 */

import type { InvestorNotebookQuestionId } from "@/lib/business/businessIslandInvestorNotebook";

export type HqDecodeTermDef = {
  id: string;
  /** Exact substring in the evidence text (case-sensitive). */
  phrase: string;
  title: string;
  /** Plain-English explanation shown when the card expands. */
  explanation: string;
  /**
   * Plain-English stems/phrases that signal the learner recalled the term.
   * Used by the lenient recall evaluator when a term reappears in the mission.
   */
  recallKeywords: readonly string[];
};

export type HqDecodeEvidencePiece = {
  id: string;
  /** Exact company sentences shown in the Official 10-K panel. */
  sentences: readonly string[];
  terms: readonly HqDecodeTermDef[];
  /** Plain-English takeaways after Decode. */
  takeaways: readonly string[];
  /** Optional real-world analogy/example to cement understanding. */
  analogy?: string;
  /** Optional one-liner on why an investor should care (legacy; unused in UI). */
  whyThisMatters?: string;
};

/* -------------------------------------------------------------------------- */
/* Shared term library — reused across questions so repeats trigger recall.    */
/* -------------------------------------------------------------------------- */

type TermSpec = {
  title: string;
  explanation: string;
  recallKeywords: readonly string[];
};

const TERM_LIBRARY = {
  "accelerated-computing": {
    title: "Accelerated Computing",
    explanation:
      "Using special chips to solve hard computing problems far faster than ordinary computers.",
    recallKeywords: [
      "fast",
      "faster",
      "speed",
      "quick",
      "special",
      "hard",
      "difficult",
      "problem",
      "powerful"
    ]
  },
  "full-stack": {
    title: "Full-Stack",
    explanation:
      "Building the whole chain — chips, software, systems and services — so customers get a complete platform, not just one piece.",
    recallKeywords: [
      "whole",
      "everything",
      "complete",
      "all",
      "chip",
      "software",
      "system",
      "service",
      "hardware",
      "platform",
      "stack",
      "end to end"
    ]
  },
  "data-center-scale": {
    title: "Data-Center-Scale",
    explanation:
      "Products built to power entire server rooms and cloud facilities — not just one laptop or phone.",
    recallKeywords: [
      "data cent",
      "server",
      "cloud",
      "big",
      "large",
      "huge",
      "facilit",
      "warehouse",
      "scale",
      "room"
    ]
  },
  gpu: {
    title: "GPU",
    explanation:
      "NVIDIA's specialised chip that does thousands of calculations at once — great for graphics and AI.",
    recallKeywords: [
      "chip",
      "processor",
      "graphics",
      "fast",
      "hardware",
      "gpu",
      "parallel",
      "game",
      "ai"
    ]
  },
  "parallel-processing": {
    title: "Parallel Processing",
    explanation:
      "Doing thousands of small tasks at the same time instead of one after another.",
    recallKeywords: [
      "same time",
      "at once",
      "many",
      "thousand",
      "parallel",
      "simultaneous",
      "together",
      "fast"
    ]
  },
  "deep-learning": {
    title: "Deep Learning",
    explanation:
      "A kind of AI where software teaches itself by studying huge amounts of data.",
    recallKeywords: [
      "ai",
      "learn",
      "train",
      "data",
      "itself",
      "pattern",
      "neural",
      "teach"
    ]
  },
  cuda: {
    title: "CUDA",
    explanation:
      "NVIDIA's software that lets programmers use its chips for all kinds of computing, not just graphics.",
    recallKeywords: [
      "software",
      "language",
      "program",
      "code",
      "tool",
      "platform",
      "developer",
      "instruction"
    ]
  },
  ecosystem: {
    title: "Ecosystem",
    explanation:
      "The whole community of developers, partners and tools built around a product.",
    recallKeywords: [
      "community",
      "developer",
      "partner",
      "tool",
      "network",
      "around",
      "everyone",
      "together"
    ]
  },
  "installed-base": {
    title: "Installed Base",
    explanation: "All the customers already using a company's products right now.",
    recallKeywords: [
      "already",
      "existing",
      "current",
      "customer",
      "using",
      "base",
      "user"
    ]
  },
  "compute-networking": {
    title: "Compute & Networking Segment",
    explanation:
      "NVIDIA's biggest business — data-center chips, AI systems and networking.",
    recallKeywords: [
      "data cent",
      "ai",
      "network",
      "server",
      "compute",
      "chip",
      "biggest"
    ]
  },
  "graphics-segment": {
    title: "Graphics Segment",
    explanation:
      "NVIDIA's gaming and design business — GeForce and RTX GPUs.",
    recallKeywords: [
      "gaming",
      "game",
      "graphics",
      "geforce",
      "rtx",
      "design",
      "visual"
    ]
  },
  cpu: {
    title: "CPU",
    explanation: "The general-purpose 'main' processor of a computer.",
    recallKeywords: [
      "processor",
      "chip",
      "main",
      "brain",
      "general",
      "compute",
      "cpu"
    ]
  },
  dpu: {
    title: "DPU",
    explanation:
      "A chip that handles data movement and networking so the main chips can focus on computing.",
    recallKeywords: [
      "data",
      "network",
      "chip",
      "move",
      "processor",
      "offload",
      "dpu"
    ]
  },
  "ai-enterprise": {
    title: "AI Enterprise",
    explanation:
      "NVIDIA's paid software suite that helps companies build and run AI.",
    recallKeywords: [
      "software",
      "suite",
      "paid",
      "license",
      "subscription",
      "enterprise",
      "ai",
      "tool"
    ]
  },
  "dgx-cloud": {
    title: "DGX Cloud",
    explanation:
      "Renting NVIDIA's AI computers over the internet instead of buying them.",
    recallKeywords: [
      "cloud",
      "rent",
      "internet",
      "service",
      "online",
      "subscription",
      "access"
    ]
  },
  systems: {
    title: "Systems, Subsystems & Modules",
    explanation:
      "Selling hardware in different sizes — from small parts to complete machines.",
    recallKeywords: [
      "hardware",
      "system",
      "part",
      "machine",
      "module",
      "build",
      "sell"
    ]
  },
  "professional-visualization": {
    title: "Professional Visualization",
    explanation:
      "Powerful graphics for designers, architects and film creators.",
    recallKeywords: [
      "design",
      "architect",
      "creator",
      "3d",
      "film",
      "visual",
      "graphics",
      "professional"
    ]
  },
  ip: {
    title: "Intellectual Property (IP)",
    explanation:
      "A company's inventions and ideas, legally protected as valuable assets.",
    recallKeywords: [
      "invention",
      "idea",
      "patent",
      "design",
      "protect",
      "own",
      "license",
      "property"
    ]
  },
  csp: {
    title: "Cloud Service Provider (CSP)",
    explanation:
      "Big companies that rent out computing power over the internet (the major clouds).",
    recallKeywords: [
      "cloud",
      "rent",
      "internet",
      "big",
      "provider",
      "host",
      "service",
      "hyperscaler"
    ]
  },
  enterprise: {
    title: "Enterprise",
    explanation: "A regular business or large company (not a consumer).",
    recallKeywords: [
      "business",
      "company",
      "firm",
      "organisation",
      "organization",
      "corporate",
      "large"
    ]
  },
  "generative-ai": {
    title: "Generative AI",
    explanation:
      "AI that creates new things — text, images, code, audio or video.",
    recallKeywords: [
      "create",
      "generate",
      "new",
      "content",
      "text",
      "image",
      "chatbot",
      "make"
    ]
  },
  oem: {
    title: "OEM",
    explanation:
      "A company that builds finished products using another company's parts.",
    recallKeywords: [
      "build",
      "maker",
      "manufacturer",
      "finished",
      "partner",
      "assemble",
      "product"
    ]
  },
  vertical: {
    title: "Vertical (Industry)",
    explanation:
      "A specific industry a product is tailored for, like healthcare or automotive.",
    recallKeywords: [
      "industry",
      "sector",
      "field",
      "market",
      "healthcare",
      "specific",
      "area"
    ]
  },
  "on-premises": {
    title: "On-Premises",
    explanation:
      "Running computers inside a company's own building, not in the cloud.",
    recallKeywords: [
      "own",
      "building",
      "local",
      "site",
      "in house",
      "onsite",
      "premises",
      "physical"
    ]
  },
  edge: {
    title: "Edge",
    explanation:
      "Computing done close to where data is created, not in a distant data center.",
    recallKeywords: [
      "close",
      "local",
      "near",
      "device",
      "site",
      "edge",
      "onsite"
    ]
  },
  "supply-chain": {
    title: "Supply Chain",
    explanation:
      "The full network of suppliers and factories that make and deliver a product.",
    recallKeywords: [
      "supplier",
      "factory",
      "make",
      "deliver",
      "source",
      "chain",
      "logistics",
      "produce"
    ]
  },
  "neural-network": {
    title: "Neural Network",
    explanation:
      "AI software loosely modelled on how the human brain's cells connect.",
    recallKeywords: [
      "brain",
      "ai",
      "learn",
      "layer",
      "network",
      "neuron",
      "model",
      "train"
    ]
  },
  acquisition: {
    title: "Acquisition",
    explanation: "Buying another company to gain its technology or people.",
    recallKeywords: [
      "buy",
      "bought",
      "purchase",
      "acquire",
      "takeover",
      "merge",
      "company"
    ]
  },
  training: {
    title: "Training (AI)",
    explanation: "Teaching an AI model by showing it huge amounts of data.",
    recallKeywords: [
      "teach",
      "learn",
      "data",
      "model",
      "train",
      "build",
      "practice"
    ]
  },
  inference: {
    title: "Inference (AI)",
    explanation:
      "Using a trained AI model to actually answer or make predictions.",
    recallKeywords: [
      "use",
      "run",
      "answer",
      "predict",
      "apply",
      "result",
      "output"
    ]
  },
  "autonomous-vehicle": {
    title: "Autonomous Vehicle (AV)",
    explanation: "A self-driving car that uses AI to drive itself.",
    recallKeywords: [
      "self driving",
      "self-driving",
      "car",
      "drive",
      "auto",
      "vehicle",
      "robot",
      "ai"
    ]
  },
  "digital-twin": {
    title: "Digital Twin",
    explanation:
      "An exact virtual copy of a real thing, used to test ideas safely.",
    recallKeywords: [
      "virtual",
      "copy",
      "simulation",
      "model",
      "replica",
      "test",
      "3d",
      "mirror"
    ]
  },
  omniverse: {
    title: "Omniverse",
    explanation:
      "NVIDIA's platform for building virtual 3D worlds and simulations.",
    recallKeywords: [
      "virtual",
      "3d",
      "simulation",
      "world",
      "platform",
      "design",
      "digital"
    ]
  },
  "virtuous-cycle": {
    title: "Virtuous Cycle",
    explanation:
      "A loop where success creates more success — a self-feeding snowball.",
    recallKeywords: [
      "loop",
      "snowball",
      "self",
      "more",
      "cycle",
      "reinforce",
      "grow",
      "feed"
    ]
  },
  patent: {
    title: "Patent",
    explanation: "A legal right that stops others from copying an invention.",
    recallKeywords: [
      "legal",
      "protect",
      "invention",
      "right",
      "copy",
      "exclusive",
      "law"
    ]
  },
  fabless: {
    title: "Fabless",
    explanation:
      "Designing chips but paying other factories to actually build them.",
    recallKeywords: [
      "design",
      "factory",
      "no factory",
      "outsource",
      "build",
      "make",
      "hire",
      "without"
    ]
  },
  "product-design": {
    title: "Product Design",
    explanation:
      "Creating and engineering the product itself, rather than manufacturing it.",
    recallKeywords: [
      "design",
      "create",
      "engineer",
      "develop",
      "build",
      "plan",
      "make"
    ]
  },
  foundry: {
    title: "Foundry",
    explanation:
      "A factory that manufactures computer chips for other companies.",
    recallKeywords: [
      "factory",
      "make",
      "manufacture",
      "chip",
      "produce",
      "plant",
      "fab"
    ]
  },
  "semiconductor-wafer": {
    title: "Semiconductor Wafer",
    explanation:
      "The thin disc of silicon that computer chips are built on.",
    recallKeywords: [
      "silicon",
      "chip",
      "disc",
      "wafer",
      "semiconductor",
      "material"
    ]
  },
  "partner-network": {
    title: "Partner Network",
    explanation:
      "The web of outside companies that sell and deliver NVIDIA's products.",
    recallKeywords: [
      "partner",
      "network",
      "sell",
      "deliver",
      "reseller",
      "channel",
      "distributor"
    ]
  }
} satisfies Record<string, TermSpec>;

type TermId = keyof typeof TERM_LIBRARY;

/** Build a decode term from the shared library with a per-evidence phrase. */
function term(id: TermId, phrase: string): HqDecodeTermDef {
  const spec = TERM_LIBRARY[id];
  return {
    id,
    phrase,
    title: spec.title,
    explanation: spec.explanation,
    recallKeywords: spec.recallKeywords
  };
}

/* -------------------------------------------------------------------------- */
/* Evidence per Investor Checklist question.                                   */
/* -------------------------------------------------------------------------- */

export const HQ_DECODE_EVIDENCE_BY_QUESTION: Record<
  InvestorNotebookQuestionId,
  readonly HqDecodeEvidencePiece[]
> = {
  "explain-what-does": [
    {
      id: "what-identity",
      sentences: [
        "NVIDIA is now a full-stack computing infrastructure company with data-center-scale offerings."
      ],
      terms: [term("full-stack", "full-stack"), term("data-center-scale", "data-center-scale")],
      takeaways: [
        "NVIDIA builds the whole computing system, not just one part.",
        "It sells everything from chips to room-sized machines."
      ],
      analogy:
        "It's like a car company that also builds the engine, the fuel and the roads — not just one bolt."
    },
    {
      id: "what-gpu-origin",
      sentences: [
        "The GPU was initially used to simulate human imagination, enabling the virtual worlds of video games and films."
      ],
      terms: [term("gpu", "GPU")],
      takeaways: ["NVIDIA's famous chip, the GPU, was first built for video games and movie effects."],
      analogy:
        "It's the same chip that makes your PlayStation game look smooth and run fast — just scaled up."
    },
    {
      id: "what-gpu-ai",
      sentences: [
        "Today, it also simulates human intelligence.",
        "Its parallel processing capabilities are essential for deep learning algorithms."
      ],
      terms: [term("parallel-processing", "parallel processing"), term("deep-learning", "deep learning")],
      takeaways: [
        "The same chip now powers AI.",
        "It does thousands of tasks at once — perfect for machine learning."
      ],
      analogy:
        "A CPU is one super-fast chef; a GPU is a thousand cooks all chopping at once — way faster for big jobs."
    },
    {
      id: "what-cuda",
      sentences: [
        "Our full-stack includes the foundational CUDA programming model that runs on all NVIDIA GPUs."
      ],
      terms: [term("cuda", "CUDA"), term("full-stack", "full-stack")],
      takeaways: ["NVIDIA also makes the software (CUDA) that runs on its own chips."],
      analogy:
        "Like Apple making both the iPhone and iOS — the hardware and software are built to work perfectly together."
    }
  ],
  "explain-value-prop": [
    {
      id: "value-performance",
      sentences: [
        "Our accelerated computing platform can solve complex problems in significantly less time and with lower power consumption than alternative computational approaches.",
        "It can help solve problems that were previously deemed unsolvable."
      ],
      terms: [term("accelerated-computing", "accelerated computing")],
      takeaways: [
        "Customers choose NVIDIA because it's faster and uses less power.",
        "It can even crack problems that were impossible before."
      ],
      analogy:
        "It's like swapping a bicycle for a race car — you reach the finish line in a fraction of the time."
    },
    {
      id: "value-ecosystem",
      sentences: [
        "The large and growing number of developers and installed base across our platforms strengthens our ecosystem and increases the value of our platform to our customers."
      ],
      terms: [term("ecosystem", "ecosystem"), term("installed-base", "installed base")],
      takeaways: [
        "The more people build on NVIDIA, the more valuable it becomes.",
        "That keeps customers coming back."
      ],
      analogy:
        "Like a game console with the most games — everyone buys it because everyone builds for it."
    }
  ],
  "explain-products": [
    {
      id: "products-segments",
      sentences: [
        "The Compute & Networking segment includes our Data Center accelerated computing platforms.",
        "The Graphics segment includes GeForce GPUs for gaming and PCs."
      ],
      terms: [term("compute-networking", "Compute & Networking"), term("graphics-segment", "Graphics segment")],
      takeaways: ["NVIDIA has two halves: data-center/AI computing, and graphics for gaming and design."],
      analogy:
        "Like a company that sells both massive factory machines and home game consoles."
    },
    {
      id: "products-chips",
      sentences: [
        "At the foundation of the NVIDIA accelerated computing platform are our GPUs.",
        "Our data center platform expanded to include DPUs and CPUs."
      ],
      terms: [term("gpu", "GPUs"), term("dpu", "DPUs"), term("cpu", "CPUs")],
      takeaways: ["The core products are chips — GPUs, plus CPUs and DPUs."],
      analogy:
        "Picture a kitchen: the GPU is an army of prep cooks, the CPU is the head chef, and the DPU is the waiters moving food around."
    },
    {
      id: "products-software",
      sentences: [
        "We offer paid licenses to NVIDIA AI Enterprise.",
        "We also offer the NVIDIA DGX Cloud, a fully managed AI-training-as-a-service platform."
      ],
      terms: [term("ai-enterprise", "AI Enterprise"), term("dgx-cloud", "DGX Cloud")],
      takeaways: ["NVIDIA also sells software subscriptions and rents AI computing over the internet."],
      analogy:
        "Like Netflix for AI computing — pay monthly instead of buying the whole cinema."
    }
  ],
  "explain-makes-money": [
    {
      id: "money-systems",
      sentences: [
        "Compute and networking offerings are typically delivered to customers as systems, subsystems, or modules, along with software and services."
      ],
      terms: [term("systems", "systems, subsystems, or modules")],
      takeaways: ["NVIDIA mainly earns by selling hardware — as chips, parts or whole systems — plus software and services."],
      analogy:
        "Like selling the whole gym — machines, membership and personal training — not just one dumbbell."
    },
    {
      id: "money-markets",
      sentences: [
        "Our platforms address four large markets where our expertise is critical: Data Center, Gaming, Professional Visualization, and Automotive."
      ],
      terms: [term("professional-visualization", "Professional Visualization")],
      takeaways: ["Money comes from four markets: Data Center (biggest), Gaming, Pro Visualization and Automotive."],
      analogy:
        "Like a shop with four busy departments — and the Data Center aisle is by far the biggest earner."
    },
    {
      id: "money-ip",
      sentences: [
        "Our IP is a valuable asset that can be accessed by our customers and partners through license and development agreements."
      ],
      terms: [term("ip", "IP")],
      takeaways: ["NVIDIA also earns by licensing its inventions to others."],
      analogy:
        "Like a musician earning royalties every time someone else uses their song."
    }
  ],
  "explain-customers": [
    {
      id: "customers-csp",
      sentences: [
        "The world's leading cloud service providers, or CSPs, and consumer internet companies use our data center-scale accelerated computing platforms."
      ],
      terms: [term("csp", "cloud service providers")],
      takeaways: ["NVIDIA's biggest customers are the giant cloud and internet companies."],
      analogy:
        "Like a power company whose biggest bills come from huge factories, not single homes."
    },
    {
      id: "customers-enterprise",
      sentences: [
        "Enterprises and startups across a broad range of industries use our accelerated computing platforms to build new generative and agentic AI-enabled products and services."
      ],
      terms: [term("enterprise", "Enterprises"), term("generative-ai", "generative")],
      takeaways: ["Companies and startups use NVIDIA to build their own AI products."],
      analogy:
        "Like lots of bakeries buying the same industrial oven to make their own recipes."
    },
    {
      id: "customers-gamers",
      sentences: [
        "Gamers choose NVIDIA GPUs to enjoy immersive, increasingly cinematic virtual worlds."
      ],
      terms: [term("gpu", "NVIDIA GPUs")],
      takeaways: ["Everyday gamers buy NVIDIA for better graphics."],
      analogy:
        "The same reason you'd upgrade your PC to run the latest game on ultra settings."
    },
    {
      id: "customers-partners",
      sentences: [
        "Our direct customers include original equipment manufacturers, or OEMs, original device manufacturers, system integrators and distributors."
      ],
      terms: [term("oem", "original equipment manufacturers")],
      takeaways: ["NVIDIA often sells through partners who build the finished computers."],
      analogy:
        "Like 'Intel inside' laptops — NVIDIA's chips power products that other brands assemble and sell."
    }
  ],
  "explain-where-operates": [
    {
      id: "where-industries",
      sentences: [
        "Vertical-specific optimizations address industries ranging from healthcare and telecom to automotive and manufacturing."
      ],
      terms: [term("vertical", "Vertical")],
      takeaways: ["NVIDIA's tech is used across many industries — healthcare, telecom, cars and factories."],
      analogy:
        "Like electricity — the same power runs hospitals, cars and factories."
    },
    {
      id: "where-deployment",
      sentences: [
        "It is deployed in cloud, hyperscale, on-premises and edge data centers."
      ],
      terms: [term("on-premises", "on-premises"), term("edge", "edge")],
      takeaways: ["Its systems run everywhere — from giant clouds to a company's own building."],
      analogy:
        "Like an app that works on the web, on your phone, and offline on your laptop."
    },
    {
      id: "where-global",
      sentences: [
        "Headquartered in Santa Clara, California.",
        "Our supply chain is mainly concentrated in the Asia-Pacific region."
      ],
      terms: [term("supply-chain", "supply chain")],
      takeaways: ["Based in California, operating worldwide, with chips built by partners in Asia."],
      analogy:
        "Designed in California, built in Asia — just like how an iPhone is designed in the US but assembled overseas."
    }
  ],
  "explain-evolution": [
    {
      id: "evo-1999",
      sentences: [
        "Our invention of the GPU in 1999 sparked the growth of the PC gaming market and redefined computer graphics."
      ],
      terms: [term("gpu", "GPU")],
      takeaways: ["NVIDIA began by inventing the GPU in 1999, launching modern PC gaming."],
      analogy:
        "Like inventing the first proper games console — it created a whole new market overnight."
    },
    {
      id: "evo-2006",
      sentences: [
        "With our introduction of the CUDA programming model in 2006, we paved the way for the emergence of modern AI."
      ],
      terms: [term("cuda", "CUDA")],
      takeaways: ["In 2006, CUDA let its chips do all kinds of computing — setting up the AI boom."],
      analogy:
        "Like giving a race car a normal steering wheel so anyone could drive it, not just engineers."
    },
    {
      id: "evo-2012",
      sentences: [
        "In 2012, the AlexNet neural network, trained on NVIDIA GPUs, won the ImageNet competition, marking the \u201cBig Bang\u201d moment of AI."
      ],
      terms: [term("neural-network", "neural network")],
      takeaways: ["In 2012, a famous AI ran on NVIDIA chips — the moment AI took off."],
      analogy:
        "The moment everyone realised these gaming chips were secretly perfect for AI."
    },
    {
      id: "evo-acquire",
      sentences: [
        "Our acquisition of Mellanox in 2020 enabled our platforms to be data center scale.",
        "In 2023, we introduced our first data center CPU, Grace."
      ],
      terms: [term("acquisition", "acquisition"), term("cpu", "CPU")],
      takeaways: ["NVIDIA added networking (2020) and its own CPU (2023), becoming a data-center powerhouse."],
      analogy:
        "Like a phone maker buying the company that makes the signal towers — now it controls much more of the system."
    }
  ],
  "explain-future-growth": [
    {
      id: "growth-ai",
      sentences: [
        "We provide a complete, end-to-end accelerated computing platform for AI, addressing both training and inferencing."
      ],
      terms: [term("training", "training"), term("inference", "inferencing")],
      takeaways: ["NVIDIA's biggest growth bet is AI — tools to both train and run AI."],
      analogy:
        "Like selling shovels during a gold rush — everyone doing AI needs NVIDIA's tools to dig."
    },
    {
      id: "growth-genai",
      sentences: [
        "We expect a broader set of PC users to choose NVIDIA GPUs for running generative AI applications locally on their PC."
      ],
      terms: [term("generative-ai", "generative AI"), term("gpu", "NVIDIA GPUs")],
      takeaways: ["As AI tools spread, more people will need NVIDIA chips — even at home."],
      analogy:
        "Like how everyone eventually needed a webcam once video calls took off."
    },
    {
      id: "growth-av",
      sentences: [
        "We believe the advent of autonomous vehicles, or AV, and electric vehicles is revolutionizing the transportation industry."
      ],
      terms: [term("autonomous-vehicle", "autonomous vehicles")],
      takeaways: ["Self-driving cars are a huge future market NVIDIA is building for."],
      analogy:
        "Like supplying the 'brains' for every future robotaxi on the road."
    },
    {
      id: "growth-omniverse",
      sentences: [
        "Industrial enterprises are adopting Omniverse's 3D and simulation technologies, building digital twins of factories."
      ],
      terms: [term("omniverse", "Omniverse"), term("digital-twin", "digital twins")],
      takeaways: ["Businesses use NVIDIA's Omniverse to build virtual copies of the real world."],
      analogy:
        "Like The Sims, but for real factories — test changes safely on the virtual copy before doing them for real."
    }
  ],
  "explain-competitive-advantage": [
    {
      id: "moat-performance",
      sentences: [
        "This full-stack innovation approach allows us to deliver order-of-magnitude performance advantages relative to legacy approaches."
      ],
      terms: [term("full-stack", "full-stack")],
      takeaways: ["NVIDIA can be many times faster because it improves chip, system and software together."],
      analogy:
        "Like a race team that builds the car, tunes the engine AND trains the driver — very hard to beat."
    },
    {
      id: "moat-developers",
      sentences: [
        "There are over 5.9 million developers worldwide using CUDA and our other software tools."
      ],
      terms: [term("cuda", "CUDA")],
      takeaways: ["Nearly 6 million developers build on CUDA — switching to a rival means rewriting everything, so they stay."],
      analogy:
        "Like everyone learning to type on a QWERTY keyboard — switching layouts is too painful, so nobody bothers."
    },
    {
      id: "moat-ecosystem",
      sentences: [
        "Our AI technology leadership is reinforced by our large and expanding ecosystem in a virtuous cycle."
      ],
      terms: [term("ecosystem", "ecosystem"), term("virtuous-cycle", "virtuous cycle")],
      takeaways: ["The more people use NVIDIA, the better it gets — a snowball rivals struggle to stop."],
      analogy:
        "Like a social app that's more useful because all your friends are already on it."
    },
    {
      id: "moat-patents",
      sentences: [
        "We rely primarily on a combination of patents, trademarks, trade secrets, and licensing arrangements to protect our IP."
      ],
      terms: [term("patent", "patents"), term("ip", "IP")],
      takeaways: ["NVIDIA guards its inventions with patents, making it hard to copy."],
      analogy:
        "Like a secret recipe locked in a vault that rivals legally aren't allowed to copy."
    }
  ],
  "explain-how-operates": [
    {
      id: "ops-fabless",
      sentences: [
        "We utilize a fabless and contracting manufacturing strategy.",
        "We can avoid many of the costs and risks associated with owning and operating manufacturing operations."
      ],
      terms: [term("fabless", "fabless")],
      takeaways: ["NVIDIA designs chips but hires factories to build them — like an architect using builders."],
      analogy:
        "Like Nike designing the shoes while specialist factories stitch them — the brand controls the design, not the sewing."
    },
    {
      id: "ops-focus",
      sentences: [
        "We can focus our resources on product design, quality assurance, marketing, and customer support.",
        "More than half of our engineers work on software."
      ],
      terms: [term("product-design", "product design")],
      takeaways: ["Instead of factories, NVIDIA focuses on design and software — over half its engineers write software."],
      analogy:
        "Like a movie studio that focuses on writing and directing, not running the cinema."
    },
    {
      id: "ops-supply",
      sentences: [
        "Our supply chain is mainly concentrated in the Asia-Pacific region.",
        "We utilize foundries, such as TSMC and Samsung, to produce our semiconductor wafers."
      ],
      terms: [
        term("supply-chain", "supply chain"),
        term("foundry", "foundries"),
        term("semiconductor-wafer", "semiconductor wafers")
      ],
      takeaways: ["NVIDIA relies on a few Asian factories, especially TSMC — efficient, but a concentration risk."],
      analogy:
        "Like a restaurant that depends on one amazing supplier — great quality, but risky if they ever close."
    },
    {
      id: "ops-partners",
      sentences: [
        "Our partner network incorporates global, regional and specialized CSPs, OEMs, system integrators and distributors."
      ],
      terms: [term("partner-network", "partner network"), term("oem", "OEMs")],
      takeaways: ["NVIDIA sells through a web of partners who build and deliver final products."],
      analogy:
        "Like a drinks brand that relies on shops and vending machines to actually reach you."
    }
  ]
};

export function resolveHqDecodeEvidence(
  questionId: InvestorNotebookQuestionId
): readonly HqDecodeEvidencePiece[] {
  return HQ_DECODE_EVIDENCE_BY_QUESTION[questionId] ?? [];
}

export type HqMissionTerm = {
  id: string;
  title: string;
  explanation: string;
};

/**
 * Unique Decode terms introduced across a mission's evidence, in first-seen
 * order — powers the end-of-mission Key Terms Check matching activity.
 */
export function resolveHqDecodeMissionTerms(
  questionId: InvestorNotebookQuestionId
): readonly HqMissionTerm[] {
  const seen = new Set<string>();
  const terms: HqMissionTerm[] = [];
  for (const piece of resolveHqDecodeEvidence(questionId)) {
    for (const t of piece.terms) {
      if (seen.has(t.id)) continue;
      seen.add(t.id);
      terms.push({ id: t.id, title: t.title, explanation: t.explanation });
    }
  }
  return terms;
}

/**
 * Headquarters flow — teaches both HQ questions (identity + value) before the
 * Analyst Challenge.
 */
export const HQ_DECODE_EVIDENCE: readonly HqDecodeEvidencePiece[] = [
  ...HQ_DECODE_EVIDENCE_BY_QUESTION["explain-what-does"],
  ...HQ_DECODE_EVIDENCE_BY_QUESTION["explain-value-prop"]
];

export const HQ_FIRST_QUEST_ROUTE = "/business/what-they-do";

export const HQ_MISSION_BRIEF_OUTRO =
  "By the end of this mission, you'll understand:";

/** Rotated so evidence files don't all look identical. */
export const HQ_DECODE_MESSAGE_HEADINGS = [
  "🤖 Here's what NVIDIA is really saying...",
  "📖 In Plain English",
  "💡 Investor Translation",
  "🔍 What's the Real Message?",
  "🎯 What This Means"
] as const;

/** @deprecated Prefer pickHqDecodeHeading(); kept for any residual imports. */
export const HQ_DECODE_MESSAGE_HEADING = HQ_DECODE_MESSAGE_HEADINGS[0];

export function pickHqDecodeHeading(): string {
  const index = Math.floor(Math.random() * HQ_DECODE_MESSAGE_HEADINGS.length);
  return HQ_DECODE_MESSAGE_HEADINGS[index] ?? HQ_DECODE_MESSAGE_HEADINGS[0];
}

export const HQ_WHY_THIS_MATTERS_HEADING = "💡 Why This Matters";

export const HQ_DECODE_KEY_TERMS_HEADING = "📘 Key Terms to Remember";

export const HQ_DECODE_KEY_TERMS_HELPER =
  "🧠 Remember these terms — there's a quick challenge waiting at the end of this mission!";

export const HQ_RECALL_XP_REWARD = 8;

export function formatOfficial10KSourceLabel(companyName: string): string {
  return `Source: ${companyName} Annual Report (10-K)`;
}

export function formatHqEvidenceProgress(
  index: number,
  total: number
): string {
  return `Evidence ${index + 1} of ${total}`;
}

export type HqDecodeParagraphSegment =
  | { kind: "text"; text: string }
  | { kind: "term"; termId: string; text: string };

function buildHqDecodeSentenceSegments(
  sentence: string,
  terms: readonly HqDecodeTermDef[]
): readonly HqDecodeParagraphSegment[] {
  const segments: HqDecodeParagraphSegment[] = [];
  let cursor = 0;

  const sortedTerms = [...terms]
    .filter((term) => sentence.includes(term.phrase))
    .sort((a, b) => sentence.indexOf(a.phrase) - sentence.indexOf(b.phrase));

  for (const term of sortedTerms) {
    const index = sentence.indexOf(term.phrase, cursor);
    if (index < 0) continue;
    if (index > cursor) {
      segments.push({ kind: "text", text: sentence.slice(cursor, index) });
    }
    segments.push({ kind: "term", termId: term.id, text: term.phrase });
    cursor = index + term.phrase.length;
  }

  if (cursor < sentence.length) {
    segments.push({ kind: "text", text: sentence.slice(cursor) });
  }

  return segments;
}

/** Split each evidence sentence into plain text + highlighted term segments. */
export function buildHqDecodeParagraphSegments(
  piece: HqDecodeEvidencePiece
): readonly (readonly HqDecodeParagraphSegment[])[] {
  return piece.sentences.map((sentence) =>
    buildHqDecodeSentenceSegments(sentence, piece.terms)
  );
}

/** @deprecated Prefer HQ_DECODE_EVIDENCE[0] — kept for any residual imports. */
export const HQ_DECODE_OPENING_SENTENCES = HQ_DECODE_EVIDENCE[0]?.sentences ?? [];
export const HQ_DECODE_OPENING_PARAGRAPH = HQ_DECODE_OPENING_SENTENCES.join(" ");
export const HQ_DECODE_TERMS = HQ_DECODE_EVIDENCE[0]?.terms ?? [];
export const HQ_DECODE_MESSAGE_TAKEAWAYS = HQ_DECODE_EVIDENCE[0]?.takeaways ?? [];
