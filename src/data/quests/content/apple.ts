/**
 * Apple (AAPL), hand-authored quest content overrides.
 *
 * Placeholder for the eventual SEC -> AI pipeline. Each override
 * provides the plain-English answer(s) and (optionally) a quiz config
 * that becomes available once the parent quest is marked read.
 */
import type { CompanyContent } from "@/data/quests/content/types";
import { contentKey } from "@/data/quests/content/types";
export const APPLE_CONTENT: CompanyContent = {
  companyId: "aapl",
  overrides: {
    [contentKey("business", "why-buying")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Most of Apple's money still comes from iPhone.\n\nMac, iPad, Watch, and AirPods add the rest.\n\nApple also earns recurring revenue from App Store fees, iCloud, Music, TV+, and Apple Pay every month.\n\nWhy investors care:\nRepeat spend from the same customers is steadier than one-off hardware spikes.",
          investorInsight:
            "Services growing on top of iPhone is why many investors watch recurring revenue as closely as new device launches."
        },
        "card-2": {
          plainEnglishAnswer:
            "Apple sells everywhere, across Americas, Europe, Greater China, Japan, and the rest of Asia Pacific.\n\nNo region is a rounding error; China demand alone can swing the stock.\n\nGlobal reach diversifies growth, but it also imports world headlines into one ticker.\n\nWhy investors care:\nInvestors track which regions are hot because a slowdown in one big market can dent a giant revenue base."
        },
        "card-3": {
          plainEnglishAnswer:
            "Apple mainly sells to consumers willing to pay more for premium devices and a connected ecosystem.\n\nThey come back for seamless devices, App Store habits, and services that stack on the phone they already own.\n\nDevelopers build for iOS because that is where paying users already are, which reinforces the loop.\n\nWhy investors care:\nPremium buyers who stay in the ecosystem support higher margins and steadier revenue than one-off discount phone sales.",
          investorInsight:
            "A defined premium segment plus ecosystem lock-in is why Apple can charge more and earn repeat services revenue, not just one-time hardware sales."
        }
      },
      quizConfig: {
        passThreshold: 0.66,
        questions: [
          {
            kind: "odd-one-out",
            id: "revenue-q1",
            prompt:
              "Which of these is not a real way Apple makes money?",
            choices: [
              "iPhone sales",
              "App Store fees",
              "Apple Music subscriptions",
              "Oil drilling royalties"
            ],
            oddIndex: 3,
            explain:
              "Apple earns from hardware (iPhone, Mac, iPad, wearables) and recurring services (App Store, Apple Music, iCloud, Apple TV+, Apple Pay). Energy is not one of them."
          },
          {
            kind: "multiple-choice",
            id: "revenue-q2",
            prompt:
              "Which Apple product is described as its biggest revenue driver?",
            choices: ["Mac", "iPad", "iPhone", "Apple Watch"],
            correctIndex: 2,
            explain:
              "iPhone is Apple's biggest revenue driver. Mac, iPad, and wearables round out the hardware mix, with Services adding recurring revenue on top."
          },
          {
            kind: "fill-blank",
            id: "revenue-q3",
            prompt:
              "Apple's ___ business is a growing source of recurring revenue alongside its hardware sales.",
            options: ["Vehicle", "Services", "Advertising", "Banking"],
            correctIndex: 1,
            explain:
              "Apple's Services line. App Store, iCloud, Apple Music, Apple TV+, Apple Pay, provides recurring revenue that compounds on top of one-time hardware sales."
          }
        ]
      }
    },
    [contentKey("business", "how-it-works")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "You can grab Apple gear in its stores, online, through phone carriers, or at partners like Best Buy.\n\nApple designs in California; partners build and ship at massive scale.\n\nUpdates and services hit your device directly, that's how Apple controls the experience end to end.\n\nWhy investors care:\nOwning the customer relationship protects margin when competitors race to the bottom on price."
        },
        "card-2": {
          plainEnglishAnswer:
            "Thousands of engineers, designers, retail staff, and operations people run the machine behind each launch.\n\nA new iPhone drop in fifty countries on the same day is not luck, it's choreography.\n\nMiss that window and empty shelves become front-page news.\n\nWhy investors care:\nExecution risk shows up in sales immediately, investors watch launch timing and supply snags closely."
        }
      },
      quizConfig: {
        passThreshold: 0.66,
        questions: [
          {
            kind: "order",
            id: "operations-q1",
            prompt:
              "Put the typical journey of an Apple product into the right order, from idea to customer.",
            steps: [
              "Designed at Apple (engineering, software, design)",
              "Manufactured by partners across Apple's supply chain",
              "Distributed through global logistics networks",
              "Sold to customers via Apple's channels (retail, online, carriers, partners)"
            ],
            explain:
              "Apple designs in-house, then leans on manufacturing partners, global logistics, and a wide mix of channels to actually get products into customers' hands."
          },
          {
            kind: "scenario",
            id: "operations-q2",
            prompt:
              "A key manufacturing partner hits a major disruption. What should worry you first as an investor?",
            choices: [
              "Supply delays could pressure production, sales, and margins",
              "Manufacturing never matters for a company Apple's size",
              "Services revenue automatically doubles overnight",
              "The stock price must fall exactly 10% that day"
            ],
            correctIndex: 0,
            explain:
              "Apple depends on manufacturing partners as a core part of its operations. A disruption can ripple into supply, sales, and margins, which is exactly why supply-chain concentration is something investors watch."
          },
          {
            kind: "true-false",
            id: "operations-q3",
            prompt:
              "Apple's products only reach customers through Apple's own retail stores.",
            correct: false,
            explain:
              "Apple sells through Apple retail stores, online stores, telecom carriers, wholesalers, and third-party retailers, a deliberately broad channel mix that helps reduce reliance on any single one."
          }
        ]
      }
    },
    [contentKey("business", "why-they-stay")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Apple invests heavily in R&D to improve its devices, chips, software, and AI capabilities.\n\nThat spending supports integrated features across iPhone, Mac, and iPad, including Apple silicon in Macs.\n\nIf R&D slows, rivals can catch up on speed, cameras, and how well products work together.\n\nWhy investors care:\nSteady R&D helps Apple defend premium pricing and keep customers upgrading."
        },
        "card-2": {
          plainEnglishAnswer:
            "Apple's edge comes from its brand, proprietary chips, software, and products that work together.\n\nCustomers stay because photos, messages, and subscriptions are tied to Apple devices.\n\nSwitching platforms means rebuilding habits and paid services.\n\nWhy investors care:\nHard-to-leave customers support higher prices and more Services revenue per buyer."
        }
      },
      quizConfig: {
        passThreshold: 0.66,
        questions: [
          {
            kind: "match",
            id: "advantage-q1",
            prompt:
              "Match each Apple strength to the category that best describes it.",
            pairs: [
              { left: "Apple silicon chips", right: "Proprietary technology" },
              {
                left: "iPhone + iCloud + Apple Watch + AirPods working together",
                right: "Ecosystem lock-in"
              },
              { left: "A globally recognised logo", right: "Brand power" }
            ],
            explain:
              "Apple's advantage comes from proprietary tech, products that work together, and a brand customers trust."
          },
          {
            kind: "red-flag",
            id: "advantage-q2",
            prompt:
              "You're checking on Apple's competitive moat. Which of these would be a warning sign for an investor?",
            choices: [
              "Continued investment in proprietary chips and AI",
              "A patent portfolio that stays strong",
              "Customers losing interest in the ecosystem and switching easily",
              "A brand that stays globally recognised"
            ],
            flagIndex: 2,
            explain:
              "Apple's moat is held up by brand, IP, ecosystem lock-in, and customer loyalty. If customers stop caring and switch easily, the whole defence weakens fast."
          },
          {
            kind: "multiple-choice",
            id: "advantage-q3",
            prompt: "Why does Apple invest heavily in research and development?",
            choices: [
              "To reduce headcount",
              "To pay out higher dividends",
              "To stay competitive by improving hardware, software, AI, chips, and ecosystem integration",
              "To exit consumer markets"
            ],
            correctIndex: 2,
            explain:
              "Apple uses R&D to improve hardware, software, and how its products work together. That makes the offer harder for rivals to copy."
          }
        ]
      }
    },
    [contentKey("business", "competition")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "On phones it's Samsung and Google; on PCs it's Microsoft; streaming bumps into Amazon and Sony.\n\nHuawei still matters in China.\n\nApple usually fights upstairs, fewer phones sold, more profit per phone.\n\nWhy investors care:\nPremium share is smaller but juicier; investors watch whether rivals can pull people downmarket."
        },
        "card-2": {
          plainEnglishAnswer:
            "Android phones keep improving for less money each year.\n\nApple does not win on the lowest sticker. It wins on brand, its own chips, and customers who do not want to rebuild their digital life.\n\nA strong rival year can still stretch upgrade cycles.\n\nWhy investors care:\nIf upgrades slow, hardware revenue can dip even when loyalty stays high."
        },
        "card-3": {
          plainEnglishAnswer:
            "Governments keep poking the App Store, payments, and privacy rules.\n\nTrade fights and tax fights show up country by country.\n\nOne court case on app fees can nick high-margin Services cash, no bad iPhone required.\n\nWhy investors care:\nRegulation can change the profit pool without Apple losing a product battle."
        }
      },
      quizConfig: {
        passThreshold: 0.66,
        questions: [
          {
            kind: "scenario",
            id: "industry-q1",
            prompt:
              "Regulators push alternative app stores on iPhone. What is the most realistic investor concern?",
            choices: [
              "App Store revenue could shrink if fees and traffic shift away",
              "Brand value becomes irrelevant overnight",
              "Hardware sales are legally banned globally",
              "Operating margins must triple automatically"
            ],
            correctIndex: 0,
            explain:
              "App Store practices are one of Apple's most-regulated areas. Forced alternatives could reduce the fees Apple collects from in-app purchases, exactly the kind of regulation that increases costs or limits operations."
          },
          {
            kind: "odd-one-out",
            id: "industry-q2",
            prompt:
              "Which company is not a real rival in Apple's competitive set?",
            choices: ["Samsung", "Google", "ExxonMobil", "Microsoft"],
            oddIndex: 2,
            explain:
              "Apple competes with Samsung, Google, Microsoft, Amazon, Huawei, and Sony across smartphones, computers, wearables, services, and entertainment. ExxonMobil is an oil company."
          },
          {
            kind: "true-false",
            id: "industry-q3",
            prompt:
              "The technology industry is a low-competition space where market leaders stay safe without much innovation.",
            correct: false,
            explain:
              "Tech is brutal and fast, rivals fight on price, features, and experience every year. No leader gets to coast."
          }
        ]
      }
    },
    [contentKey("business", "what-they-do")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Apple makes tech products people use every day, like iPhones, Macs, iPads, AirPods, and Apple Watches.\n\nApple also earns recurring revenue from the App Store, iCloud, subscriptions, and accessories after the device is sold.\n\nWhy investors care:\nRepeat spending from the same customers is steadier than one-off hardware sales."
        },
        "card-2": {
          plainEnglishAnswer:
            "Apple makes technology feel simple and connected.\n\nPeople can move photos, messages, apps, and files easily between devices without needing to think about it too much.\n\nFor many customers, Apple products save time, reduce frustration, and work smoothly together in everyday life."
        }
      },
      quizConfig: {
        passThreshold: 0.66,
        questions: [
          {
            kind: "true-false",
            id: "snapshot-q1",
            prompt:
              "Apple's products are designed to work together so customers can move easily between devices and services.",
            correct: true,
            explain:
              "That's the heart of Apple's ecosystem: iPhone, Mac, iPad, Apple Watch, AirPods, and services all feel seamless together, which is exactly what keeps customers loyal."
          },
          {
            kind: "multiple-choice",
            id: "snapshot-q2",
            prompt:
              "Which part of Apple's business has become a major recurring revenue engine?",
            choices: [
              "Cloud computing for enterprises",
              "Services, iCloud, App Store, Apple Music, Apple TV+, Apple Pay",
              "Electric vehicles",
              "Search advertising"
            ],
            correctIndex: 1,
            explain:
              "Apple sells premium devices, then keeps customers connected through its Services layer. Services has grown into a major *recurring* revenue engine alongside hardware."
          },
          {
            kind: "fill-blank",
            id: "snapshot-q3",
            prompt:
              "Apple's core offer is premium devices plus ___ that deepen loyalty and recurring revenue.",
            options: [
              "commodity hardware only",
              "integrated services",
              "enterprise consulting",
              "retail store leases"
            ],
            correctIndex: 1,
            explain:
              "Hardware gets customers in the door. Services (App Store, iCloud, Music, TV+, Pay) keep them paying over time. That's the ecosystem investors watch."
          }
        ]
      }
    },

    // =====================================================================
    // Financials pillar (placeholder demo content for MVP)
    //
    // Numbers below are illustrative placeholders aligned with Apple's
    // publicly reported figures around FY21-FY23. They are not a substitute
    // for live filings, replace via the SEC -> AI pipeline when it ships.
    // =====================================================================

    [contentKey("financials", "growth")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Revenue climbed from about $365B (FY2021) to a peak near $394B (FY2022), then eased to roughly $383B (FY2023).\n\nThat's mid-single-digit growth on an already massive base, at this size, every extra percent is billions, not a rounding error.\n\nSlower top-line growth isn't automatically failure; it's what happens when you're already one of the biggest companies on earth."
        },
        "card-2": {
          plainEnglishAnswer:
            "A rough product-mix split of Apple's revenue:\n• iPhone. ~52%\n• Services (App Store, iCloud, Music, TV+, AppleCare, payments). ~22%\n• Wearables, Home & Accessories (Watch, AirPods, HomePod). ~10%\n• Mac. ~8%\n• iPad. ~8%\n\niPhone is still the centre of gravity, but the most interesting trend is Services, it has grown roughly double-digit every year and now carries significantly higher margins than hardware."
        },
        "card-3": {
          plainEnglishAnswer:
            "A rough geographic split of Apple's revenue:\n• Americas. ~43%\n• Europe. ~25%\n• Greater China. ~19%\n• Japan. ~6%\n• Rest of Asia Pacific. ~7%\n\nApple is genuinely global, no single region dominates beyond the Americas, and Greater China is large enough that headlines about Chinese demand often move the stock."
        }
      },
      quizConfig: {
        passThreshold: 0.66,
        questions: [
          {
            kind: "bull-bear",
            id: "growth-q1",
            prompt:
              "Apple's revenue grew from ~$365B in FY21 to ~$383B in FY23, mid-single-digit growth on a giant base.",
            caption: "Take a stance",
            correct: "bull",
            labels: { bull: "Bullish", bear: "Bearish" },
            explain:
              "For a company already over $380B in revenue, mid-single-digit growth is solid, at that scale, every percentage point is tens of billions of dollars. Compare it to most peers and you'll see why investors lean bullish."
          },
          {
            kind: "multiple-choice",
            id: "growth-q2",
            prompt:
              "Which product line is Apple's single largest source of revenue?",
            choices: ["Mac", "Services", "iPhone", "Wearables"],
            correctIndex: 2,
            explain:
              "iPhone is still roughly half of Apple's total revenue. Services is the fastest-growing segment, but iPhone is the engine that funds everything else, for now."
          },
          {
            kind: "swipe-cards",
            id: "growth-q3",
            prompt:
              "For each statement about Apple's revenue mix, decide: good sign or warning sign?",
            cards: [
              {
                text: "Services revenue is growing at double-digit rates.",
                verdict: "good"
              },
              {
                text: "Roughly 19% of Apple's revenue comes from Greater China.",
                verdict: "warning"
              },
              {
                text: "Apple sells in every major region of the world.",
                verdict: "good"
              },
              {
                text: "iPhone is still ~52% of total revenue.",
                verdict: "warning"
              }
            ],
            explain:
              "Diversified geography and fast-growing Services are clear strengths. Concentration risks, heavy exposure to a single country (China) and a single product (iPhone), are the offsetting warnings investors should keep on their dashboard."
          }
        ]
      }
    },

    [contentKey("financials", "profitability")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Apple's profit margins have been gradually improving:\n• Gross margin. ~42% (FY21) → ~44-46% (FY23). Up.\n• Operating margin. ~30% range, holding or modestly improving.\n\nThe quiet driver behind the upward trend is mix: Services revenue carries dramatically higher gross margin (~70%) than hardware (~35%). Every dollar of Services growth pulls the company-wide margin up a little."
        },
        "card-2": {
          plainEnglishAnswer:
            "Yes. Apple's earnings per share has grown faster than net income.\n• FY21 diluted EPS. ~$5.61\n• FY22 diluted EPS. ~$6.11\n• FY23 diluted EPS. ~$6.13\n\nTwo levers are working at once: profits are growing slowly, and Apple's aggressive buyback program is shrinking the share count by ~3-4% a year. Fewer slices means each slice is bigger, even when the whole pie is barely changing."
        }
      },
      quizConfig: {
        passThreshold: 0.66,
        questions: [
          {
            kind: "true-false",
            id: "profitability-q1",
            prompt:
              "Apple's gross margin has been trending higher over the last few years, mostly because of mix shift toward Services.",
            correct: true,
            explain:
              "Services carries roughly 70% gross margin vs. ~35% for hardware. As Services grows faster than hardware, the blended company margin drifts up, exactly what the income statement has been showing."
          },
          {
            kind: "risk-meter",
            id: "profitability-q2",
            prompt:
              "How would you rate the risk of Apple's operating margin collapsing in the near term?",
            scaleMax: 5,
            correctLevel: 2,
            levelLabels: ["Very low", "Low", "Medium", "High", "Critical"],
            explain:
              "Apple's margin is protected by brand, ecosystem, and Services mix, but no margin is permanent. 'Low' (not 'very low') is the honest read: regulatory pressure on the App Store, smartphone demand cycles, or supply-chain shocks could each take a bite."
          },
          {
            kind: "fill-blank",
            id: "profitability-q3",
            prompt:
              "Apple's EPS often grows faster than its net income because aggressive _____ reduce the share count.",
            options: ["buybacks", "dividends", "tax credits", "acquisitions"],
            correctIndex: 0,
            explain:
              "Apple has been buying back ~3-4% of its shares every year for a decade. Fewer shares = each share earns a bigger slice of profit, that's why EPS rises even when net income is roughly flat."
          }
        ]
      }
    },

    [contentKey("financials", "expenses")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Apple's operating expenses (R&D + SG&A) have grown roughly in step with the business, not faster:\n• Total opex, around $55B per year today, up from ~$45B three years ago.\n• R&D. ~$30B (up from ~$22B)\n• SG&A. ~$25B (relatively flat)\n\nBecause revenue grew by a similar percentage, operating margin held steady. The fact that R&D rose faster than SG&A is actually a good sign. Apple is leaning into future products, not just paying for overhead."
        },
        "card-2": {
          plainEnglishAnswer:
            "Yes. Apple's main growth investment buckets are:\n• R&D. ~$30B per year (Apple Silicon, Vision Pro, AI, health, Services infra)\n• Capex. ~$10-12B per year (data centers, retail, manufacturing tooling)\n• Acquisitions, small, tuck-in deals\n\nR&D in particular has more than doubled over the last decade. Whether the bets pay off depends on what you think of Apple Silicon, Vision Pro, and the company's AI roadmap, but the *willingness* to invest is clearly there."
        }
      },
      quizConfig: {
        passThreshold: 0.66,
        questions: [
          {
            kind: "scenario",
            id: "expenses-q1",
            prompt:
              "Apple reports that R&D rose 12% this year while revenue rose only 4%. What's the most useful first question to ask?",
            choices: [
              "Should I sell immediately?",
              "Is the extra R&D funding identifiable new products, or is it overhead creep?",
              "Are buybacks still happening?",
              "Did the CEO change?"
            ],
            correctIndex: 1,
            explain:
              "R&D outpacing revenue isn't automatically bad, it can mean Apple is investing ahead of a product cycle. The right first question is *what* the money is buying. If you can point to specific bets (Apple Silicon, Vision Pro, AI), it's growth investment; if not, it's cost creep."
          },
          {
            kind: "match",
            id: "expenses-q2",
            prompt:
              "Match each expense bucket to what it actually does for Apple.",
            pairs: [
              {
                left: "R&D",
                right: "Fund tomorrow's products, chips, AI, new categories."
              },
              {
                left: "Selling, general & admin",
                right:
                  "Run the day-to-day, marketing, retail, corporate overhead."
              },
              {
                left: "Capex",
                right:
                  "Build the physical capacity, data centers, stores, manufacturing tools."
              }
            ],
            explain:
              "R&D builds the future. SG&A keeps the present running. Capex is the bricks and silicon that everything else depends on. A healthy company funds all three, and Apple does."
          },
          {
            kind: "multiple-choice",
            id: "expenses-q3",
            prompt:
              "Which expense line is Apple's biggest growth-oriented investment?",
            choices: ["Sales & marketing", "G&A overhead", "R&D", "Audit fees"],
            correctIndex: 2,
            explain:
              "R&D is now Apple's largest growth-oriented spend, at roughly $30B per year. That money has been quietly funding Apple Silicon, the M-series chips, Vision Pro, and AI capabilities."
          }
        ]
      }
    },

    [contentKey("financials", "cash")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Yes. Apple's operating cash flow has held in the very strong $100B+ per year range over the last three years.\n\n• Operating cash flow. ~$104B (FY21) → ~$122B (FY22) → ~$110B (FY23)\n• Net income tracks closely, which is a sign earnings quality is high.\n\nThe lumpiness quarter-to-quarter is mostly working-capital noise (inventory and payables timing). The trailing 12-month trend is what matters, and that trend is steady-to-up."
        },
        "card-2": {
          plainEnglishAnswer:
            "Apple deploys cash with a clear hierarchy:\n• Share buybacks. ~$80-90B per year (biggest by far)\n• R&D. ~$30B per year\n• Dividends. ~$15B per year\n• Capex. ~$10-12B per year\n• M&A, small, tuck-in only\n\nThe headline: Apple returns more than $90B a year to shareholders via buybacks + dividends. Critics say it should be more aggressive on M&A (especially in AI). Supporters argue the discipline is part of what made the stock such a strong compounder."
        }
      },
      quizConfig: {
        passThreshold: 0.66,
        questions: [
          {
            kind: "bull-bear",
            id: "cash-q1",
            prompt:
              "Apple generates ~$100B+ in operating cash flow every year and its operating cash flow tracks closely with net income.",
            caption: "Take a stance",
            correct: "bull",
            labels: { bull: "Bullish", bear: "Bearish" },
            explain:
              "Huge, consistent cash generation that lines up with reported earnings is a textbook bullish signal, it means profits are real and there's plenty of fuel for buybacks, dividends, and reinvestment."
          },
          {
            kind: "odd-one-out",
            id: "cash-q2",
            prompt:
              "Three of these are real ways Apple uses its cash. Pick the odd one out.",
            choices: [
              "Share buybacks",
              "Dividends",
              "Research & development",
              "Unrelated side ventures with no link to the core business"
            ],
            oddIndex: 3,
            explain:
              "Apple's cash goes mainly to buybacks, dividends, R&D, capex, and small acquisitions, not random bets outside the franchise."
          },
          {
            kind: "order",
            id: "cash-q3",
            prompt:
              "Drag Apple's annual cash uses into order, biggest at the top, smallest at the bottom.",
            steps: [
              "Share buybacks (~$80-90B)",
              "R&D (~$30B)",
              "Dividends (~$15B)",
              "Capex (~$10-12B)"
            ],
            explain:
              "Buybacks dominate. Apple is one of the most aggressive buyback companies in history. R&D comes next, then dividends, then capex. Understanding this hierarchy tells you what management really prioritises."
          }
        ]
      }
    },

    [contentKey("financials", "financial-strength")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Apple actually carries both, but cash and investments are bigger than debt.\n\n• Cash + short-term investments. ~$60-70B\n• Long-term marketable securities. ~$100B+\n• Long-term debt. ~$100B\n\nMost of the debt was issued cheaply during the low-rate years. On a *net* basis (assets minus debt), Apple is close to zero or slightly positive, and it generates ~$100B of free cash flow every year on top of that. The balance sheet is genuinely strong."
        },
        "card-2": {
          plainEnglishAnswer:
            "Beyond long-term debt, Apple's biggest other obligations are:\n• Operating leases, primarily its global retail-store footprint and corporate offices\n• Manufacturing purchase commitments, multi-year deals with key suppliers (chips, displays, etc.)\n• Deferred revenue and warranty obligations, money owed in services not yet delivered\n• Supplier financing arrangements, short-term, but worth tracking\n\nNone of these are alarming on their own. They're disclosed in the 10-K footnotes, and on the scale of Apple's cash generation, all of them combined still leave the company comfortably solvent."
        }
      },
      quizConfig: {
        passThreshold: 0.66,
        questions: [
          {
            kind: "risk-meter",
            id: "financial-strength-q1",
            prompt:
              "Given Apple's cash, investments, and ~$100B of annual free cash flow, how would you rate its overall balance-sheet risk?",
            scaleMax: 5,
            correctLevel: 1,
            levelLabels: ["Very low", "Low", "Medium", "High", "Critical"],
            explain:
              "Apple has more liquid assets than total long-term debt and generates ~$100B of free cash flow a year. Balance-sheet risk here is genuinely 'very low', the realistic risks for Apple sit in competition and regulation, not solvency."
          },
          {
            kind: "true-false",
            id: "financial-strength-q2",
            prompt:
              "Apple's cash plus marketable investments are larger than its long-term debt.",
            correct: true,
            explain:
              "Cash + short-term investments (~$60-70B) plus long-term marketable securities (~$100B+) comfortably exceed long-term debt (~$100B). That's why investors talk about Apple's *net* debt position, and why it stays comfortably negative or near zero."
          },
          {
            kind: "multiple-choice",
            id: "financial-strength-q3",
            prompt:
              "Which is Apple's single largest financial obligation today?",
            choices: [
              "Operating leases on retail stores",
              "Long-term debt (corporate bonds)",
              "Deferred revenue on services",
              "Warranty reserves"
            ],
            correctIndex: 1,
            explain:
              "Long-term debt of ~$100B is Apple's biggest financial obligation by a wide margin. Operating leases, deferred revenue, and warranty reserves are smaller line items disclosed in the 10-K footnotes."
          }
        ]
      }
    },

    // =====================================================================
    // Forces pillar. Inside / Outside paths (placeholder demo content)
    // =====================================================================

    [contentKey("forces", "inside-forces")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Apple designs its own chips, runs its own stores, and pushes huge volume through a tight launch calendar every year.\n\nWhen a new iPhone lands on time at scale, that's operational muscle, miss a window and revenue disappears for a quarter.\n\nQuality glitches at this volume are expensive; investors watch return rates and launch delays."
        },
        "card-2": {
          plainEnglishAnswer:
            "Most manufacturing happens at partners in Asia, with multi-year orders for screens, chips, and memory locked in advance.\n\nThat locks capacity when demand is hot, but one key supplier going offline can empty shelves fast.\n\nThe question isn't whether Apple has supply risk; it's whether enough backup exists when the next shock hits."
        },
        "card-3": {
          plainEnglishAnswer:
            "A bad iCloud outage or App Store scandal hits trust, not just IT. Services revenue depends on people believing Apple keeps data safe.\n\nApple controls hardware and software, which helps security, but regulators keep poking at platform rules.\n\nCyber and policy headlines can move the stock even when iPhone sales look fine."
        },
        "card-4": {
          plainEnglishAnswer:
            "Apple throws off roughly $100B+ of cash a year and still sits on a pile of cash and investments bigger than its long-term debt.\n\nBuybacks and dividends return tens of billions to shareholders annually.\n\nIf revenue flatlined for two years, could Apple still fund R&D and those returns? Today most investors say yes, but that's the stress test."
        },
        "card-5": {
          plainEnglishAnswer:
            "People pay Apple prices because the brand signals quality and the experience feels safe.\n\nLoyal users upgrade on a rhythm; Services attach because the devices already in the bag are Apple.\n\nA major safety scare or ugly App Store fight can dent trust, and in gadgets, trust is demand."
        }
      },
      quizConfig: {
        passThreshold: 0.66,
        questions: [
          {
            kind: "true-false",
            id: "inside-forces-q1",
            prompt:
              "For Apple, a major cyberattack on iCloud is unlikely to matter to investors because Services is a small part of revenue.",
            correct: false,
            explain:
              "Services is now a very large, high-margin business, and iCloud is part of the trust fabric for the whole ecosystem. A serious breach could hurt both revenue and the premium multiple."
          },
          {
            kind: "scenario",
            id: "inside-forces-q2",
            prompt:
              "A major display supplier cannot ship panels for a quarter. What is the realistic takeaway?",
            choices: [
              "Near-term revenue and product mix could suffer until supply recovers",
              "Large companies are immune to any supply shock",
              "Competitors automatically gain 100% market share",
              "The balance sheet forces bankruptcy within a week"
            ],
            correctIndex: 0,
            explain:
              "Even Apple concentrates some critical components. A panel shortage is a classic 'execution + supply chain' shock, it can delay launches, skew mix, and hit margins until supply normalises."
          },
          {
            kind: "red-flag",
            id: "inside-forces-q3",
            prompt: "Which statement is the biggest red flag for internal execution?",
            choices: [
              "Rising warranty accruals alongside rising return rates",
              "Growing Services revenue with expanding gross margin",
              "R&D spend rising in line with new product categories",
              "Cash from operations comfortably covering capex and buybacks"
            ],
            flagIndex: 0,
            explain:
              "Rising warranty accruals *plus* rising returns often precedes quality or demand issues, exactly the kind of internal execution signal investors dig into first."
          }
        ]
      }
    },

    [contentKey("forces", "outside-forces")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Phones and PCs are crowded, but Apple usually fights at the high end where profit per device is fatter.\n\nSamsung and Google push Android; Chinese brands undercut on price in many markets.\n\nIf a $800 Android feels close enough to a $1,200 iPhone, people delay upgrades, that's the bear case in one sentence."
        },
        "card-2": {
          plainEnglishAnswer:
            "Governments keep testing App Store fees, payment rules, and whether rivals get equal footing on iPhone.\n\nA clear settlement can remove overhang; forced sideloading or lower take-rates shrink high-margin Services cash.\n\nRegulation changes the rules of the platform, competitors don't have to beat Apple on product alone."
        },
        "card-3": {
          plainEnglishAnswer:
            "Weak spending in China or Europe shows up in iPhone cycles; a strong dollar makes overseas sales look smaller in dollars.\n\nMemory, shipping, and energy costs nibble at margins when they spike.\n\nAt Apple's size, losing a few points of growth is tens of billions, enough to reset the whole narrative."
        }
      },
      quizConfig: {
        passThreshold: 0.66,
        questions: [
          {
            kind: "multiple-choice",
            id: "outside-forces-q1",
            prompt:
              "Which external force most directly threatens Apple's high-margin Services narrative?",
            choices: [
              "A new CPU design from Apple's silicon team",
              "Regulatory pressure on App Store fees and in-app payments",
              "A faster SSD in MacBook Pro",
              "An internal HR policy on remote work"
            ],
            correctIndex: 1,
            explain:
              "App Store economics are an *external* legal/regulatory battle, exactly the kind of force that can compress take-rates without Apple 'mis-executing' operationally."
          },
          {
            kind: "odd-one-out",
            id: "outside-forces-q2",
            prompt: "Pick the odd one out, three are classic *external* forces.",
            choices: [
              "FX headwinds on reported revenue",
              "Antitrust scrutiny of mobile platforms",
              "A supplier factory fire delaying panels",
              "iOS engineers improving camera software"
            ],
            oddIndex: 3,
            explain:
              "Engineering improvements are internal execution. FX, antitrust, and supplier fires are external shocks that can move results even when Apple's roadmap is on track."
          },
          {
            kind: "red-flag",
            id: "outside-forces-q3",
            prompt:
              "Which risk is primarily driven by regulators and courts rather than product rivals?",
            choices: [
              "A competitor launching a cheaper phone",
              "Antitrust rules on App Store fees and payments",
              "Samsung improving OLED panels",
              "Apple engineers shipping a faster chip"
            ],
            flagIndex: 1,
            explain:
              "Competition mostly threatens demand and pricing power; regulation threatens the rules of the platform itself. Separating the two is a core investor skill."
          }
        ]
      }
    },

    // =====================================================================
    // Management pillar. Apple demo answers (overrides generic templates)
    // =====================================================================

    [contentKey("management", "mgmt-1")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "The proxy lists Tim Cook as CEO plus the CFO and other top officers, with short bios on where they worked before.\n\nCook's background is operations, supply chain and scale, which fits how Apple actually wins.\n\nAsk whether today's leaders match today's fights: Services growth, regulation, and new bets like Vision and AI."
        },
        "card-2": {
          plainEnglishAnswer:
            "Cook has run Apple since 2011, a long stretch for a consumer hardware giant.\n\nMany lieutenants have been there for years, which can mean steady execution or slow refresh if the bench never turns over.\n\nIf the CFO seat keeps changing with no clear reason, pay extra attention, finance churn is a louder alarm than random middle-manager turnover."
        },
        "card-3": {
          plainEnglishAnswer:
            "Under Cook, Apple piled up cash, bought back mountains of stock, and grew Services into a much bigger, higher-margin business.\n\nThey also navigated China tension and App Store fights.\n\nCompare what leadership promised a few years ago, iPhone cadence, Services growth, margins, to what the numbers actually delivered, not just keynote hype."
        }
      }
    },

    [contentKey("management", "mgmt-quiz")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Top Apple leaders usually hold a lot of stock through RSUs and PSUs, check the proxy ownership table.\n\nSelling some shares for taxes is normal; a pattern of dumping stock while results slide is worth a raised eyebrow."
        },
        "card-2": {
          plainEnglishAnswer:
            "Line up how the stock and profits did versus how CEO pay moved in the proxy.\n\nA great compounder should not pay like a lottery ticket after one lucky iPhone cycle, pay should track long-term per-share value."
        },
        "card-3": {
          plainEnglishAnswer:
            "Base salary is small next to stock grants and bonus plans tied to performance tests.\n\nLook at how much is equity, what triggers vesting, and whether executives must hold shares, that tells you what the board really rewards."
        },
        "card-4": {
          plainEnglishAnswer:
            "The proxy lists which numbers drive annual bonuses, revenue, profit, cash flow, sometimes relative stock performance.\n\nSee if targets look hard versus last year's actuals or like easy wins for management."
        }
      }
    },

    [contentKey("management", "mgmt-2")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Apple brings in massive cash from selling devices and Services.\n\nLeadership decides where it goes: factories and stores, R&D, small acquisitions, dividends, and stock buybacks.\n\nThe real test is whether those choices still look smart if phone upgrades stretch longer."
        },
        "card-2": {
          plainEnglishAnswer:
            "Apple pays a dividend and buys back huge amounts of its own stock.\n\nIt also uses debt even with a big cash pile, similar to keeping savings while still financing big projects.\n\nWatch whether cash returns stay funded by normal business cash flow, not one-time windfalls."
        }
      }
    },

    [contentKey("management", "mgmt-governance")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Apple's board includes independent directors alongside insiders; the proxy explains independence determinations and any relationships.\n\nIndependence is not a guarantee of great oversight, but it is a baseline hygiene factor for a company of Apple's scrutiny."
        },
        "card-2": {
          plainEnglishAnswer:
            "Apple's committees mirror large-cap best practice: audit, compensation, nominating/corporate governance (names vary slightly by year).\n\nAudit oversees financial reporting and controls; comp sets pay; nominating handles board refreshment and governance policies, investors read charters for teeth, not titles."
        },
        "card-3": {
          plainEnglishAnswer:
            "Apple discloses related-party transactions where material (and routine commercial relationships can look 'related' in footnotes).\n\nThe investor job is not moralism, it is whether transactions look arm's length, well explained, and unlikely to tunnel value away from minority shareholders."
        },
        "card-4": {
          plainEnglishAnswer:
            "Apple's proxy includes standard change-in-control and severance themes for executives; investors compare multiples and equity acceleration to peers.\n\nLarge parachutes can be justified to retain talent, or can reward failure if performance hurdles are weak; Apple is judged like any mega-cap here."
        }
      }
    },

    [contentKey("management", "mgmt-financial-strength")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Apple routinely reports very large cash + marketable securities balances versus operating needs, one reason the company is often described as having a fortress balance sheet.\n\nStill pair cash with liabilities, purchase commitments, and cyclicality: cash is only strength if it is truly unencumbered and stable through a shock."
        },
        "card-2": {
          plainEnglishAnswer:
            "Apple carries real debt even with a huge cash balance.\n\nThat can spread out big payments while cash earns interest in the meantime.\n\nCheck whether debt maturities look manageable and interest costs stay easy to cover in a slow year."
        },
        "card-3": {
          plainEnglishAnswer:
            "Apple usually turns a large share of each sale into cash, and Services helps on that front.\n\nAsk what happens if iPhone upgrades slow or a big region cools off.\n\nStrength means the company can still fund priorities without panic moves."
        }
      }
    },

    [contentKey("management", "management-summary")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Cook has run Apple for years with a deep bench and a board that mostly looks independent on paper.\n\nPay is heavy on stock, and the company has returned huge cash while growing Services.\n\nVerdict: mostly trust, but watch the next CEO plan and whether App Store fights stay managed without hurting the brand."
        }
      }
    }
  }
};
