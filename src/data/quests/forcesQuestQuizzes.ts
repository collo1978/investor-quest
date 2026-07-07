import type { ForcesCategoryId } from "@/data/quests/forcesCategories";
import type { QuizConfig } from "@/data/quests/types";

/** Category deck quiz — unlocks after all topics in the quadrant are read. */
const PASS = 0.66 as const;

export const FORCES_CATEGORY_QUEST_QUIZZES: Record<ForcesCategoryId, QuizConfig> = {
  "positive-inside": {
    passThreshold: PASS,
    questions: [
      {
        kind: "true-false",
        id: "f-pi-q1",
        prompt:
          "{Company.name} relies on specialist contract manufacturers to produce its chips.",
        correct: true,
        explain:
          "Internal strengths include technology design and cash — manufacturing partners handle production."
      },
      {
        kind: "multiple-choice",
        id: "f-pi-q2",
        prompt:
          "Which inside strength did you just explore for {Company.name}?",
        choices: [
          "Something the company controls — supply, tech, cash, or brand",
          "Only the weather",
          "A rival's logo",
          "The stock ticker color"
        ],
        correctIndex: 0,
        explain:
          "Positive inside forces are about what {Company.name} can control from within the business."
      },
      {
        kind: "scenario",
        id: "f-pi-q3",
        prompt:
          "Launch delays and slower chips start showing up in products. Who might notice before Wall Street headlines?",
        choices: [
          "Customers using the products day to day",
          "Only people who never use the tech",
          "Nobody — products never signal trouble",
          "Only logo designers"
        ],
        correctIndex: 0,
        explain:
          "Slow chips, messy launches, or weak trust often show up in products before they show up in headlines."
      }
    ]
  },
  "positive-outside": {
    passThreshold: PASS,
    questions: [
      {
        kind: "true-false",
        id: "f-po-q1",
        prompt:
          "Strong demand for AI chips can lift {Company.name}'s sales.",
        correct: true,
        explain:
          "Outside demand boosts still matter — more AI spending can mean more chip orders."
      },
      {
        kind: "multiple-choice",
        id: "f-po-q2",
        prompt: "A positive OUTSIDE force for {Company.name} is…",
        choices: [
          "More companies racing to build AI and buy chips",
          "The CEO's favorite coffee",
          "Office paint color",
          "How many logos they have"
        ],
        correctIndex: 0,
        explain:
          "Outside forces come from the world around {Company.name} — demand, policy, geography — not inside the building."
      },
      {
        kind: "fill-blank",
        id: "f-po-q3",
        prompt:
          "Complete the sentence:\nA market tailwind can ___ even when {Company.name} still runs the business well.",
        options: ["fade", "last forever", "ban rivals", "replace products"],
        correctIndex: 0,
        explain:
          "Outside boosts aren't permanent — demand can cool while the company is still doing its job."
      }
    ]
  },
  "negative-inside": {
    passThreshold: PASS,
    questions: [
      {
        kind: "true-false",
        id: "f-ni-q1",
        prompt:
          "Product launch delays can hurt {Company.name}'s results quickly.",
        correct: true,
        explain:
          "Self-inflicted or internal problems can hit trust and sales before rivals even move."
      },
      {
        kind: "multiple-choice",
        id: "f-ni-q2",
        prompt: "Which is an inside risk you mapped for {Company.name}?",
        choices: [
          "A mess-up, supply jam, cyber hit, or cash squeeze",
          "The moon phase",
          "A competitor's ad campaign only",
          "Sunrise time in California"
        ],
        correctIndex: 0,
        explain:
          "Negative inside forces are problems {Company.name} might create or control — not distant weather alone."
      },
      {
        kind: "red-flag",
        id: "f-ni-q3",
        prompt: "Biggest inside red flag for {Company.name}?",
        choices: [
          "Repeated launch delays or broken trust with buyers",
          "Strong cash and on-time chips",
          "Coders already know their tools",
          "Global sales spread"
        ],
        flagIndex: 0,
        explain:
          "Patterns of mess-ups or trust hits scare customers away — that's an inside red flag."
      }
    ]
  },
  "negative-outside": {
    passThreshold: PASS,
    questions: [
      {
        kind: "true-false",
        id: "f-no-q1",
        prompt:
          "New export restrictions can limit {Company.name}'s sales in key markets.",
        correct: true,
        explain:
          "Outside threats can cut orders, block markets, or push prices down even when the team executes well."
      },
      {
        kind: "multiple-choice",
        id: "f-no-q2",
        prompt: "Which outside headwind could hit {Company.name}?",
        choices: [
          "Rivals catching up, export bans, or buyers pausing orders",
          "Better office chairs",
          "A new font on the website",
          "More break rooms"
        ],
        correctIndex: 0,
        explain:
          "Negative outside forces come from competition, policy, macro — not from redecorating HQ."
      },
      {
        kind: "scenario",
        id: "f-no-q3",
        prompt:
          "New export rules block chip sales to a huge market overnight. What is the realistic takeaway?",
        choices: [
          "Policy can move the stock without a product miss",
          "Regulation never affects large companies",
          "Rivals automatically disappear",
          "Revenue must triple the next day"
        ],
        correctIndex: 0,
        explain:
          "Policy can block sales overnight — that's outside force hitting the business for real."
      }
    ]
  }
};

/** @deprecated Use FORCES_CATEGORY_QUEST_QUIZZES — kept for catalog validator import name. */
export const FORCES_QUEST_QUIZZES = FORCES_CATEGORY_QUEST_QUIZZES;
