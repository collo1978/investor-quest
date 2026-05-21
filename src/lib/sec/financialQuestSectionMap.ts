import type { FinancialsQuestSlug } from "@/app/financials/financialsQuestSlugs";
import { FINANCIALS_QUEST_SLUGS } from "@/app/financials/financialsQuestSlugs";
import type { SecFilingFormType } from "@/lib/sec/types";

export type FinancialQuestCardSpec = {
  questSlug: FinancialsQuestSlug;
  cardId: string;
  formType: SecFilingFormType;
  sectionKeys: readonly string[];
  /** Card-specific instruction appended to the quest-level aiTask. */
  promptFocus: string;
};

export const FINANCIAL_QUEST_CARD_SPECS: readonly FinancialQuestCardSpec[] = [
  {
    questSlug: "growth",
    cardId: "card-1",
    formType: "10-K",
    sectionKeys: ["item_7", "item_8"],
    promptFocus:
      "ONLY total company revenue over the last three fiscal years — big-picture speed of growth. Do not list product lines or regions."
  },
  {
    questSlug: "growth",
    cardId: "card-2",
    formType: "10-K",
    sectionKeys: ["item_7", "item_8"],
    promptFocus:
      "ONLY revenue by product/service line (iPhone, Services, Mac, etc.). Do not repeat the three-year total revenue ladder from card-1."
  },
  {
    questSlug: "growth",
    cardId: "card-3",
    formType: "10-K",
    sectionKeys: ["item_8", "item_7", "item_1"],
    promptFocus:
      "ONLY revenue by geography/region. Note the biggest regions and any country concentration risk. Do not repeat product mix."
  },
  {
    questSlug: "profitability",
    cardId: "card-1",
    formType: "10-K",
    sectionKeys: ["item_8", "item_7"],
    promptFocus:
      "Describe whether gross and operating margins are improving or shrinking over recent years and why."
  },
  {
    questSlug: "profitability",
    cardId: "card-2",
    formType: "10-K",
    sectionKeys: ["item_8"],
    promptFocus:
      "ONLY earnings per share (EPS) — explain in plain English, compare years honestly, and mention share buybacks only if they explain EPS vs profit."
  },
  {
    questSlug: "expenses",
    cardId: "card-1",
    formType: "10-K",
    sectionKeys: ["item_7", "item_8"],
    promptFocus:
      "ONLY whether day-to-day running costs (operating expenses) are growing faster or slower than sales — R&D and SG&A as % of revenue."
  },
  {
    questSlug: "expenses",
    cardId: "card-2",
    formType: "10-K",
    sectionKeys: ["item_7", "item_8"],
    promptFocus:
      "ONLY money spent to build the future (R&D, capex, big investments). Do not re-open total operating expense dollars from card-1."
  },
  {
    questSlug: "cash",
    cardId: "card-1",
    formType: "10-K",
    sectionKeys: ["item_8"],
    promptFocus:
      "ONLY cash generated from running the business (operating cash flow) year to year. Do NOT mention buybacks, dividends, or debt."
  },
  {
    questSlug: "cash",
    cardId: "card-2",
    formType: "10-K",
    sectionKeys: ["item_8", "item_7"],
    promptFocus:
      "ONLY where cash went: buybacks, dividends, capex, debt payments. Do not re-explain operating cash flow totals from card-1."
  },
  {
    questSlug: "financial-strength",
    cardId: "card-1",
    formType: "10-K",
    sectionKeys: ["item_8"],
    promptFocus:
      "Compare cash and investments vs total debt; state whether the company is net cash or net debt."
  },
  {
    questSlug: "financial-strength",
    cardId: "card-2",
    formType: "10-K",
    sectionKeys: ["item_8"],
    promptFocus:
      "List the most important financial obligations: debt maturities, leases, purchase commitments, pensions, or contingencies."
  }
] as const;

export function getFinancialCardSpecs(
  questSlug?: FinancialsQuestSlug
): FinancialQuestCardSpec[] {
  if (!questSlug) return [...FINANCIAL_QUEST_CARD_SPECS];
  return FINANCIAL_QUEST_CARD_SPECS.filter((s) => s.questSlug === questSlug);
}

export function isFinancialsQuestSlugValue(
  value: string
): value is FinancialsQuestSlug {
  return (FINANCIALS_QUEST_SLUGS as readonly string[]).includes(value);
}

/** Minimum 10-K sections required before Financial Quest generation can run. */
export const FINANCIAL_REQUIRED_10K_SECTION_KEYS = ["item_7", "item_8"] as const;
