/**
 * NVIDIA demo — curated copy governed by
 * `src/data/contentRules/investorQuestContentRules.ts` (island + section + question-type rules).
 * Every card completes the loop: situation → problem → explanation → NVIDIA payoff.
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
          plainEnglishAnswer:
            "NVIDIA makes the special chips that help power a lot of today's AI tools, modern video games, and the giant computer rooms behind apps you use every day.\n\nWhen you use ChatGPT or play a new game that looks insanely smooth, there's a good chance NVIDIA technology is involved somewhere in the background. That's what the company does — it sells the speed and power other companies build on top of."
        },
        "card-2": {
          investorQuestion: "What customer problem does NVIDIA fix?",
          plainEnglishAnswer:
            "When AI tools, games, or apps run slowly, people get frustrated and stop using them.\n\nCompanies need huge computing power to process graphics, AI, and massive amounts of data quickly.\n\nSlow performance can mean lost users, unhappy customers, and lost revenue.\n\nNVIDIA builds the powerful chips and technology that help AI tools, games, and data centers run faster and more smoothly."
        },
        "card-3": {
          investorQuestion: "How important is NVIDIA in the AI chip market?",
          plainEnglishAnswer:
            "Right now a huge share of serious AI projects lean on NVIDIA chips — so when big tech keeps ordering, the company looks unstoppable. When orders pause, the mood can flip just as fast.\n\nThat market position is the story: NVIDIA isn't a side supplier, it's often the default choice for the hardest AI work. You're watching whether the world still needs that default."
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
            prompt: "ChatGPT and a lot of AI websites lean on NVIDIA chips.",
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
          plainEnglishAnswer:
            "The customers writing the biggest checks are massive tech and cloud companies — a handful of giants can move a huge slice of revenue. If one pauses orders, NVIDIA feels it quickly.\n\nThat's why who buys matters: NVIDIA's business runs on repeat mega-orders from a small club of powerful buyers."
        },
        "card-2": {
          investorQuestion: "What products make NVIDIA the most money?",
          plainEnglishAnswer:
            "Most dollars lately come from selling high-end chips (and software) to companies building AI — think cloud giants ordering again and again. Gaming chips like GeForce still sell, but they're not the main paycheck anymore.\n\nSo NVIDIA makes money by being the chip supplier behind the AI boom, not by you picking up one card at the mall."
        },
        "card-3": {
          investorQuestion: "Why are companies rushing to buy AI chips?",
          plainEnglishAnswer:
            "Everyone is racing to build AI — chatbots, search, cloud services — and that race needs serious computing power. NVIDIA's chips are a default choice for the hardest work, so orders pile up when budgets shift toward AI.\n\nThe rush is real demand meeting a limited supply of trusted fast chips — not just headlines."
        }
      }),
      quizConfig: q({
        passThreshold: PASS,
        questions: [
          {
            kind: "multiple-choice",
            id: "nvda-wb-q1",
            prompt: "Where does most of NVIDIA's money come from lately?",
            choices: [
              "Huge tech companies buying for AI",
              "A mall chain",
              "Movie tickets",
              "Tractors"
            ],
            correctIndex: 0,
            explain:
              "Big tech AI orders — not everyday shoppers picking up one graphics card."
          },
          {
            kind: "true-false",
            id: "nvda-wb-q2",
            prompt: "They sell in lots of countries, not just one.",
            correct: true,
            explain:
              "Global sales — wherever AI and cloud spending is hottest."
          },
          {
            kind: "multiple-choice",
            id: "nvda-wb-q3",
            prompt: "Why does it matter who the big buyers are?",
            choices: [
              "A few buyers can move the whole company up or down",
              "Only store foot traffic matters",
              "Logo color drives sales",
              "Headlines are the same as cash"
            ],
            correctIndex: 0,
            explain:
              "A few giants placing orders means one pause can hit the whole business hard."
          }
        ]
      })
    },

    [contentKey("business", "everyday-life")]: {
      cards: cards({
        "card-1": {
          investorQuestion: "Where do people interact with NVIDIA technology?",
          plainEnglishAnswer:
            "You usually do not buy an NVIDIA chip at a store — you meet them inside products. ChatGPT feeling fast, a game looking incredible, a cloud app training a model: the speed often traces back to NVIDIA gear in a data center somewhere.\n\nThat is the everyday link — their tech hides inside things you already use."
        },
        "card-2": {
          investorQuestion: "How does NVIDIA affect gaming and AI apps?",
          plainEnglishAnswer:
            "In gaming, GeForce-class chips push frames and graphics you can feel. In AI, their data-center chips help models train and answer without endless waiting.\n\nSame company, two vibes you already know — prettier games and snappier AI."
        },
        "card-3": {
          investorQuestion: "Why do AI companies rely on NVIDIA?",
          plainEnglishAnswer:
            "Serious AI teams want chips and software that are proven fast — not experiments on launch day. NVIDIA earned default status by shipping speed teams can trust and tools developers already know.\n\nWhen builders standardize on you, demand can stick even when hype cycles turn."
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
          plainEnglishAnswer:
            "NVIDIA designs the chips; partner factories (often in Taiwan) build them; then they ship to cloud and tech customers that put them in servers you use indirectly. No NVIDIA store on every corner — it is mostly business-to-business.\n\nWhen that chain works, launches land on time. NVIDIA's job is nailing the design and keeping partners delivering."
        },
        "card-2": {
          investorQuestion: "Who helps manufacture NVIDIA products?",
          plainEnglishAnswer:
            "Partner fabs build the silicon — NVIDIA does not own every factory on earth. That partnership model lets them scale fast but also concentrates risk if a key factory slips.\n\nWho builds is as important as who designs when supply is tight."
        },
        "card-3": {
          investorQuestion: "How does NVIDIA deliver its technology worldwide?",
          plainEnglishAnswer:
            "Chips and boards ship to hyperscalers, PC makers, and partners globally — logistics and allocation decide who gets the next fast thing first.\n\nWorldwide delivery is how a design in California becomes speed in an app you open tonight."
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
          plainEnglishAnswer:
            "A lot of companies choose NVIDIA because the biggest AI and gaming names already trust the chips, and millions of coders know their software. Switching everything is slow, expensive, and risky.\n\nThat is the edge: customers stick because it is the safe, fast default — not because rivals never try."
        },
        "card-2": {
          investorQuestion: "What makes NVIDIA different from competitors?",
          plainEnglishAnswer:
            "Speed plus a software stack teams already trained on — rivals can ship chips, but retraining every developer and retesting every model is painful.\n\nDifference shows up when buyers need results on a deadline, not in a lab slide."
        },
        "card-3": {
          investorQuestion: "Why do developers keep building around NVIDIA?",
          plainEnglishAnswer:
            "CUDA and the broader toolkit mean years of code, courses, and habit point here. New projects default to what already works.\n\nDeveloper habit is a quiet moat — code outlasts one product cycle."
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
          plainEnglishAnswer:
            "Main rivals you will hear about: AMD and Intel on chips, plus huge buyers like Google and Amazon building more in-house. Everyone wants AI money, so the crowd keeps growing.\n\nNVIDIA still wins a lot of orders today because buyers reach for them first — but they have to beat that crowd every year."
        },
        "card-2": {
          investorQuestion: "What trends could help NVIDIA grow even faster?",
          plainEnglishAnswer:
            "More AI spending, bigger models, and more devices needing fast inference all pull for more chips. When the world keeps betting on AI, NVIDIA sells into that wave.\n\nTailwinds help — but only if they keep winning the orders inside the boom."
        },
        "card-3": {
          investorQuestion: "What could slow NVIDIA down in the future?",
          plainEnglishAnswer:
            "Rivals catching up, customers building their own chips, AI budgets cooling, or export rules tightening can all bite. Export limits on advanced chips to China already moved the stock once.\n\nFor NVIDIA, the battlefield is crowded and the rules can change overnight — wins are not guaranteed forever."
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
          plainEnglishAnswer:
            "Revenue jumped hard over the last few years as companies raced to buy AI chips — real orders, not just hype words. That's the growth story in one line.\n\nFor NVIDIA, the open question is whether those buyers keep reordering or already built what they needed — growth stays hot only while the orders keep coming."
        },
        "card-2": {
          plainEnglishAnswer:
            "Most of the surge came from AI/data-center chips. Gaming still pays bills, but it's a smaller slice than it used to be.\n\nSo NVIDIA's growth lately is really an AI-chip story — you're tracking whether AI orders stay the engine."
        },
        "card-3": {
          plainEnglishAnswer:
            "Sales land worldwide, with the heaviest weight wherever cloud and AI budgets are biggest — U.S. and Asia both matter a lot.\n\nNVIDIA captures that by selling into every hot region; if one geography slows, the whole company's growth can wobble with it."
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
          plainEnglishAnswer:
            "Margins rose during the AI rush — tons of demand, tight supply, NVIDIA kept more of each sale. Profits looked great in that stretch.\n\nThat's how NVIDIA turned hot orders into real profit power; margins can fall again if rivals catch up or buyers negotiate harder."
        },
        "card-2": {
          plainEnglishAnswer:
            "Earnings per share (EPS) climbed as total profits rose — more profit split across each share owners hold. Headline revenue is big; EPS is what hits your slice.\n\nNVIDIA has been delivering rising EPS in the good years — that's owners actually benefiting, not just a big company total on a screen."
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
          plainEnglishAnswer:
            "Operating expenses are up — more hiring, more labs, more spend to stay in the AI race. Costs rise because they're trying to lead, not because they're careless.\n\nNVIDIA is betting those dollars buy the next chips buyers still want; that's the efficiency test — spend now to keep revenue later."
        },
        "card-2": {
          plainEnglishAnswer:
            "A big slice goes to inventing future chips and software, not just today's bills. Cut that and you risk showing up with last year's tech.\n\nNVIDIA spends to grow the business — R&D is how they plan to still matter when the current AI wave matures."
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
          plainEnglishAnswer:
            "Operating cash flow has been strong — real money from customers, not just paper profits. Cash rising with sales is the proof people actually paid.\n\nFor NVIDIA, that means the AI boom showed up in the bank account, which is why investors trust the results more than a viral headline."
        },
        "card-2": {
          plainEnglishAnswer:
            "They use cash to fund more invention, buy back shares, and pay a modest dividend. Buybacks shrink the share count so future profit is split fewer ways.\n\nNVIDIA's message with that spending: keep building the next chip while also rewarding people who own the stock."
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
          plainEnglishAnswer:
            "They have more cash muscle than scary debt right now — earnings and cash outweigh debt pressure for most comparisons. That's breathing room.\n\nFor NVIDIA, financial strength means they can survive a softer quarter and still pay for the next chip without panic borrowing."
        },
        "card-2": {
          plainEnglishAnswer:
            "Even with low debt, big future bills matter — prepaying factories, heavy R&D, cash to owners via buybacks and dividends. Those promises can tie up money.\n\nNVIDIA is strong today, but you're still watching whether future chip commitments eat cash they might need if sales slow."
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
          plainEnglishAnswer:
            "Jensen Huang co-founded NVIDIA and still runs it as CEO — the face in interviews. He leads a team covering finance, operations, and engineering.\n\nThat matters because you're trusting people who already steered the company through gaming cycles and the AI pivot, not a newcomer learning the industry."
        },
        "card-2": {
          investorQuestion: "How long has NVIDIA's CEO been in charge?",
          plainEnglishAnswer:
            "Huang has been CEO for decades, not months. That long run let NVIDIA bet big on AI chips before AI was everywhere.\n\nLong tenure gives NVIDIA steady direction — and it's why a CEO change would be a massive event for the stock."
        },
        "card-3": {
          investorQuestion: "What has NVIDIA's leadership actually delivered?",
          plainEnglishAnswer:
            "Under this team NVIDIA became a top AI chip supplier and one of the world's largest companies — real chip shipments and revenue during the AI rush, not just talk.\n\nThat's the delivery record: they turned the AI bet into sales while rivals were still catching up."
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
          plainEnglishAnswer:
            "Top leaders hold meaningful NVIDIA stock, so when the price moves, so does a chunk of their wealth. Pay is tied to owners more than a flat salary alone.\n\nThat's how NVIDIA aligns bosses with shareholders — they feel a drop in the stock in their own pocket."
        },
        "card-2": {
          investorQuestion:
            "Does executive pay at NVIDIA match how the company performed?",
          plainEnglishAnswer:
            "Pay rose when the stock and profits rose — that matched the good years. The test ahead is whether pay falls if results cool.\n\nFor owners, fair pay means NVIDIA leaders don't cash giant checks while the business is clearly sliding."
        },
        "card-3": {
          investorQuestion: "How is executive pay structured at NVIDIA?",
          plainEnglishAnswer:
            "Mix of salary, bonuses, and stock that vests over time. Stock unlocking later rewards staying and performing, not one lucky quarter.\n\nThat structure is supposed to keep NVIDIA leaders building long-term value instead of chasing a short pop."
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
          plainEnglishAnswer:
            "The board oversees the CEO and asks hard questions — not just applause. With one leader for decades, someone needs to push back when hype runs hot.\n\nFor NVIDIA owners, a working board means there's a check on big bets before they become expensive mistakes."
        },
        "card-2": {
          investorQuestion:
            "What big risks does NVIDIA's board keep an eye on?",
          plainEnglishAnswer:
            "They stress-test supply, export rules, rivals catching up, and succession if the CEO ever leaves. Dry meetings, real dangers.\n\nThe board's job is to make sure NVIDIA spots those risks early — so the company can fix course before owners take the full hit."
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
          plainEnglishAnswer:
            "You get to vote on directors and some major choices — small voice per share, but real. Huge funds own big stakes, so their votes move outcomes.\n\nOwning NVIDIA stock means you're not just watching — you help pick who's in charge."
        },
        "card-2": {
          investorQuestion:
            "What rules and disclosures does NVIDIA publish for owners?",
          plainEnglishAnswer:
            "They publish board rules, ethics basics, and how executive pay is set. Boring pages, but they show who's in control.\n\nFor you as an owner, that transparency is how NVIDIA proves pay and power aren't changing in secret overnight."
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
          plainEnglishAnswer:
            "Leaders highlight cash in the bank and manageable debt so you know they can fund the next chip even if one quarter disappoints. Cash is runway, not a trophy.\n\nNVIDIA points to that strength so you trust they can keep inventing through a rough patch — not freeze up."
        },
        "card-2": {
          investorQuestion:
            "What financial promises could squeeze NVIDIA even with low debt?",
          plainEnglishAnswer:
            "Future chip factory payments, heavy R&D, and cash returned via buybacks and dividends can still tie up money. Low debt doesn't mean unlimited free cash.\n\nFor NVIDIA, the squeeze risk is big commitments landing at once while sales slow — that's what leaders should be managing before it bites."
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
          plainEnglishAnswer:
            "The case for trust: long-time CEO, real AI results, pay tied to stock, board watching supply and policy. They shipped chips and revenue during the rush — not just slogans.\n\nThe case for caution: no team stays hot forever. Your verdict is whether this leadership can keep winning if AI orders slow — that's the one-minute people story on NVIDIA."
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
