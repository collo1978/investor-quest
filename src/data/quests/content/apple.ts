/**
 * Apple (AAPL) — hand-authored quest content overrides.
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
    [contentKey("business", "revenue")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Apple makes most of its money from:\n• iPhone\n• Mac\n• iPad\n• Wearables like Apple Watch and AirPods\n\nIt also earns recurring revenue from services such as:\n• App Store\n• Apple Music\n• iCloud\n• Apple TV+\n• Apple Pay\n\nThe iPhone remains Apple's biggest revenue driver.\n\nSimple version\nApple sells premium devices, then keeps customers connected through its software and services ecosystem.",
          investorInsight:
            "Apple's services business matters because recurring revenue is more stable than hardware cycles — it compounds as the installed base grows."
        },
        "card-2": {
          plainEnglishAnswer:
            "Apple sells products and services globally.\n\nIts major markets include:\n• Americas\n• Europe\n• Greater China\n• Japan\n• Rest of Asia Pacific\n\nApple depends heavily on international sales and global consumer demand."
        },
        "card-3": {
          plainEnglishAnswer:
            "Apple mainly sells to:\n• everyday consumers\n• professionals\n• students\n• businesses\n• developers using its ecosystem\n\nIts customers are generally willing to pay premium prices for quality, simplicity, and ecosystem integration."
        }
      },
      quizConfig: {
        passThreshold: 0.66,
        questions: [
          {
            kind: "odd-one-out",
            id: "revenue-q1",
            prompt:
              "Three of these are real Apple revenue sources. Pick the odd one out.",
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
              "Apple's Services line — App Store, iCloud, Apple Music, Apple TV+, Apple Pay — provides recurring revenue that compounds on top of one-time hardware sales."
          }
        ]
      }
    },
    [contentKey("business", "operations")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Apple sells products through:\n• Apple retail stores\n• online stores\n• telecom carriers\n• wholesalers\n• third-party retailers\n\nIts supply chain includes manufacturing partners, logistics networks, and global distribution systems.\n\nApple also uses digital platforms to distribute services and software updates directly to customers."
        },
        "card-2": {
          plainEnglishAnswer:
            "Apple employs a large global workforce across:\n• engineering\n• retail\n• operations\n• software\n• design\n• marketing\n• leadership\n\nThe company relies heavily on skilled talent, innovation, and operational execution."
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
              "Imagine one of Apple's key manufacturing partners is hit by a major disruption. What's the most reasonable investor concern?",
            choices: [
              "Zero impact — Apple's revenue is unrelated to manufacturing",
              "Production delays could affect supply, sales, and margins",
              "Apple's services revenue automatically triples",
              "iPhones suddenly become free to make"
            ],
            correctIndex: 1,
            explain:
              "Apple depends on manufacturing partners as a core part of its operations. A disruption can ripple into supply, sales, and margins — which is exactly why supply-chain concentration is something investors watch."
          },
          {
            kind: "true-false",
            id: "operations-q3",
            prompt:
              "Apple's products only reach customers through Apple's own retail stores.",
            correct: false,
            explain:
              "Apple sells through Apple retail stores, online stores, telecom carriers, wholesalers, and third-party retailers — a deliberately broad channel mix that helps reduce reliance on any single one."
          }
        ]
      }
    },
    [contentKey("business", "advantage")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Apple invests heavily in research and development to improve:\n• hardware\n• software\n• artificial intelligence\n• chips\n• ecosystem integration\n• future products\n\nThis helps Apple continue innovating and improving customer experience."
        },
        "card-2": {
          plainEnglishAnswer:
            "Apple benefits from:\n• a globally recognized brand\n• patents and intellectual property\n• proprietary chips and software\n• ecosystem lock-in\n• customer loyalty\n\nIts ecosystem makes it harder for customers to switch to competitors."
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
              "Apple's moat is layered: proprietary tech (chips and software), ecosystem lock-in (products that work together), and brand power (a globally recognised name customers trust)."
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
              "R&D is how Apple stays ahead — across hardware, software, AI, chips, and the ecosystem. It's a key reason competitors find Apple hard to catch."
          }
        ]
      }
    },
    [contentKey("business", "industry")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Apple competes with companies such as:\n• Samsung\n• Google\n• Microsoft\n• Amazon\n• Huawei\n• Sony\n\nCompetition varies across smartphones, computers, wearables, services, and entertainment."
        },
        "card-2": {
          plainEnglishAnswer:
            "The technology industry is highly competitive and changes rapidly.\n\nCompanies compete on:\n• price\n• innovation\n• ecosystem\n• design\n• software\n• user experience\n\nNew technologies and changing consumer preferences can quickly impact market leaders."
        },
        "card-3": {
          plainEnglishAnswer:
            "Apple faces regulations involving:\n• privacy\n• app store practices\n• competition laws\n• international trade\n• taxes\n• data security\n\nGovernments around the world continue increasing scrutiny on large technology companies."
        }
      },
      quizConfig: {
        passThreshold: 0.66,
        questions: [
          {
            kind: "scenario",
            id: "industry-q1",
            prompt:
              "Imagine a new regulation forces Apple to allow alternative app stores on iPhone. What's the most reasonable investor concern?",
            choices: [
              "Apple's App Store revenue could shrink if developers and users move to other stores",
              "Apple instantly gets free worldwide advertising",
              "iPhone becomes illegal to sell",
              "Apple's hardware revenue automatically triples"
            ],
            correctIndex: 0,
            explain:
              "App Store practices are one of Apple's most-regulated areas. Forced alternatives could reduce the fees Apple collects from in-app purchases — exactly the kind of regulation that increases costs or limits operations."
          },
          {
            kind: "odd-one-out",
            id: "industry-q2",
            prompt:
              "Three of these are real Apple competitors mentioned in the cards. Pick the odd one out.",
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
              "The opposite is true — tech is highly competitive and changes fast. Companies compete on price, innovation, ecosystem, design, software, and user experience all at once."
          }
        ]
      }
    },
    [contentKey("business", "snapshot")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Apple designs and sells iPhone, Mac, iPad, Apple Watch, AirPods, and related accessories.\n\nApple also earns money from services like iCloud, Apple Music, Apple TV+, the App Store, Apple Pay, and other digital services.\n\nIn simple terms: Apple sells premium devices and then keeps customers connected through its software and services ecosystem."
        },
        "card-2": {
          plainEnglishAnswer:
            "Apple helps people communicate, work, create, stay entertained, manage their digital life, and stay connected.\n\nIts products are designed to work together smoothly, so customers can move easily between devices and services.\n\nIn simple terms: Apple makes technology feel easier, more useful, and more connected."
        },
        "card-3": {
          plainEnglishAnswer:
            "Apple is one of the largest technology companies in the world.\n\nIt sells products and services globally, has a huge customer base, and its iPhone remains its biggest product category.\n\nIts Services business has also become a major recurring revenue engine."
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
              "That's the heart of Apple's ecosystem — iPhone, Mac, iPad, Apple Watch, AirPods and services are all designed to feel seamless together, which is exactly what keeps customers loyal."
          },
          {
            kind: "multiple-choice",
            id: "snapshot-q2",
            prompt:
              "Which part of Apple's business has become a major recurring revenue engine?",
            choices: [
              "Cloud computing for enterprises",
              "Services — iCloud, App Store, Apple Music, Apple TV+, Apple Pay",
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
              "Hardware gets customers in the door; Services (App Store, iCloud, Music, TV+, Pay) keep them paying over time — that's the ecosystem investors watch."
          }
        ]
      }
    },

    // =====================================================================
    // Financials pillar (placeholder demo content for MVP)
    //
    // Numbers below are illustrative placeholders aligned with Apple's
    // publicly reported figures around FY21-FY23. They are not a substitute
    // for live filings — replace via the SEC -> AI pipeline when it ships.
    // =====================================================================

    [contentKey("financials", "growth")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Apple's revenue trend over the last three reported years:\n• FY2021 — ~$365 billion\n• FY2022 — ~$394 billion (record high)\n• FY2023 — ~$383 billion (slight pullback)\n\nThat works out to a modest mid-single-digit growth rate over three years on top of a very large base. For a company already over $380B in revenue, single-digit growth is normal — the math gets harder the bigger you get."
        },
        "card-2": {
          plainEnglishAnswer:
            "A rough product-mix split of Apple's revenue:\n• iPhone — ~52%\n• Services (App Store, iCloud, Music, TV+, AppleCare, payments) — ~22%\n• Wearables, Home & Accessories (Watch, AirPods, HomePod) — ~10%\n• Mac — ~8%\n• iPad — ~8%\n\niPhone is still the centre of gravity, but the most interesting trend is Services — it has grown roughly double-digit every year and now carries significantly higher margins than hardware."
        },
        "card-3": {
          plainEnglishAnswer:
            "A rough geographic split of Apple's revenue:\n• Americas — ~43%\n• Europe — ~25%\n• Greater China — ~19%\n• Japan — ~6%\n• Rest of Asia Pacific — ~7%\n\nApple is genuinely global — no single region dominates beyond the Americas, and Greater China is large enough that headlines about Chinese demand often move the stock."
        }
      },
      quizConfig: {
        passThreshold: 0.66,
        questions: [
          {
            kind: "bull-bear",
            id: "growth-q1",
            prompt:
              "Apple's revenue grew from ~$365B in FY21 to ~$383B in FY23 — mid-single-digit growth on a giant base.",
            caption: "Take a stance",
            correct: "bull",
            labels: { bull: "Bullish", bear: "Bearish" },
            explain:
              "For a company already over $380B in revenue, mid-single-digit growth is solid — at that scale, every percentage point is tens of billions of dollars. Compare it to most peers and you'll see why investors lean bullish."
          },
          {
            kind: "multiple-choice",
            id: "growth-q2",
            prompt:
              "Which product line is Apple's single largest source of revenue?",
            choices: ["Mac", "Services", "iPhone", "Wearables"],
            correctIndex: 2,
            explain:
              "iPhone is still roughly half of Apple's total revenue. Services is the fastest-growing segment, but iPhone is the engine that funds everything else — for now."
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
              "Diversified geography and fast-growing Services are clear strengths. Concentration risks — heavy exposure to a single country (China) and a single product (iPhone) — are the offsetting warnings investors should keep on their dashboard."
          }
        ]
      }
    },

    [contentKey("financials", "profitability")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Apple's profit margins have been gradually improving:\n• Gross margin — ~42% (FY21) → ~44-46% (FY23). Up.\n• Operating margin — ~30% range, holding or modestly improving.\n\nThe quiet driver behind the upward trend is mix: Services revenue carries dramatically higher gross margin (~70%) than hardware (~35%). Every dollar of Services growth pulls the company-wide margin up a little."
        },
        "card-2": {
          plainEnglishAnswer:
            "Yes — Apple's earnings per share has grown faster than net income.\n• FY21 diluted EPS — ~$5.61\n• FY22 diluted EPS — ~$6.11\n• FY23 diluted EPS — ~$6.13\n\nTwo levers are working at once: profits are growing slowly, and Apple's aggressive buyback program is shrinking the share count by ~3-4% a year. Fewer slices means each slice is bigger — even when the whole pie is barely changing."
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
              "Services carries roughly 70% gross margin vs. ~35% for hardware. As Services grows faster than hardware, the blended company margin drifts up — exactly what the income statement has been showing."
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
              "Apple's margin is protected by brand, ecosystem, and Services mix — but no margin is permanent. 'Low' (not 'very low') is the honest read: regulatory pressure on the App Store, smartphone demand cycles, or supply-chain shocks could each take a bite."
          },
          {
            kind: "fill-blank",
            id: "profitability-q3",
            prompt:
              "Apple's EPS often grows faster than its net income because aggressive _____ reduce the share count.",
            options: ["buybacks", "dividends", "tax credits", "acquisitions"],
            correctIndex: 0,
            explain:
              "Apple has been buying back ~3-4% of its shares every year for a decade. Fewer shares = each share earns a bigger slice of profit — that's why EPS rises even when net income is roughly flat."
          }
        ]
      }
    },

    [contentKey("financials", "expenses")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Apple's operating expenses (R&D + SG&A) have grown roughly in step with the business, not faster:\n• Total opex — around $55B per year today, up from ~$45B three years ago.\n• R&D — ~$30B (up from ~$22B)\n• SG&A — ~$25B (relatively flat)\n\nBecause revenue grew by a similar percentage, operating margin held steady. The fact that R&D rose faster than SG&A is actually a good sign — Apple is leaning into future products, not just paying for overhead."
        },
        "card-2": {
          plainEnglishAnswer:
            "Yes. Apple's main growth investment buckets are:\n• R&D — ~$30B per year (Apple Silicon, Vision Pro, AI, health, Services infra)\n• Capex — ~$10-12B per year (data centers, retail, manufacturing tooling)\n• Acquisitions — small, tuck-in deals\n\nR&D in particular has more than doubled over the last decade. Whether the bets pay off depends on what you think of Apple Silicon, Vision Pro, and the company's AI roadmap — but the *willingness* to invest is clearly there."
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
              "R&D outpacing revenue isn't automatically bad — it can mean Apple is investing ahead of a product cycle. The right first question is *what* the money is buying. If you can point to specific bets (Apple Silicon, Vision Pro, AI), it's growth investment; if not, it's cost creep."
          },
          {
            kind: "match",
            id: "expenses-q2",
            prompt:
              "Match each expense bucket to what it actually does for Apple.",
            pairs: [
              {
                left: "R&D",
                right: "Fund tomorrow's products — chips, AI, new categories."
              },
              {
                left: "Selling, general & admin",
                right:
                  "Run the day-to-day — marketing, retail, corporate overhead."
              },
              {
                left: "Capex",
                right:
                  "Build the physical capacity — data centers, stores, manufacturing tools."
              }
            ],
            explain:
              "R&D builds the future. SG&A keeps the present running. Capex is the bricks and silicon that everything else depends on. A healthy company funds all three — and Apple does."
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
            "Yes — Apple's operating cash flow has held in the very strong $100B+ per year range over the last three years.\n\n• Operating cash flow — ~$104B (FY21) → ~$122B (FY22) → ~$110B (FY23)\n• Net income tracks closely, which is a sign earnings quality is high.\n\nThe lumpiness quarter-to-quarter is mostly working-capital noise (inventory and payables timing). The trailing 12-month trend is what matters — and that trend is steady-to-up."
        },
        "card-2": {
          plainEnglishAnswer:
            "Apple deploys cash with a clear hierarchy:\n• Share buybacks — ~$80-90B per year (biggest by far)\n• R&D — ~$30B per year\n• Dividends — ~$15B per year\n• Capex — ~$10-12B per year\n• M&A — small, tuck-in only\n\nThe headline: Apple returns more than $90B a year to shareholders via buybacks + dividends. Critics say it should be more aggressive on M&A (especially in AI). Supporters argue the discipline is part of what made the stock such a strong compounder."
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
              "Huge, consistent cash generation that lines up with reported earnings is a textbook bullish signal — it means profits are real and there's plenty of fuel for buybacks, dividends, and reinvestment."
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
              "Real estate flipping"
            ],
            oddIndex: 3,
            explain:
              "Apple's cash goes mainly to buybacks, dividends, R&D, capex, and small acquisitions. Real estate flipping is not part of the playbook."
          },
          {
            kind: "order",
            id: "cash-q3",
            prompt:
              "Drag Apple's annual cash uses into order — biggest at the top, smallest at the bottom.",
            steps: [
              "Share buybacks (~$80-90B)",
              "R&D (~$30B)",
              "Dividends (~$15B)",
              "Capex (~$10-12B)"
            ],
            explain:
              "Buybacks dominate — Apple is one of the most aggressive buyback companies in history. R&D comes next, then dividends, then capex. Understanding this hierarchy tells you what management really prioritises."
          }
        ]
      }
    },

    [contentKey("financials", "financial-strength")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Apple actually carries both — but cash and investments are bigger than debt.\n\n• Cash + short-term investments — ~$60-70B\n• Long-term marketable securities — ~$100B+\n• Long-term debt — ~$100B\n\nMost of the debt was issued cheaply during the low-rate years. On a *net* basis (assets minus debt), Apple is close to zero or slightly positive — and it generates ~$100B of free cash flow every year on top of that. The balance sheet is genuinely strong."
        },
        "card-2": {
          plainEnglishAnswer:
            "Beyond long-term debt, Apple's biggest other obligations are:\n• Operating leases — primarily its global retail-store footprint and corporate offices\n• Manufacturing purchase commitments — multi-year deals with key suppliers (chips, displays, etc.)\n• Deferred revenue and warranty obligations — money owed in services not yet delivered\n• Supplier financing arrangements — short-term, but worth tracking\n\nNone of these are alarming on their own. They're disclosed in the 10-K footnotes — and on the scale of Apple's cash generation, all of them combined still leave the company comfortably solvent."
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
              "Apple has more liquid assets than total long-term debt and generates ~$100B of free cash flow a year. Balance-sheet risk here is genuinely 'very low' — the realistic risks for Apple sit in competition and regulation, not solvency."
          },
          {
            kind: "true-false",
            id: "financial-strength-q2",
            prompt:
              "Apple's cash plus marketable investments are larger than its long-term debt.",
            correct: true,
            explain:
              "Cash + short-term investments (~$60-70B) plus long-term marketable securities (~$100B+) comfortably exceed long-term debt (~$100B). That's why investors talk about Apple's *net* debt position — and why it stays comfortably negative or near zero."
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
    // Forces pillar — Inside / Outside paths (placeholder demo content)
    // =====================================================================

    [contentKey("forces", "inside-forces")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Apple runs one of the tightest consumer-hardware operations on earth — but it is not risk-free.\n\n• Scale + vertical integration help: Apple designs its own silicon (A-series, M-series), controls retail and online channels, and negotiates from a position of strength with suppliers.\n• Operational risks investors watch: launch execution (new iPhone cycles), quality control at massive volume, and concentration in a handful of mega-suppliers for key components.\n\nFor Apple specifically, the bull case on operations is that its supply chain discipline and brand allow it to absorb shocks better than smaller peers. The bear case is that *any* mis-execution at iPhone scale is expensive — one bad cycle hits revenue immediately."
        },
        "card-2": {
          plainEnglishAnswer:
            "Apple's supply chain is legendary — and famously concentrated.\n\n• Manufacturing is heavily outsourced (notably final assembly in Asia) with multi-year purchase commitments for chips, displays, memory, and optics.\n• Positive read: those commitments lock in capacity when demand is hot.\n• Negative read: disruption at a single critical supplier (or geopolitical friction in a key region) can ripple into product availability and margins faster than at a more distributed manufacturer.\n\nInvestors don't ask whether Apple *has* supply-chain risk — they ask whether the company is diversified *enough* across partners and geographies to survive the next shock."
        },
        "card-3": {
          plainEnglishAnswer:
            "Technology is the product at Apple — which makes cyber and platform risk existential rather than back-office.\n\n• Positives: deep in-house security engineering, tight hardware–software integration, and a services layer (iCloud, App Store, Apple Pay) that benefits from Apple's control of the stack.\n• Negatives: high-profile breach or App Store policy blowback could damage trust overnight; regulators globally scrutinise Apple's platform rules.\n\nFor investors, the key is not 'Does Apple use computers?' — it's whether outages, attacks, or policy reversals could materially hit revenue or multiple."
        },
        "card-4": {
          plainEnglishAnswer:
            "Apple's financial profile is a core part of the bull thesis: enormous cash generation, a fortress balance sheet, and aggressive capital return.\n\n• Positives: ~$100B+ annual free cash flow (ballpark recent years), huge cash and marketable securities, and access to cheap debt if needed.\n• Negatives: debt is still ~$100B — manageable, but not zero; FX swings matter because revenue is global; any sustained revenue decline would test the buyback math.\n\nThe investor question is simple: if revenue stalls for two years, does Apple still have room to invest *and* return cash without stressing the balance sheet? Today, the answer is generally yes — but that's the lens."
        },
        "card-5": {
          plainEnglishAnswer:
            "Apple's brand is arguably its single most valuable intangible — premium positioning, extreme loyalty, and pricing power.\n\n• Positive impact: customers upgrade on cycles even when competitors discount; Services attach rates climb because the hardware base is sticky.\n• Negative impact: brand damage from product-safety issues, App Store disputes, or major privacy mis-steps could erode trust — and in consumer electronics, trust *is* demand.\n\nInvestors watch NPS-style signals indirectly through retention, Services growth, and pricing — but the honest answer is that brand risk for Apple is about tail events, not everyday volatility."
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
              "Services is now a very large, high-margin business — and iCloud is part of the trust fabric for the whole ecosystem. A serious breach could hurt both revenue and the premium multiple."
          },
          {
            kind: "scenario",
            id: "inside-forces-q2",
            prompt:
              "Imagine Apple's largest display supplier suddenly cannot ship panels for one quarter. What's the most reasonable investor takeaway?",
            choices: [
              "Supply shocks cannot affect Apple because it has infinite inventory",
              "Near-term revenue and mix could be pressured until supply recovers",
              "Apple automatically doubles Android market share",
              "Debt covenants force an immediate bankruptcy filing"
            ],
            correctIndex: 1,
            explain:
              "Even Apple concentrates some critical components. A panel shortage is a classic 'execution + supply chain' shock — it can delay launches, skew mix, and hit margins until supply normalises."
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
              "Rising warranty accruals *plus* rising returns often precedes quality or demand issues — exactly the kind of internal execution signal investors dig into first."
          }
        ]
      }
    },

    [contentKey("forces", "outside-forces")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Smartphones and PCs are brutally competitive — but Apple competes mostly at the premium tier where share is smaller but profit pools are deeper.\n\n• Key rivals: Samsung, Google (Pixel + Android ecosystem), Chinese OEMs in various price tiers, and Microsoft on productivity/cross-device.\n• Bull angle: differentiation via silicon, ecosystem lock-in, and retail experience.\n• Bear angle: premium share is still share — if Android closes the camera/performance gap at lower prices, upgrade cycles can lengthen."
        },
        "card-2": {
          plainEnglishAnswer:
            "Apple is one of the most scrutinised platforms on earth — App Store rules, payments, defaults, and privacy all draw regulatory attention in the US, EU, UK, and beyond.\n\n• Positive read: settlements and rule changes can *clarify* the roadmap and reduce uncertainty.\n• Negative read: forced sideloading, lower take-rates, or browser-engine mandates could compress high-margin Services economics over time.\n\nInvestors model regulatory outcomes as distribution shifts: not always catastrophic, but rarely free."
        },
        "card-3": {
          plainEnglishAnswer:
            "Apple is globally diversified — which means it inherits global macro sensitivity.\n\n• Demand shocks: consumer weakness in China or Europe hits high-end handset cycles; strong USD hurts reported revenue from overseas.\n• Cost shocks: memory pricing, freight, and energy matter at the margin.\n\nThe reason macro matters for Apple specifically is scale: a few points of revenue growth lost to macro is tens of billions of dollars — enough to change the narrative even if operations are perfect."
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
              "App Store economics are an *external* legal/regulatory battle — exactly the kind of force that can compress take-rates without Apple 'mis-executing' operationally."
          },
          {
            kind: "odd-one-out",
            id: "outside-forces-q2",
            prompt: "Pick the odd one out — three are classic *external* forces.",
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
    // Management pillar — Apple demo answers (overrides generic templates)
    // =====================================================================

    [contentKey("management", "mgmt-1")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Apple's DEF 14A names Tim Cook as CEO, the current CFO and other named executive officers, with short bios — always read the latest proxy for the exact roster.\n\nCook's background is famously operations-heavy (IBM, Intelligent Electronics, Compaq) before Apple — relevant because Apple's edge is supply chain + product cadence at massive scale.\n\nInvestor takeaway: Apple's bench is deep, but the key question is whether the leadership team matches the company's current chapter (Services scale, regulation, and new product bets) — not just whether resumes look impressive."
        },
        "card-2": {
          plainEnglishAnswer:
            "Cook has been CEO since 2011 — an unusually long runway for a mega-cap consumer hardware leader.\n\nMany other senior leaders have multi-year (sometimes multi-decade) Apple tenure, which can mean strong culture and execution discipline — but also risks group-think if refresh is too slow.\n\nWatch CFO / retail / operations transitions: frequent unexplained churn in finance leadership is a bigger yellow flag for Apple than normal tech turnover in middle management."
        },
        "card-3": {
          plainEnglishAnswer:
            "Outcomes investors usually cite for the Cook era: enormous cash generation, a world-class balance sheet, aggressive buybacks, and expansion of Services revenue and margin — alongside navigating US–China tensions and multiple regulatory battles.\n\nThe honest test is the same as any company: compare prior-year promises (SKU cadence, Services growth narrative, margin guardrails) to what shipped in numbers — not just keynote headlines."
        }
      }
    },

    [contentKey("management", "mgmt-quiz")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Apple executives typically hold meaningful equity through RSUs/PSUs and historically have shown significant ownership versus many peers.\n\nStill read Form 4s: planned sales for taxes/diversification are normal — what you are hunting for is a pattern of net selling into weakness without clear explanation, or ownership requirements that look weak relative to pay."
        },
        "card-2": {
          plainEnglishAnswer:
            "Compare Apple's total shareholder return and operating performance (revenue, gross margin, Services mix) to the trend in reported CEO pay and incentive outcomes in the proxy CD&A.\n\nApple's bull narrative is often 'great business compounding' — the governance check is whether pay stays tethered to long-term per-share value creation, not a single lucky iPhone cycle."
        },
        "card-3": {
          plainEnglishAnswer:
            "Apple's pay design is typical of large-cap tech: base salary is modest versus total comp; the real package is equity with performance tests on annual cash incentives.\n\nRead for equity vs. cash mix, PSU metrics (revenue, operating income, relative TSR, etc.), holding periods, and clawbacks — those details tell you what the board optimises for."
        },
        "card-4": {
          plainEnglishAnswer:
            "Apple's CD&A spells out the metrics used for annual cash incentives (and how targets compare year to year).\n\nInvestors often focus on whether metrics reward durable fundamentals (profitability, revenue quality) versus short-term optics — and whether targets look challenging vs. last year's actuals."
        }
      }
    },

    [contentKey("management", "mgmt-2")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Apple historically generates enormous operating cash flow and then allocates among: capex ( fabs, tooling, retail), R&D, acquisitions (usually small bolt-ons), dividends, and buybacks.\n\nThe bull case is disciplined reinvestment at high returns plus returning excess cash. The bear case to watch is whether buybacks remain attractive if growth slows or valuation stretches."
        },
        "card-2": {
          plainEnglishAnswer:
            "Apple pays a growing dividend and runs large buybacks — but investors should net buybacks against stock-based compensation dilution and watch the debt stack (Apple uses debt tactically despite huge cash).\n\nThe key question is whether cash returns are funded sustainably by free cash flow, not one-time items."
        }
      }
    },

    [contentKey("management", "mgmt-governance")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Apple's board includes independent directors alongside insiders; the proxy explains independence determinations and any relationships.\n\nIndependence is not a guarantee of great oversight — but it is a baseline hygiene factor for a company of Apple's scrutiny."
        },
        "card-2": {
          plainEnglishAnswer:
            "Apple's committees mirror large-cap best practice: audit, compensation, nominating/corporate governance (names vary slightly by year).\n\nAudit oversees financial reporting and controls; comp sets pay; nominating handles board refreshment and governance policies — investors read charters for teeth, not titles."
        },
        "card-3": {
          plainEnglishAnswer:
            "Apple discloses related-party transactions where material (and routine commercial relationships can look 'related' in footnotes).\n\nThe investor job is not moralism — it is whether transactions look arm's length, well explained, and unlikely to tunnel value away from minority shareholders."
        },
        "card-4": {
          plainEnglishAnswer:
            "Apple's proxy includes standard change-in-control and severance themes for executives; investors compare multiples and equity acceleration to peers.\n\nLarge parachutes can be justified to retain talent — or can reward failure if performance hurdles are weak; Apple is judged like any mega-cap here."
        }
      }
    },

    [contentKey("management", "mgmt-financial-strength")]: {
      cards: {
        "card-1": {
          plainEnglishAnswer:
            "Apple routinely reports very large cash + marketable securities balances versus operating needs — one reason the company is often described as having a fortress balance sheet.\n\nStill pair cash with liabilities, purchase commitments, and cyclicality: cash is only strength if it is truly unencumbered and stable through a shock."
        },
        "card-2": {
          plainEnglishAnswer:
            "Apple carries meaningful total debt even with huge cash — a treasury strategy (term out liabilities, term out yield on cash).\n\nInvestors watch net cash/net debt, maturities, fixed vs. floating mix, and interest coverage. Apple's scale usually makes refinancing risk manageable — but it is not 'zero debt'."
        },
        "card-3": {
          plainEnglishAnswer:
            "Apple's operations historically convert a large share of revenue into cash — the Services mix also helps margins.\n\nStress questions: what happens to free cash flow if iPhone cycles elongate or China demand weakens? Strength is whether the business can self-fund priorities without panicking into dilution or destructive leverage."
        }
      }
    }
  }
};
