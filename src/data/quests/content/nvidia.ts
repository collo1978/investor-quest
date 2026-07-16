/**
 * NVIDIA demo — gold-standard curated copy (headline takeaway + white explanation).
 * Grounded in NVIDIA's public filings; copy stays relatable — no SEC jargon on screen.
 * Governed by `src/data/contentRules/investorQuestContentRules.ts`.
 */
import type {
  CompanyContent,
  QuestContentOverride,
  SubCardContent
} from "@/data/quests/content/types";
import { contentKey } from "@/data/quests/content/types";
import type { QuizConfig } from "@/data/quests/types";
import {
  NVDA_DEMO_SOURCE,
  NVDA_DEMO_SOURCE_TEAM
} from "@/lib/demo/nvidiaDemoSources";
import { goldAnswer, lessonAnswer } from "@/lib/demo/nvidiaDemoGoldAnswer";
import { NVIDIA_FORCES_DEMO_OVERRIDES } from "@/data/quests/content/nvidiaForcesDemo";

const PASS = 0.66 as const;

function cards(
  entries: Record<string, SubCardContent>
): QuestContentOverride["cards"] {
  return Object.fromEntries(Object.entries(entries));
}

function q(cfg: QuizConfig): QuizConfig {
  return cfg;
}

export const NVIDIA_CONTENT: CompanyContent = {
  companyId: "nvda",
  overrides: {
    ...NVIDIA_FORCES_DEMO_OVERRIDES,

    [contentKey("business", "what-they-do")]: {
      cards: cards({
        "card-1": {
          investorQuestion: "What does NVIDIA actually do?",
          plainEnglishAnswer: goldAnswer(
            'NVIDIA builds the "brains" behind modern AI and advanced computing.',
            `• It designs powerful computer chips and software for difficult tasks.
• You see the results when:
  - ChatGPT answers quickly
  - Video games run smoothly
  - Scientists run huge simulations
• NVIDIA is one of the world's leading companies in this space.`
          )
        },
        "card-2": {
          investorQuestion: "How has NVIDIA evolved over time?",
          plainEnglishAnswer: goldAnswer(
            "NVIDIA evolved from gaming graphics into an AI and full-stack computing platform.",
            `• 1999 — Birth of the GPU
• 2006 — CUDA turned GPUs into a broader computing platform
• 2012 — AI Breakthrough (AlexNet)
• 2017 — Built for AI with Tensor Cores
• 2020 — Expanded the platform (Mellanox networking)
• Today — Full-stack computing infrastructure`
          )
        },
        "card-3": {
          investorQuestion: "Who uses NVIDIA's products around the world?",
          plainEnglishAnswer: goldAnswer(
            "Customers span cloud giants, AI builders, researchers, gamers, and large enterprises.",
            `• The world's biggest cloud companies order huge volumes for AI services
• Startups and researchers use its tools to train new models
• Gamers and designers still rely on its graphics products
• Healthcare, cars, and finance also depend on its computing power`
          )
        }
      }),
      quizConfig: q({
        passThreshold: PASS,
        questions: [
          {
            kind: "multiple-choice",
            id: "nvda-snap-q1",
            prompt: "What does NVIDIA actually do?",
            choices: [
              "Builds chips and software for AI, gaming, and heavy computing",
              "Runs a consumer email and cloud-storage service",
              "Manufactures smartphones for retail stores",
              "Licenses its brand on third-party gadgets"
            ],
            correctIndex: 0,
            explain:
              "NVIDIA designs accelerated computing — chips plus software for demanding workloads."
          },
          {
            kind: "true-false",
            id: "nvda-snap-q2",
            prompt: "NVIDIA was founded to make computer graphics much faster.",
            correct: true,
            explain:
              "Gaming roots came first — the same chip design later helped power AI training."
          },
          {
            kind: "fill-blank",
            id: "nvda-snap-q3",
            prompt:
              "Complete the sentence:\nNVIDIA's customers include cloud companies, AI startups, researchers, and ______.",
            options: ["Gamers", "Airlines", "Coffee shops", "Book publishers"],
            correctIndex: 0,
            explain:
              "NVIDIA serves a broad mix — from the largest cloud providers to gamers and enterprise buyers."
          }
        ]
      })
    },

    [contentKey("business", "why-buying")]: {
      title: "WHAT NVIDIA SELLS & WHY IT WINS",
      cards: cards({
        "card-1": {
          investorQuestion: "What problem does NVIDIA solve?",
          plainEnglishAnswer: goldAnswer(
            "NVIDIA helps computers handle incredibly difficult tasks much faster than traditional computers.",
            `Its technology powers things like:
• Artificial intelligence
• Scientific research
• Self-driving cars
• Advanced graphics
Tasks that would otherwise take much longer to process.`
          )
        },
        "card-2": {
          investorQuestion: "What products does NVIDIA sell?",
          plainEnglishAnswer: goldAnswer(
            "NVIDIA is best known for its GPUs, but it sells much more than chips.",
            `It also develops:
• Networking equipment
• AI software
• Complete computing systems
• Platforms for healthcare, gaming and autonomous driving`
          )
        },
        "card-3": {
          investorQuestion: "Why is innovation so important to NVIDIA?",
          plainEnglishAnswer: goldAnswer(
            "Innovation has been at the centre of NVIDIA since the company was founded.",
            `Many of its biggest successes came from creating entirely new technologies rather than simply improving existing ones.
By constantly developing new chips, software and AI platforms, NVIDIA stays ahead of changing technology.`
          )
        }
      }),
      quizConfig: q({
        passThreshold: PASS,
        questions: [
          {
            kind: "multiple-choice",
            id: "nvda-wb-q1",
            prompt: "What are NVIDIA's two main product segments?",
            choices: [
              "Compute & Networking and Graphics",
              "AI and Smartphones",
              "Gaming and Restaurants",
              "Cars and Streaming"
            ],
            correctIndex: 0,
            explain:
              "NVIDIA splits its business into Compute & Networking and Graphics."
          },
          {
            kind: "true-false",
            id: "nvda-wb-q2",
            prompt:
              "NVIDIA's Graphics segment focuses on gaming and visual computing.",
            correct: true,
            explain:
              "Gaming, PC graphics, and creative tools live in the Graphics segment."
          },
          {
            kind: "scenario",
            id: "nvda-wb-q3",
            prompt:
              "A company wants to build a new AI chatbot. Which NVIDIA segment would most likely help them?",
            choices: [
              "Compute & Networking",
              "Graphics",
              "Gaming Services",
              "Design Software"
            ],
            correctIndex: 0,
            explain:
              "AI chatbots need the heavy computing power this segment provides."
          }
        ]
      })
    },

    [contentKey("business", "everyday-life")]: {
      title: "HOW NVIDIA STAYS AHEAD",
      cards: cards({
        "card-1": {
          investorQuestion: "How does NVIDIA stay ahead through technology?",
          plainEnglishAnswer: lessonAnswer({
            headline: "⚡ BETTER TECHNOLOGY",
            intro: "NVIDIA doesn't just build computer chips.",
            focusTitle: "It builds a complete technology platform:",
            focusBullets: [
              "Chips",
              "Software",
              "Networking",
              "AI tools that work together"
            ],
            closing:
              "By improving the whole system, NVIDIA aims to help customers solve problems faster than competing technologies."
          })
        },
        "card-2": {
          investorQuestion: "How does NVIDIA stay ahead in AI?",
          plainEnglishAnswer: lessonAnswer({
            headline: "🤖 ARTIFICIAL INTELLIGENCE",
            intro: "NVIDIA is investing heavily in AI.",
            focusTitle: "It builds:",
            focusBullets: [
              "AI chips",
              "Software and tools",
              "Services that help businesses create and run AI apps"
            ],
            closing:
              "Today, millions of developers use NVIDIA's technology, helping strengthen its position in the AI industry."
          })
        },
        "card-3": {
          investorQuestion: "How does NVIDIA stay ahead in graphics?",
          plainEnglishAnswer: lessonAnswer({
            headline: "🎮 COMPUTER GRAPHICS",
            intro:
              "NVIDIA is constantly improving the technology behind gaming and computer graphics.",
            focusTitle: "Its products are used by:",
            focusBullets: [
              "Gamers",
              "Designers and engineers",
              "Content creators around the world"
            ],
            closing:
              "By combining graphics with AI, NVIDIA hopes to stay at the forefront of visual computing."
          })
        },
        "card-4": {
          investorQuestion: "How does NVIDIA stay ahead in self-driving cars?",
          plainEnglishAnswer: lessonAnswer({
            headline: "🚗 SELF-DRIVING CARS",
            intro:
              "NVIDIA believes self-driving cars could become a major future market.",
            middle:
              "Its DRIVE platform helps car companies develop vehicles that can use AI to assist drivers or even drive themselves.",
            closing:
              "By investing early in this technology, NVIDIA hopes to stay ahead as the transportation industry evolves."
          })
        },
        "card-5": {
          investorQuestion: "How does NVIDIA stay ahead through its technology?",
          plainEnglishAnswer: lessonAnswer({
            headline: "🔒 NVIDIA'S TECHNOLOGY",
            intro: "NVIDIA owns valuable technology, software, and inventions.",
            middle:
              "Other companies can sometimes pay to use NVIDIA's technology in their own products.",
            closing:
              "This helps NVIDIA expand the reach of its innovations beyond the products it sells directly."
          })
        }
      }),
      quizConfig: q({
        passThreshold: PASS,
        questions: [
          {
            kind: "multiple-choice",
            id: "nvda-el-q1",
            prompt: "Where might you notice NVIDIA without buying a chip yourself?",
            choices: [
              "Inside fast AI apps and smooth games",
              "At every grocery checkout",
              "Only on paper stocks",
              "In airline tickets"
            ],
            correctIndex: 0,
            explain: "You feel them through products — not a chip in your pocket."
          },
          {
            kind: "true-false",
            id: "nvda-el-q2",
            prompt: "NVIDIA's GPUs are widely used in AI data centres.",
            correct: true,
            explain: "Gaming is a real-world touchpoint millions already know."
          },
          {
            kind: "scenario",
            id: "nvda-el-q3",
            prompt: "A friend asks why NVIDIA matters. Best hook?",
            choices: [
              "Name an app or game they use that feels fast or looks amazing",
              "Recite the market cap first",
              "Say chips are boring",
              "Skip to accounting ratios"
            ],
            correctIndex: 0,
            explain: "Start with life they already live — then connect the chip story."
          }
        ]
      })
    },

    [contentKey("business", "how-it-works")]: {
      title: "HOW NVIDIA SELLS AND MARKETS",
      cards: cards({
        "card-1": {
          investorQuestion: "How does NVIDIA reach customers around the world?",
          plainEnglishAnswer: lessonAnswer({
            headline: "🤝 PARTNERS",
            intro:
              "NVIDIA works with a large network of partners around the world.",
            middle:
              "These partners help sell, distribute, and support NVIDIA products across different industries and countries.",
            closing:
              "By working together, NVIDIA can reach more customers than it could on its own."
          })
        },
        "card-2": {
          investorQuestion: "How does NVIDIA help customers use its technology?",
          plainEnglishAnswer: lessonAnswer({
            headline: "🛠️ HELPING CUSTOMERS SUCCEED",
            intro:
              "NVIDIA employs engineers and technology experts who work closely with customers.",
            middle:
              "They help businesses design, test, and improve systems that use NVIDIA products.",
            closing:
              "This support helps customers get the most value from NVIDIA's technology."
          })
        },
        "card-3": {
          investorQuestion: "Why are developers important to NVIDIA?",
          plainEnglishAnswer: lessonAnswer({
            headline: "👨‍💻 DEVELOPERS",
            intro:
              "NVIDIA works closely with software developers around the world.",
            middle:
              "It provides tools, training, and educational programs that help developers build applications using NVIDIA technology.",
            closing:
              "The more developers who use NVIDIA's platform, the stronger its ecosystem becomes."
          })
        }
      }),
      quizConfig: q({
        passThreshold: PASS,
        questions: [
          {
            kind: "multiple-choice",
            id: "nvda-hiw-q1",
            prompt: "How does NVIDIA reach customers around the world?",
            choices: [
              "Through a large network of partners that sell, distribute, and support its products",
              "Only through NVIDIA-owned stores in every country",
              "By shipping chips directly to every household",
              "Through banks that manage chip orders"
            ],
            correctIndex: 0,
            explain:
              "Partners help NVIDIA reach more customers across industries and countries than it could on its own."
          },
          {
            kind: "true-false",
            id: "nvda-hiw-q2",
            prompt:
              "NVIDIA employs engineers and technology experts who work closely with customers to help them use its products.",
            correct: true,
            explain:
              "Hands-on support helps customers get the most value from NVIDIA's technology."
          },
          {
            kind: "fill-blank",
            id: "nvda-hiw-q3",
            prompt:
              "Complete the sentence:\nThe more developers who use NVIDIA's platform, the ______ its ecosystem becomes.",
            options: ["Stronger", "Smaller", "Slower", "Quieter"],
            correctIndex: 0,
            explain:
              "Tools, training, and educational programs help developers build on NVIDIA — and a stronger ecosystem attracts more users."
          }
        ]
      })
    },

    [contentKey("business", "why-they-stay")]: {
      title: "WHO MAKES NVIDIA'S CHIPS?",
      cards: cards({
        "card-1": {
          investorQuestion: "Does NVIDIA manufacture its own chips?",
          plainEnglishAnswer: lessonAnswer({
            headline: "🏭 WHO MAKES NVIDIA'S CHIPS?",
            intro: "No.",
            middle:
              "NVIDIA designs its chips, but other companies manufacture them.",
            closing:
              "This allows NVIDIA to focus on creating new products while relying on specialist manufacturers to produce them."
          })
        },
        "card-2": {
          investorQuestion: "Why does NVIDIA work with suppliers?",
          plainEnglishAnswer: lessonAnswer({
            headline: "🤝 WORKING WITH SUPPLIERS",
            intro:
              "NVIDIA relies on specialist suppliers for manufacturing, testing, and packaging its products.",
            closing:
              "By partnering with experts, NVIDIA can avoid the costs of operating its own factories."
          })
        },
        "card-3": {
          investorQuestion: "Where are NVIDIA's products made?",
          plainEnglishAnswer: lessonAnswer({
            headline: "🌏 A GLOBAL SUPPLY CHAIN",
            intro:
              "NVIDIA's supply chain spans multiple countries, with many suppliers located in the Asia-Pacific region.",
            closing:
              "This allows NVIDIA to access some of the world's leading manufacturing companies."
          })
        },
        "card-4": {
          investorQuestion: "Which companies help manufacture NVIDIA's chips?",
          plainEnglishAnswer: lessonAnswer({
            headline: "🏢 TSMC AND SAMSUNG",
            intro:
              "Companies such as TSMC and Samsung manufacture many of NVIDIA's semiconductor wafers.",
            closing:
              "These partnerships are important because NVIDIA depends on them to meet customer demand."
          })
        }
      }),
      quizConfig: q({
        passThreshold: PASS,
        questions: [
          {
            kind: "multiple-choice",
            id: "nvda-wts-q1",
            prompt: "Does NVIDIA manufacture its own chips?",
            choices: [
              "No — it designs chips and other companies manufacture them",
              "Yes — NVIDIA owns all chip factories worldwide",
              "Yes — every chip is built only in the United States",
              "No — NVIDIA only sells software, not chips"
            ],
            correctIndex: 0,
            explain:
              "NVIDIA designs its chips and relies on specialist manufacturers to produce them."
          },
          {
            kind: "true-false",
            id: "nvda-wts-q2",
            prompt:
              "NVIDIA's supply chain spans multiple countries, with many suppliers in the Asia-Pacific region.",
            correct: true,
            explain:
              "A global supply chain helps NVIDIA access leading manufacturing companies."
          },
          {
            kind: "fill-blank",
            id: "nvda-wts-q3",
            prompt:
              "Complete the sentence:\nCompanies such as TSMC and Samsung help manufacture NVIDIA's ______.",
            options: [
              "semiconductor wafers",
              "office furniture",
              "streaming apps",
              "electric cars"
            ],
            correctIndex: 0,
            explain:
              "NVIDIA depends on partners like TSMC and Samsung to meet customer demand."
          }
        ]
      })
    },

    [contentKey("business", "competition")]: {
      title: "HOW TOUGH IS THIS INDUSTRY?",
      cards: cards({
        "card-1": {
          investorQuestion: "Why is this industry difficult to compete in?",
          plainEnglishAnswer: lessonAnswer({
            headline: "⚡ TECHNOLOGY MOVES FAST",
            intro: "Technology changes quickly.",
            closing:
              "Companies must constantly improve their products to keep up with customer demands and stay ahead of competitors."
          })
        },
        "card-2": {
          investorQuestion: "What helps companies win customers?",
          plainEnglishAnswer: lessonAnswer({
            headline: "🏆 WHAT CUSTOMERS WANT",
            intro:
              "Customers look for products that perform well, are reasonably priced, and have strong software support.",
            closing:
              "Companies that meet these needs are more likely to win customers."
          })
        },
        "card-3": {
          investorQuestion: "Why does NVIDIA need to predict future demand?",
          plainEnglishAnswer: lessonAnswer({
            headline: "🔮 STAYING RELEVANT",
            intro: "Customer needs can change over time.",
            middle:
              "NVIDIA tries to predict what customers will want in the future so it can build products that stay relevant."
          })
        },
        "card-4": {
          investorQuestion: "What could threaten NVIDIA's position?",
          plainEnglishAnswer: lessonAnswer({
            headline: "⚠️ NEW CHALLENGERS",
            intro:
              "New competitors may create products that are cheaper, faster, or offer features NVIDIA does not have.",
            closing:
              "This means NVIDIA must continue innovating to stay competitive."
          })
        }
      }),
      quizConfig: q({
        passThreshold: PASS,
        questions: [
          {
            kind: "multiple-choice",
            id: "nvda-comp-q1",
            prompt: "Why is this industry difficult to compete in?",
            choices: [
              "Technology changes quickly and companies must keep improving",
              "Technology never changes",
              "Only one company is allowed to sell chips",
              "Customers never want new products"
            ],
            correctIndex: 0,
            explain:
              "Fast-moving tech means companies must constantly improve to stay ahead."
          },
          {
            kind: "true-false",
            id: "nvda-comp-q2",
            prompt:
              "Customers look for products that perform well, are reasonably priced, and have strong software support.",
            correct: true,
            explain:
              "Companies that meet these needs are more likely to win customers."
          },
          {
            kind: "fill-blank",
            id: "nvda-comp-q3",
            prompt:
              "Complete the sentence:\nNew competitors may offer cheaper or faster products — so NVIDIA must keep ______ to stay competitive.",
            options: ["innovating", "advertising only", "closing factories", "raising prices only"],
            correctIndex: 0,
            explain:
              "Even strong leaders must keep innovating when new challengers enter the market."
          }
        ]
      })
    },

    [contentKey("business", "who-competes")]: {
      title: "WHO IS NVIDIA COMPETING AGAINST?",
      cards: cards({
        "card-1": {
          investorQuestion: "Which chip companies compete with NVIDIA?",
          plainEnglishAnswer: lessonAnswer({
            headline: "💻 AI CHIP COMPANIES",
            focusTitle: "NVIDIA competes with:",
            focusBullets: ["AMD", "Intel", "Huawei"],
            closing:
              "These companies develop chips and processors used for AI and advanced computing."
          })
        },
        "card-2": {
          investorQuestion: "Which technology companies compete with NVIDIA?",
          plainEnglishAnswer: lessonAnswer({
            headline: "☁️ BIG TECH COMPANIES",
            focusTitle: "NVIDIA competes with:",
            focusBullets: [
              "Amazon",
              "Microsoft",
              "Alphabet (Google)",
              "Alibaba",
              "Baidu",
              "Huawei"
            ],
            closing:
              "Many of these companies are developing their own AI chips and computing systems."
          })
        },
        "card-3": {
          investorQuestion: "Which companies compete with NVIDIA in CPUs?",
          plainEnglishAnswer: lessonAnswer({
            headline: "🖥️ CPU COMPANIES",
            focusTitle: "NVIDIA competes with:",
            focusBullets: ["Amazon", "Microsoft", "Huawei"],
            closing:
              "These companies are developing CPU technologies and computing platforms that compete with parts of NVIDIA's business."
          })
        },
        "card-4": {
          investorQuestion:
            "Which companies compete with NVIDIA in vehicles and smart devices?",
          plainEnglishAnswer: lessonAnswer({
            headline: "🚗 AUTOMOTIVE AND SMART DEVICES",
            focusTitle: "NVIDIA competes with:",
            focusBullets: [
              "AMD",
              "Intel",
              "Qualcomm",
              "Samsung",
              "Broadcom",
              "Renesas",
              "Ambarella",
              "Tesla"
            ],
            closing:
              "These companies develop technology used in vehicles, machines, servers, and smart devices."
          })
        },
        "card-5": {
          investorQuestion: "Which companies compete with NVIDIA in networking?",
          plainEnglishAnswer: lessonAnswer({
            headline: "🌐 NETWORKING COMPANIES",
            focusTitle: "NVIDIA competes with:",
            focusBullets: [
              "AMD",
              "Intel",
              "Cisco",
              "Broadcom",
              "Arista Networks",
              "Hewlett Packard Enterprise",
              "Huawei",
              "Marvell"
            ],
            closing:
              "These companies provide networking products used in data centers and cloud computing."
          })
        }
      }),
      quizConfig: q({
        passThreshold: PASS,
        questions: [
          {
            kind: "multiple-choice",
            id: "nvda-wc-q1",
            prompt: "Which chip companies compete with NVIDIA?",
            choices: [
              "AMD, Intel, and Huawei",
              "Only grocery store brands",
              "Banks and insurance companies",
              "Streaming video services"
            ],
            correctIndex: 0,
            explain:
              "These companies develop chips and processors used for AI and advanced computing."
          },
          {
            kind: "true-false",
            id: "nvda-wc-q2",
            prompt:
              "Many big tech companies are developing their own AI chips and computing systems.",
            correct: true,
            explain:
              "Companies like Amazon, Microsoft, and Google are building their own AI computing platforms."
          },
          {
            kind: "fill-blank",
            id: "nvda-wc-q3",
            prompt:
              "Complete the sentence:\nUnderstanding the competition helps investors judge whether a company can protect its ______ position.",
            options: ["market", "logo", "headline", "slogan"],
            correctIndex: 0,
            explain:
              "Knowing the rivals helps you see whether a company can defend its place in the industry."
          }
        ]
      })
    },

    [contentKey("financials", "growth")]: {
      secSection: NVDA_DEMO_SOURCE,
      cards: cards({
        "card-1": {
          plainEnglishAnswer: goldAnswer(
            "NVIDIA sales exploded during the AI rush.",
            "Imagine every big tech company ordering gear for the next wave of AI — that order pile is why revenue shot up. The catch: if they stop reordering, sales could flatten fast."
          )
        },
        "card-2": {
          plainEnglishAnswer: goldAnswer(
            "Server-side AI now drives most growth.",
            "Gaming still brings in money, but the hockey-stick growth came from companies building AI — the behind-the-scenes stuff powering apps you actually use."
          )
        },
        "card-3": {
          plainEnglishAnswer: goldAnswer(
            "NVIDIA sells all over the world.",
            "Buyers span the U.S., Asia, and beyond — wherever AI spending is hottest. If one region cools off, the whole growth story can wobble."
          )
        }
      }),
      quizConfig: q({
        passThreshold: PASS,
        questions: [
          {
            kind: "multiple-choice",
            id: "nvda-gr-q1",
            prompt: "What made sales shoot up lately?",
            choices: [
              "Huge AI chip orders from big tech",
              "Everyone stopped buying tech",
              "Only T-shirts",
              "They closed every office"
            ],
            correctIndex: 0,
            explain:
              "The AI order rush from big tech is what sent sales up."
          },
          {
            kind: "true-false",
            id: "nvda-gr-q2",
            prompt: "NVIDIA relies heavily on data-centre AI chip sales.",
            correct: true,
            explain:
              "One product dominating revenue means bumps hit harder."
          }
        ]
      })
    },

    [contentKey("financials", "profitability")]: {
      secSection: NVDA_DEMO_SOURCE,
      cards: cards({
        "card-1": {
          plainEnglishAnswer: goldAnswer(
            "AI demand helped NVIDIA keep more of each sale.",
            "When everyone wants what you sell and prices stay strong, you keep a bigger slice — like a sold-out drop where demand outruns supply. That can shrink if rivals undercut or buyers push back on price."
          )
        },
        "card-2": {
          plainEnglishAnswer: goldAnswer(
            "Rising profits lifted earnings per share.",
            "As profits grew, each share of stock earned more — like splitting a growing pizza into the same number of slices and each slice getting bigger."
          )
        }
      }),
      quizConfig: q({
        passThreshold: PASS,
        questions: [
          {
            kind: "multiple-choice",
            id: "nvda-prof-q1",
            prompt: "Why did profits jump when AI orders were hot?",
            choices: [
              "Lots of buyers and prices stayed strong",
              "Nobody bought anything",
              "They quit selling chips",
              "Only the ads changed"
            ],
            correctIndex: 0,
            explain:
              "High demand plus strong pricing — that's what juiced margins."
          },
          {
            kind: "true-false",
            id: "nvda-prof-q2",
            prompt:
              "NVIDIA's earnings per share can rise when its share count falls.",
            correct: true,
            explain:
              "EPS divides net income by shares outstanding — fewer shares can lift EPS without higher profit."
          }
        ]
      })
    },

    [contentKey("financials", "expenses")]: {
      secSection: NVDA_DEMO_SOURCE,
      cards: cards({
        "card-1": {
          plainEnglishAnswer: goldAnswer(
            "Operating costs rose with the AI push.",
            "They hired more people, opened labs, and spent to stay ahead in the AI race — like an athlete paying for better training as rivals get faster."
          )
        },
        "card-2": {
          plainEnglishAnswer: goldAnswer(
            "Heavy research spend targets the next big thing.",
            "A big chunk of spending goes to inventing whatever comes after today's chips. Skimp on that and you might save money now but lose the next round."
          )
        }
      }),
      quizConfig: q({
        passThreshold: PASS,
        questions: [
          {
            kind: "multiple-choice",
            id: "nvda-exp-q1",
            prompt: "Why is spending going up?",
            choices: [
              "Hiring and building the next chips",
              "They stopped making anything new",
              "Only closing labs",
              "No real reason"
            ],
            correctIndex: 0,
            explain:
              "They're paying to stay in the AI race — people plus next-gen chips."
          },
          {
            kind: "true-false",
            id: "nvda-exp-q2",
            prompt: "NVIDIA spends heavily on research and development each year.",
            correct: true,
            explain:
              "R&D is betting they'll still matter next year — not just today's bills."
          }
        ]
      })
    },

    [contentKey("financials", "cash")]: {
      secSection: NVDA_DEMO_SOURCE,
      cards: cards({
        "card-1": {
          plainEnglishAnswer: goldAnswer(
            "Real cash kept flowing in from AI orders.",
            "Customers actually paid up — money hitting the bank, not just hype headlines. That is why investors feel better when cash piles up."
          )
        },
        "card-2": {
          plainEnglishAnswer: goldAnswer(
            "Cash funds invention, buybacks, and dividends.",
            "They spend cash inventing the next products, buying back shares, and paying a small dividend — like choosing between saving, investing in yourself, and sharing profits with owners."
          )
        }
      }),
      quizConfig: q({
        passThreshold: PASS,
        questions: [
          {
            kind: "multiple-choice",
            id: "nvda-cash-q1",
            prompt: "Why do people like seeing cash pile up?",
            choices: [
              "It proves customers really paid",
              "Cash never matters",
              "Only logos matter",
              "Cash is illegal"
            ],
            correctIndex: 0,
            explain:
              "Cash in the bank means buyers paid — not just a good story."
          },
          {
            kind: "true-false",
            id: "nvda-cash-q2",
            prompt: "NVIDIA spends cash on R&D, equipment, and shareholder returns.",
            correct: true,
            explain:
              "Invention vs. buybacks vs. dividends — that's a forecast in dollars."
          }
        ]
      })
    },

    [contentKey("financials", "financial-strength")]: {
      secSection: NVDA_DEMO_SOURCE,
      cards: cards({
        "card-1": {
          plainEnglishAnswer: goldAnswer(
            "NVIDIA carries more cash than scary debt.",
            "They built up cash faster than scary debt piled up — like having a fat savings account for a rainy month."
          )
        },
        "card-2": {
          plainEnglishAnswer: goldAnswer(
            "Big future chip commitments still tie up cash.",
            "Even with low debt, big promises to factories and research can lock up money — like pre-ordering next year's gear before you know how much you'll earn."
          )
        }
      }),
      quizConfig: q({
        passThreshold: PASS,
        questions: [
          {
            kind: "multiple-choice",
            id: "nvda-fs-q1",
            prompt: "Why is low debt nice?",
            choices: [
              "More room to survive a bad few months",
              "Debt always helps",
              "Debt is what they sell",
              "Banks own the company"
            ],
            correctIndex: 0,
            explain:
              "Less debt pressure means more room if sales soften."
          },
          {
            kind: "true-false",
            id: "nvda-fs-q2",
            prompt: "NVIDIA commits large sums to chip-factory capacity agreements.",
            correct: true,
            explain:
              "Future chip commitments can lock up cash even when debt looks fine."
          }
        ]
      })
    },

    [contentKey("management", "mgmt-1")]: {
      title: "Who runs the show",
      secSection: NVDA_DEMO_SOURCE_TEAM,
      cards: cards({
        "card-1": {
          investorQuestion:
            "Who runs NVIDIA day to day, and what experience do they bring?",
          plainEnglishAnswer: goldAnswer(
            "Jensen Huang leads NVIDIA as founder CEO.",
            "Jensen Huang is the founder CEO you see on stage in the black leather jacket — the face tied to NVIDIA's big AI bets for decades."
          )
        },
        "card-2": {
          investorQuestion: "How long has NVIDIA's CEO been in charge?",
          plainEnglishAnswer: goldAnswer(
            "Huang has led NVIDIA since the early 1990s.",
            "He has run the company since the early 1990s — before AI was on every phone. That long run let NVIDIA bet on AI early; a new CEO would shake things up."
          )
        },
        "card-3": {
          investorQuestion: "What has NVIDIA's leadership actually delivered?",
          plainEnglishAnswer: goldAnswer(
            "Leadership delivered through the AI boom.",
            "Under this team, NVIDIA became the name behind much of today's AI rush and sales soared. The question now: can they keep winning if the AI frenzy cools?"
          )
        }
      }),
      quizConfig: q({
        passThreshold: PASS,
        questions: [
          {
            kind: "multiple-choice",
            id: "nvda-m1-q1",
            prompt: "Who's the face of NVIDIA?",
            choices: [
              "Jensen Huang",
              "A new CEO every month",
              "Nobody knows",
              "A random intern"
            ],
            correctIndex: 0,
            explain:
              "Jensen Huang — founder CEO you see tied to the company."
          },
          {
            kind: "true-false",
            id: "nvda-m1-q2",
            prompt: "NVIDIA invested heavily in AI computing before the recent AI boom.",
            correct: true,
            explain:
              "They pushed AI chips early — before AI was on every phone and feed."
          },
          {
            kind: "fill-blank",
            id: "nvda-m1-q3",
            prompt:
              "Complete the sentence:\nWhen leaders are paid in stock, they win or lose ______ owners do.",
            options: ["when", "before", "never like", "without"],
            correctIndex: 0,
            explain:
              "Stock-heavy pay ties leader wealth to the share price — same ride as owners."
          }
        ]
      })
    },

    [contentKey("management", "mgmt-quiz")]: {
      secSection: NVDA_DEMO_SOURCE_TEAM,
      cards: cards({
        "card-1": {
          investorQuestion: "Do NVIDIA's top executives own a lot of stock?",
          plainEnglishAnswer: goldAnswer(
            "Top leaders hold meaningful NVIDIA stock.",
            "A chunk of their pay is NVIDIA stock that rises and falls with the share price. When the stock drops, their wallet takes a hit too — same as any owner."
          )
        },
        "card-2": {
          investorQuestion:
            "Does executive pay at NVIDIA match how the company performed?",
          plainEnglishAnswer: goldAnswer(
            "Executive pay rose with strong results.",
            "Pay climbed during years when profits and the stock price were flying. Owners watch whether bosses still earn big if results start sliding."
          )
        },
        "card-3": {
          investorQuestion: "How is executive pay structured at NVIDIA?",
          plainEnglishAnswer: goldAnswer(
            "Pay mixes salary, bonus, and stock.",
            "They get a paycheck, bonuses, and stock that vests over time — so staying and performing matters. More stock in the mix means leaders feel the same ups and downs owners do."
          )
        }
      }),
      quizConfig: q({
        passThreshold: PASS,
        questions: [
          {
            kind: "true-false",
            id: "nvda-mq-q1",
            prompt: "NVIDIA executives receive much of their pay in company stock.",
            correct: true,
            explain:
              "Stock-heavy pay means a drop hits them like it hits you."
          },
          {
            kind: "multiple-choice",
            id: "nvda-mq-q2",
            prompt: "What pay setup is sketchy?",
            choices: [
              "Huge pay when results start slipping",
              "Any pay at all",
              "Stock ticker letters",
              "Office paint color"
            ],
            correctIndex: 0,
            explain:
              "Pay should track results — giant bonuses while sales slide is a red flag."
          }
        ]
      })
    },

    [contentKey("management", "mgmt-2")]: {
      secSection: NVDA_DEMO_SOURCE_TEAM,
      cards: cards({
        "card-1": {
          investorQuestion:
            "What is NVIDIA's board supposed to do for shareholders?",
          plainEnglishAnswer: goldAnswer(
            "The board oversees the CEO for owners.",
            "Think of the board as the group that hires the CEO and asks the uncomfortable questions — especially when one leader has been in charge for decades."
          )
        },
        "card-2": {
          investorQuestion:
            "What big risks does NVIDIA's board keep an eye on?",
          plainEnglishAnswer: goldAnswer(
            "The board tracks supply, rivals, and rules.",
            "Chip shortages, new competitors, and government export rules can wreck a launch overnight. The board's job is spotting those threats before they become expensive surprises."
          )
        }
      }),
      quizConfig: q({
        passThreshold: PASS,
        questions: [
          {
            kind: "multiple-choice",
            id: "nvda-m2-q1",
            prompt: "What's the board for?",
            choices: [
              "Watch the CEO and ask hard questions",
              "Hand-design every chip",
              "Run the cash register daily",
              "Pick Netflix shows"
            ],
            correctIndex: 0,
            explain:
              "Oversight and tough questions — not building chips by hand."
          },
          {
            kind: "true-false",
            id: "nvda-m2-q2",
            prompt: "Chip shortages and export rules are board-level topics at NVIDIA.",
            correct: true,
            explain:
              "Supply and export rules can wreck plans — exactly what a board should stress."
          }
        ]
      })
    },

    [contentKey("management", "mgmt-governance")]: {
      secSection: NVDA_DEMO_SOURCE_TEAM,
      cards: cards({
        "card-1": {
          investorQuestion:
            "If you own NVIDIA stock, what say do you get in big decisions?",
          plainEnglishAnswer: goldAnswer(
            "Shareholders vote on directors and major items.",
            "Each share gives you a small vote — like picking club leaders, except big investment funds own millions of shares and their votes carry extra weight."
          )
        },
        "card-2": {
          investorQuestion:
            "What rules and disclosures does NVIDIA publish for owners?",
          plainEnglishAnswer: goldAnswer(
            "Public docs explain board rules and pay.",
            "NVIDIA publishes who sits on the board and how boss pay is set — boring pages, but they show who holds power and how incentives work."
          )
        }
      }),
      quizConfig: q({
        passThreshold: PASS,
        questions: [
          {
            kind: "true-false",
            id: "nvda-gov-q1",
            prompt: "NVIDIA shareholders vote on major corporate decisions.",
            correct: true,
            explain:
              "Votes matter — especially when big holders show up with millions of shares."
          },
          {
            kind: "multiple-choice",
            id: "nvda-gov-q2",
            prompt: "Why skim governance stuff?",
            choices: [
              "See who's in charge and how pay works",
              "It's only poetry",
              "It replaces sales",
              "It picks chip colors"
            ],
            correctIndex: 0,
            explain:
              "Those pages show power and pay rules — boring, useful."
          }
        ]
      })
    },

    [contentKey("management", "mgmt-financial-strength")]: {
      secSection: NVDA_DEMO_SOURCE_TEAM,
      cards: cards({
        "card-1": {
          investorQuestion:
            "How much cash does NVIDIA have — and why do leaders point to it?",
          plainEnglishAnswer: goldAnswer(
            "Leaders highlight cash as invention runway.",
            "Strong cash in the bank means they can keep inventing the next big thing even if one quarter disappoints — like savings that let you keep training when income dips."
          )
        },
        "card-2": {
          investorQuestion:
            "What financial promises could squeeze NVIDIA even with low debt?",
          plainEnglishAnswer: goldAnswer(
            "Factory prepays and research can tie up cash.",
            "Big promises to chip factories, heavy research spending, and cash returned to owners still use money. Low debt does not mean unlimited spending forever."
          )
        }
      }),
      quizConfig: q({
        passThreshold: PASS,
        questions: [
          {
            kind: "multiple-choice",
            id: "nvda-mf-q1",
            prompt: "Why does cash in the bank matter?",
            choices: [
              "Room to keep going if sales dip",
              "Cash is useless",
              "Only debt matters",
              "Cash bans inventing"
            ],
            correctIndex: 0,
            explain:
              "Cash is breathing room when sales soften."
          },
          {
            kind: "true-false",
            id: "nvda-mf-q2",
            prompt: "NVIDIA returns cash to shareholders through dividends and buybacks.",
            correct: true,
            explain:
              "They can return cash and still fund invention — not all-or-nothing."
          }
        ]
      })
    },

    [contentKey("management", "management-summary")]: {
      secSection: NVDA_DEMO_SOURCE_TEAM,
      cards: cards({
        "card-1": {
          investorQuestion:
            "Would you trust NVIDIA's management with your money — why or why not?",
          plainEnglishAnswer: goldAnswer(
            "Long-tenured leaders delivered through the AI boom.",
            "Huang's team helped NVIDIA become the name behind much of today's AI rush while sales soared. The open question: can they keep winning if orders slow or rivals catch up?"
          )
        }
      }),
      quizConfig: q({
        passThreshold: PASS,
        questions: [
          {
            kind: "multiple-choice",
            id: "nvda-ms-q1",
            prompt: "What should you remember about the people side?",
            choices: [
              "Long-time CEO, pay tied to stock, board watching risks",
              "No leaders exist",
              "Only the logo matters",
              "Quarters don't matter"
            ],
            correctIndex: 0,
            explain:
              "Who leads, how they're paid, and who's watching — that's the people story."
          }
        ]
      })
    }
  }
};
