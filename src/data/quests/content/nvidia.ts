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
import { goldAnswer } from "@/lib/demo/nvidiaDemoGoldAnswer";
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
          investorQuestion: "What does NVIDIA actually sell?",
          plainEnglishAnswer: goldAnswer(
            "NVIDIA builds powerful computer chips that help run AI and advanced graphics.",
            "When you use ChatGPT, watch realistic video games, or see AI create images, there is a good chance NVIDIA technology is helping behind the scenes. Their chips are designed to process huge amounts of data much faster than a normal computer can."
          )
        },
        "card-2": {
          investorQuestion: "Why do customers buy NVIDIA products?",
          plainEnglishAnswer: goldAnswer(
            "NVIDIA helps computers do difficult tasks faster and more efficiently.",
            "Companies use NVIDIA chips to train AI models, gamers use them for smoother graphics, and businesses use them to process large amounts of information. By reducing waiting time and improving performance, NVIDIA helps customers save time and get more done."
          )
        }
      }),
      quizConfig: q({
        passThreshold: PASS,
        questions: [
          {
            kind: "multiple-choice",
            id: "nvda-snap-q1",
            prompt: "What does NVIDIA mostly sell?",
            choices: [
              "Chips that help AI and games run",
              "A streaming TV app",
              "Electric cars",
              "Coffee shops"
            ],
            correctIndex: 0,
            explain:
              "Chips for AI and games — that's what they sell, even if you never buy one yourself."
          },
          {
            kind: "true-false",
            id: "nvda-snap-q2",
            prompt: "True or False: ChatGPT and many AI apps rely on NVIDIA chips.",
            correct: true,
            explain:
              "Lots of AI apps you touch often run on gear that includes NVIDIA chips."
          },
          {
            kind: "fill-blank",
            id: "nvda-snap-q3",
            prompt: "Think of NVIDIA like the ___ that helps AI and games run faster.",
            options: ["Turbocharger", "Museum", "Airline", "Grocery store"],
            correctIndex: 0,
            explain:
              "Not the whole car — the part that adds serious speed behind the scenes."
          }
        ]
      })
    },

    [contentKey("business", "why-buying")]: {
      cards: cards({
        "card-1": {
          investorQuestion: "Who spends the most money with NVIDIA?",
          plainEnglishAnswer: goldAnswer(
            "A few giant tech buyers drive most revenue.",
            "Picture Microsoft, Google, and Amazon placing massive orders — not you buying one graphics card at Best Buy. If one of those giants pauses spending, NVIDIA feels it fast."
          )
        },
        "card-2": {
          investorQuestion: "What products make NVIDIA the most money?",
          plainEnglishAnswer: goldAnswer(
            "Server AI chips pay most bills now.",
            "Gaming gear still sells, but the big money lately is companies building AI — like buying engines for every new chatbot and cloud service they launch."
          )
        },
        "card-3": {
          investorQuestion: "Why are companies rushing to buy AI chips?",
          plainEnglishAnswer: goldAnswer(
            "The AI race needs more computing power fast.",
            "Every company racing to launch AI needs serious horsepower behind the scenes. NVIDIA is the name a lot of them call when they need to move fast and not fall behind."
          )
        }
      }),
      quizConfig: q({
        passThreshold: PASS,
        questions: [
          {
            kind: "multiple-choice",
            id: "nvda-wb-q1",
            prompt: "Who spends the most money with NVIDIA?",
            choices: [
              "A few giant tech companies placing huge orders",
              "Individual shoppers buying one graphics card at a time",
              "Small local restaurants",
              "Movie theaters"
            ],
            correctIndex: 0,
            explain:
              "Think Microsoft, Google, and Amazon — not you picking up one card at Best Buy."
          },
          {
            kind: "multiple-choice",
            id: "nvda-wb-q2",
            prompt: "Which product line brings in the most money for NVIDIA lately?",
            choices: [
              "Server AI chips for cloud and data centers",
              "Gaming graphics cards alone",
              "Movie tickets and streaming apps",
              "Restaurant and retail store sales"
            ],
            correctIndex: 0,
            explain:
              "Gaming still sells — but huge AI orders from cloud and tech companies pay most bills now."
          },
          {
            kind: "multiple-choice",
            id: "nvda-wb-q3",
            prompt: "Why are companies rushing to buy NVIDIA AI chips right now?",
            choices: [
              "The AI race needs more computing power fast",
              "NVIDIA stopped selling chips to tech companies",
              "Governments banned gaming graphics cards",
              "Customers only buy one chip at a time now"
            ],
            correctIndex: 0,
            explain:
              "Every company launching AI needs serious horsepower — and many do not want to fall behind rivals."
          }
        ]
      })
    },

    [contentKey("business", "everyday-life")]: {
      cards: cards({
        "card-1": {
          investorQuestion: "Where do people interact with NVIDIA technology?",
          plainEnglishAnswer: goldAnswer(
            "You meet NVIDIA inside apps and games.",
            "You never buy an NVIDIA part at the mall — you feel it when ChatGPT answers quick or a game looks insane. That speed often starts in giant server rooms packed with their gear."
          )
        },
        "card-2": {
          investorQuestion: "How does NVIDIA affect gaming and AI apps?",
          plainEnglishAnswer: goldAnswer(
            "NVIDIA helps games look better and AI respond faster.",
            "Smooth frame rates in a new game? Faster replies from an AI helper? Same idea — powerful chips doing math-heavy work so your experience does not lag."
          )
        },
        "card-3": {
          investorQuestion: "Why do AI companies rely on NVIDIA?",
          plainEnglishAnswer: goldAnswer(
            "AI teams trust NVIDIA because it already works.",
            "Coders already know how to build on NVIDIA's tools from school and work projects. Starting fresh on a rival system feels like switching game consoles mid-season — slow and risky."
          )
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
            prompt: "Better graphics in a new game can be a sign NVIDIA tech is in the loop.",
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
      cards: cards({
        "card-1": {
          investorQuestion: "How are NVIDIA chips designed and built?",
          plainEnglishAnswer: goldAnswer(
            "NVIDIA designs chips; other companies build them.",
            "Think of NVIDIA as the architect drawing blueprints, and partner factories as the construction crew actually building the chips. Finished parts ship to tech giants and gaming PC makers worldwide."
          )
        },
        "card-2": {
          investorQuestion: "Who helps manufacture NVIDIA products?",
          plainEnglishAnswer: goldAnswer(
            "Partner factories actually build the chips.",
            "NVIDIA does not own every factory on Earth — like a clothing brand that designs but does not sew every shirt. That helps them scale fast, but a factory slowdown could leave customers waiting."
          )
        },
        "card-3": {
          investorQuestion: "How does NVIDIA deliver its technology worldwide?",
          plainEnglishAnswer: goldAnswer(
            "Chips ship worldwide to big tech partners.",
            "Orders go to cloud companies, PC makers, and distributors everywhere. Who gets the next batch can decide whose AI launch ships on time."
          )
        }
      }),
      quizConfig: q({
        passThreshold: PASS,
        questions: [
          {
            kind: "multiple-choice",
            id: "nvda-hiw-q1",
            prompt: "Who actually makes the physical chips?",
            choices: [
              "Partner factories — not NVIDIA-owned plants everywhere",
              "NVIDIA owns every factory on Earth",
              "Chips are built in grocery stores",
              "Banks print them"
            ],
            correctIndex: 0,
            explain:
              "NVIDIA designs; partner factories build — architect plus construction crew."
          },
          {
            kind: "true-false",
            id: "nvda-hiw-q2",
            prompt: "A lot of their strength is smart people designing chips and software.",
            correct: true,
            explain:
              "Brains and tools matter more here than owning every factory."
          },
          {
            kind: "order",
            id: "nvda-hiw-q3",
            prompt: "Put NVIDIA's typical chip journey in order.",
            steps: [
              "Design the chip",
              "Partner factory builds it",
              "Ship to cloud and tech customers",
              "Runs inside apps you use"
            ],
            explain: "Design → build → ship → show up in products you touch."
          }
        ]
      })
    },

    [contentKey("business", "why-they-stay")]: {
      cards: cards({
        "card-1": {
          investorQuestion: "Why is NVIDIA hard to replace?",
          plainEnglishAnswer: goldAnswer(
            "Switching off NVIDIA is slow and costly.",
            "Big AI and gaming teams already built everything on NVIDIA. Switching feels like rebuilding a whole app from scratch — expensive, slow, and risky."
          )
        },
        "card-2": {
          investorQuestion: "What makes NVIDIA different from competitors?",
          plainEnglishAnswer: goldAnswer(
            "Speed plus software habit sets NVIDIA apart.",
            "Rivals can ship fast chips too, but retraining every coder and retesting every model takes forever. Teams stay with what already works when deadlines are tight."
          )
        },
        "card-3": {
          investorQuestion: "Why do developers keep building around NVIDIA?",
          plainEnglishAnswer: goldAnswer(
            "Developers build on tools they already know.",
            "Years of school projects, tutorials, and job experience taught coders NVIDIA's stack. New AI projects often default there because nobody wants to learn a whole new system from zero."
          )
        }
      }),
      quizConfig: q({
        passThreshold: PASS,
        questions: [
          {
            kind: "multiple-choice",
            id: "nvda-wts-q1",
            prompt: "Why is NVIDIA hard to replace for many AI teams?",
            choices: [
              "Trust, speed, and tools teams already know",
              "They are the only legal chip seller",
              "Chips never change",
              "Only ads matter"
            ],
            correctIndex: 0,
            explain: "Habit and trust make switching slow and risky — that is stickiness."
          },
          {
            kind: "true-false",
            id: "nvda-wts-q2",
            prompt: "When coders already know your tools, rivals have a harder time stealing customers.",
            correct: true,
            explain:
              "Habit and trust make switching painful — that is a moat, not magic."
          },
          {
            kind: "fill-blank",
            id: "nvda-wts-q3",
            prompt: "Developers keeping code on NVIDIA is a form of customer ___ .",
            options: ["loyalty", "confusion", "luck", "noise"],
            correctIndex: 0,
            explain: "Code and habit outlast one hot product year."
          }
        ]
      })
    },

    [contentKey("business", "competition")]: {
      cards: cards({
        "card-1": {
          investorQuestion: "Who is trying to compete with NVIDIA?",
          plainEnglishAnswer: goldAnswer(
            "AMD, Intel, and cloud rivals compete hard.",
            "AMD and Intel want in, and big cloud companies are trying to build their own chips — like making your own sneakers instead of buying Nike. NVIDIA still wins a lot of deals, but the crowd keeps growing."
          )
        },
        "card-2": {
          investorQuestion: "What trends could help NVIDIA grow even faster?",
          plainEnglishAnswer: goldAnswer(
            "More AI spending pulls more chip orders.",
            "More chatbots, smarter search, AI in your phone — all of that needs more computing power. As long as the AI race keeps heating up, NVIDIA keeps selling."
          )
        },
        "card-3": {
          investorQuestion: "What could slow NVIDIA down in the future?",
          plainEnglishAnswer: goldAnswer(
            "Rivals, custom chips, or export rules bite.",
            "If a rival catches up on speed and price, or government rules block sales to a huge market, growth could cool fast — even if the products stay great."
          )
        }
      }),
      quizConfig: q({
        passThreshold: PASS,
        questions: [
          {
            kind: "multiple-choice",
            id: "nvda-comp-q1",
            prompt: "Why so much fighting over chips?",
            choices: [
              "AI money is huge and everyone wants in",
              "Only one company is allowed",
              "Chips are disappearing",
              "Rivals are banned"
            ],
            correctIndex: 0,
            explain:
              "Huge prize, huge crowd — everyone wants a piece of AI chip demand."
          },
          {
            kind: "true-false",
            id: "nvda-comp-q2",
            prompt: "Government rules about who can buy chips can hurt or help NVIDIA.",
            correct: true,
            explain:
              "Export limits can shut doors fast — that's regulation hitting sales, not theory."
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
            prompt: "When one product pays most of the bills, results can swing a lot.",
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
            prompt: "Profit per share helps you see if owners actually benefit.",
            correct: true,
            explain:
              "EPS tells you what reaches each owner, not just the company total."
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
            prompt: "Inventing new chips is spending on the future, not just waste.",
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
            prompt: "How they spend cash hints at what they think happens next.",
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
            prompt: "People still watch how much cash is promised to chip factories.",
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
            prompt: "They bet big on AI before it was everywhere.",
            correct: true,
            explain:
              "They pushed AI chips early — before AI was on every phone and feed."
          },
          {
            kind: "multiple-choice",
            id: "nvda-m1-q3",
            prompt: "Why do people like bosses paid in stock?",
            choices: [
              "They win or lose when owners do",
              "Stock pay never matters",
              "Pay is random",
              "Bonuses are guaranteed forever"
            ],
            correctIndex: 0,
            explain:
              "When leaders own stock, a price drop hits their wallet too."
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
            prompt: "When bosses own stock, they feel it when the price drops.",
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
            prompt: "Chip shortages and government rules are board-level topics.",
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
            prompt: "Stock owners get a say in big company choices.",
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
            prompt: "They can reward owners and still pay for new chips.",
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
